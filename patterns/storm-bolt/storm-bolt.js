/*
 * storm-bolt.js: in every .storm, a WebGL fragment shader on its .sb-canvas draws a storm cloud with
 * slanting rain, and now and then a forked lightning bolt flickers inside it.
 *   <div class="storm" data-sb-strikes="3">
 *     <canvas class="sb-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="sb-pause" aria-pressed="false" hidden>Pause</button>
 *   </div>
 * Colours come from --sb-sky, --sb-glow and --sb-bolt (6 digit hex), the same ones the CSS fallback uses.
 * Flash safety: strikes are at least 3.6 s apart, each one two short pulses (so never 3 flashes in a
 * second), the bolt is a thin line and the cloud glow round it adds at most about a fifth of the glow
 * colour, so the lit area stays small and the change in brightness modest.
 * The maths: each channel of the bolt (the main stroke and two forks) is a zigzag x(s), s the distance
 * down the channel: two octaves of random values read from a 64 x 64 texture and joined by straight
 * lines, so the slope is known exactly and the distance to the stroke is |x - x(s)| / sqrt(1 + slope^2).
 * The forks start on the main stroke (JS works out where, from the same random bytes). The cloud is three
 * octaves of value noise drifting on a circle; rain is one streak per random cell of a slanted grid.
 * Time runs on a Web Animations clock ("storm"), so the gallery timeline and the Pause button stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame (a dim bolt, no flicker) is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 12000;   // one loop of strikes, rain and cloud drift, ms: the clock period
  var TIMES = { 1: [2400], 2: [2400, 8400], 3: [2400, 6200, 9800] };   // strike times in the loop, ms (gaps 3.6 s or more)
  var VARIANTS = 12;

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_s;",       // px per scene unit
    "uniform vec4 u_m;",        // main stroke: start x, start y, length, lean
    "uniform vec4 u_b1;",       // fork one: start x, start y, length, lean
    "uniform vec4 u_b2;",       // fork two
    "uniform vec3 u_row;",      // texture rows of the three channels
    "uniform float u_i;",       // bolt brightness, 0 to 1
    "uniform float u_f;",       // cloud flash, 0 to 1
    "uniform vec2 u_off;",      // cloud drift, texels, on a circle
    "uniform vec2 u_rain;",     // rain offset: whole cells (mod 64), fraction
    "uniform vec3 u_sky;",
    "uniform vec3 u_glow;",
    "uniform vec3 u_bolt;",
    "uniform sampler2D u_rnd;", // 64 x 64 random bytes, linear, repeat
    "float g(float x){ x = min(abs(x), 6.0); return exp(-x * x); }",
    // one random value, read at a texel centre so the linear filter returns it exactly
    "float rv(float i, float row){ return texture2D(u_rnd, vec2((mod(i, 64.0) + 0.5) / 64.0, row)).g; }",
    "float vn(vec2 q){ vec2 i = floor(q); vec2 f = q - i; f = f * f * (3.0 - 2.0 * f); return texture2D(u_rnd, (i + f + 0.5) / 64.0).r; }",
    // zigzag of a channel: value and exact slope at s
    "vec2 zig(float s, float row){",
    "  float a = s * 9.0; float i = floor(a); float f = a - i;",
    "  float v0 = rv(i, row), v1 = rv(i + 1.0, row);",
    "  float b = s * 31.0; float j = floor(b); float e = b - j;",
    "  float w0 = rv(j + 23.0, row), w1 = rv(j + 24.0, row);",
    "  return vec2((mix(v0, v1, f) - 0.5) * 0.11 + (mix(w0, w1, e) - 0.5) * 0.03,",
    "              (v1 - v0) * 0.99 + (w1 - w0) * 0.93);",
    "}",
    // light from one channel at p: x = core, y = halo
    "vec2 chan(vec2 p, vec4 c, float row, float fade){",
    "  float s = c.y - p.y;",
    "  if (s < -0.02 || s > c.z + 0.05) return vec2(0.0);",
    "  vec2 z = zig(max(s, 0.0), row);",
    // slope capped: on a nearly flat zig the true distance is not a horizontal one, and an uncapped
    // divide would smear the halo sideways
    "  float sl = min((c.w + z.y) * (c.w + z.y), 4.0);",
    "  float d = abs(p.x - c.x - c.w * s - z.x) / sqrt(1.0 + sl);",
    "  float t = clamp(s / c.z, 0.0, 1.0);",
    "  float k = (1.0 - fade * t) * (1.0 - smoothstep(0.85, 1.0, t)) * smoothstep(-0.02, 0.0, s);",
    "  return vec2(g(d / 0.0042), exp(-d * 38.0) * 0.32 + exp(-d * 8.0) * 0.07) * k;",
    "}",
    "void main(){",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_s;",
    "  float top = 0.5 * u_res.y / u_s;",
    "  float hgt = clamp((p.y + top) / (2.0 * top), 0.0, 1.0);",
    "  vec2 q = vec2(p.x * 1.2, p.y * 2.3) + u_off;",
    "  float cloud = vn(q * 2.0) * 0.55 + vn(q * 4.3 + 7.0) * 0.3 + vn(q * 9.1 + 13.0) * 0.15;",
    "  cloud = smoothstep(0.3, 0.8, cloud);",
    // dark bellies, lighter tops, a little lift low down where the rain curtain is
    "  vec3 col = u_sky * (0.62 + 0.55 * cloud) + u_glow * 0.09 * cloud * hgt;",
    "  col *= 0.86 + 0.2 * hgt;",
    // the strike lights the cloud round the top of the bolt, at most about a fifth of the glow colour
    "  vec2 fa = vec2(u_m.x, min(u_m.y, top) - 0.12);",
    "  col += u_glow * u_f * (0.06 + 0.16 * cloud) * exp(-length((p - fa) * vec2(1.0, 1.4)) * 2.6);",
    // rain: one streak in some cells of a slanted grid that slides down
    "  vec2 rq = vec2(p.x * 64.0 + p.y * 14.0, p.y * 6.0 + u_rain.y);",
    "  vec2 id = floor(rq); vec2 rf = rq - id;",
    "  float rr = texture2D(u_rnd, (mod(id + vec2(0.0, u_rain.x), 64.0) + 0.5) / 64.0).b;",
    "  float rain = step(0.78, rr) * g((rf.x - 0.5) / 0.14) * smoothstep(0.0, 0.4, rf.y) * (1.0 - smoothstep(0.55, 0.95, rf.y));",
    "  col += u_glow * rain * (0.07 + 0.12 * u_f) * (0.4 + 0.6 * (1.0 - hgt));",
    // the bolt: main stroke and two forks
    "  vec2 l = chan(p, u_m, u_row.x, 0.25) + chan(p, u_b1, u_row.y, 0.7) * 0.6 + chan(p, u_b2, u_row.z, 0.7) * 0.45;",
    "  col += u_bolt * u_i * (l.x * 0.92 + l.y) + u_glow * u_i * l.y * 0.4;",
    "  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  // random bytes from a fixed seed, so every load draws the same storm; JS reads them too, for the forks
  var BYTES = new Uint8Array(64 * 64 * 4);
  (function () { var seed = 20261109; for (var i = 0; i < BYTES.length; i++) { seed = (seed * 1103515245 + 12345) >>> 0; BYTES[i] = seed >>> 24; } })();
  function rv(i, row) { i = ((Math.floor(i) % 64) + 64) % 64; return BYTES[(row * 64 + i) * 4 + 1] / 255; }
  function zig(s, row) {
    var a = s * 9, i = Math.floor(a), f = a - i, b = s * 31, j = Math.floor(b), e = b - j;
    return (rv(i, row) + (rv(i + 1, row) - rv(i, row)) * f - 0.5) * 0.11 + (rv(j + 23, row) + (rv(j + 24, row) - rv(j + 23, row)) * e - 0.5) * 0.03;
  }

  function setup(root) {
    var canvas = root.querySelector(".sb-canvas");
    if (!canvas || canvas.sbOn) return;
    canvas.sbOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".sb-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, S = 1;
    var clock = null, paused = false, raf = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var times = TIMES[Math.max(1, Math.min(3, Math.round(+root.getAttribute("data-sb-strikes") || 3)))];
    var sky, glow, bolt;
    // the bolt in use: 12 numbers for the three channels, plus its variant
    var B = new Float32Array(12), shown = -1;

    function colours() {
      var cs = getComputedStyle(root);
      sky = hex(cs.getPropertyValue("--sb-sky"), [0.1, 0.14, 0.17]);
      glow = hex(cs.getPropertyValue("--sb-glow"), [0.56, 0.64, 0.72]);
      bolt = hex(cs.getPropertyValue("--sb-bolt"), [0.93, 0.95, 1]);
    }

    // lay out bolt number v (0 to 11) for the current size: seeded, so each variant always looks the same
    function plan(v) {
      var seed = 7919 * (v + 1);
      function rnd() { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; }
      var top = 0.5 * h / S, half = 0.5 * w / S;
      var x0 = (0.3 + 0.62 * rnd() - 0.5) * 2 * half, y0 = top + 0.03;
      var len = rnd() < 0.6 ? 2 * top + 0.1 : (0.55 + 0.25 * rnd()) * 2 * top;
      var lean = (rnd() - 0.5) * 0.5, r0 = v * 3, side = rnd() < 0.5 ? -1 : 1;
      B[0] = x0; B[1] = y0; B[2] = len; B[3] = lean;
      var s1 = (0.2 + 0.2 * rnd()) * len, s2 = (0.45 + 0.2 * rnd()) * len;
      // a fork starts on the main stroke; its own zigzag is shifted so it starts at 0 there
      B[4] = x0 + lean * s1 + zig(s1, r0) - zig(0, r0 + 1); B[5] = y0 - s1; B[6] = (0.15 + 0.15 * rnd()) * 2 * top; B[7] = side * (0.6 + 0.4 * rnd());
      B[8] = x0 + lean * s2 + zig(s2, r0) - zig(0, r0 + 2); B[9] = y0 - s2; B[10] = (0.1 + 0.12 * rnd()) * 2 * top; B[11] = -side * (0.5 + 0.4 * rnd());
      shown = v;
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("storm-bolt shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("storm-bolt link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "s", "m", "b1", "b2", "row", "i", "f", "off", "rain", "sky", "glow", "bolt", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, BYTES);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.uniform1i(U.rnd, 0);
      return true;
    }

    function now() { return clock && clock.currentTime != null ? clock.currentTime : 2400; }
    // flash level at loop time t: two short pulses per strike, the second weaker
    function draw(ms, still) {
      if (!prog || lost || !w) return;
      var t = ms % PERIOD, loop = Math.floor(ms / PERIOD), k = -1, dt = 1e9, bi = 0, fl = 0;
      for (var n = 0; n < times.length; n++) if (t >= times[n]) k = n;
      if (k < 0) { k = times.length - 1; loop -= 1; dt = t + PERIOD - times[k]; } else dt = t - times[k];
      var v = ((k + 3 * loop) % VARIANTS + VARIANTS) % VARIANTS;
      if (still) { v = 4; bi = 0.5; fl = 0.2; }
      else if (dt < 1600) {
        var p1 = Math.exp(-dt / 55), p2 = dt < 170 ? 0 : 0.7 * Math.exp(-(dt - 170) / 110);
        fl = Math.max(p1, p2);
        // the channel fades slowly after the pulses: no flash, just a dimming line
        bi = Math.min(1, fl + 0.3 * Math.exp(-dt / 600));
      }
      if (v !== shown) plan(v);
      var a = (t / PERIOD) * 6.2831853, rain = (t / PERIOD) * 128;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.s, S);
      gl.uniform4f(U.m, B[0], B[1], B[2], B[3]);
      gl.uniform4f(U.b1, B[4], B[5], B[6], B[7]);
      gl.uniform4f(U.b2, B[8], B[9], B[10], B[11]);
      gl.uniform3f(U.row, (v * 3 + 0.5) / 64, (v * 3 + 1.5) / 64, (v * 3 + 2.5) / 64);
      gl.uniform1f(U.i, bi);
      gl.uniform1f(U.f, fl);
      gl.uniform2f(U.off, 2 * Math.cos(a), 2 * Math.sin(a));
      gl.uniform2f(U.rain, Math.floor(rain) % 64, rain - Math.floor(rain));
      gl.uniform3f(U.sky, sky[0], sky[1], sky[2]);
      gl.uniform3f(U.glow, glow[0], glow[1], glow[2]);
      gl.uniform3f(U.bolt, bolt[0], bolt[1], bolt[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      S = Math.min(h, 0.75 * w);
      shown = -1;
      colours();
      if (reduce.matches) still(); else { draw(now(), false); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && !paused; }
    function kick() { if (!raf && live()) { if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(ts) {
      raf = 0;
      if (!live()) return;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = ts;
        else if (++frames === 30) { checked = true; if ((ts - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      draw(now(), false);
      raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      draw(2400, true);
    }

    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      draw(now(), false);
      kick();
    }
    function sync() {
      if (reduce.matches) {
        if (clock) { clock.cancel(); clock = null; }
        if (btn) btn.hidden = true;
        still();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: PERIOD, iterations: Infinity });
        clock.id = "storm";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      kick();
    }

    if (!build()) return;
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      canvas.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; if (build()) fit(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", function () { sync(); if (!reduce.matches) fit(); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); if (reduce.matches) still(); else draw(now(), false); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".storm").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
