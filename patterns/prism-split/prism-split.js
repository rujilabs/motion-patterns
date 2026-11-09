/*
 * prism-split.js: in every .prism, a WebGL fragment shader on its .ps-canvas draws a white beam that enters
 * a glass prism and leaves it as a spectrum fan. The fan swings toward the pointer (mouse, pen or a finger)
 * and the prism turns a little with it; when nobody points, it sways slowly on its own.
 *   <section class="prism">
 *     <canvas class="ps-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="ps-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --ps-room and --ps-glass (6 digit hex); --ps-x, --ps-y and --ps-size place the prism.
 * The maths: the prism is a signed distance field of an equilateral triangle (rim light from the distance,
 * glass fill inside). The beam path (in, through, out) is worked out in JS from the prism's corners; the
 * shader draws each leg as a Gaussian of the distance to a segment. The fan is polar round the exit point:
 * the angle from the fan's centre line picks the colour from three Gaussian bumps (red bends least, violet
 * most), and dust in the air is value noise read from a 64 x 64 random texture that drifts on a circle.
 * Time runs on a Web Animations clock ("prism dust"), so the gallery timeline and the Pause button stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 36000;   // one loop of the dust drift and the idle sway, ms: the clock period
  var K = 1.7320508;
  var BASE_OUT = -0.33; // fan centre angle (rad) when the prism is square to the beam
  var SPREAD = 0.42;    // fan width, rad

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_s;",       // px per scene unit
    "uniform vec2 u_c;",        // prism centre, scene units from the middle
    "uniform float u_r;",       // prism half side
    "uniform vec2 u_rot;",      // cos, sin of the prism turn
    "uniform vec2 u_in;",       // beam start (off the left edge)
    "uniform vec2 u_e;",        // entry point
    "uniform vec2 u_x;",        // exit point
    "uniform vec2 u_dir;",      // fan centre direction, unit
    "uniform vec2 u_off;",      // dust drift, texels, on a circle
    "uniform float u_ph;",      // shimmer phase, 0 to 2 pi
    "uniform vec3 u_room;",
    "uniform vec3 u_glass;",
    "uniform sampler2D u_rnd;", // 64 x 64 random bytes, linear, repeat
    // value noise: linear texture read on smoothstepped coordinates
    "float vn(vec2 q){ vec2 i = floor(q); vec2 f = q - i; f = f * f * (3.0 - 2.0 * f); return texture2D(u_rnd, (i + f + 0.5) / 64.0).r; }",
    "float g(float x){ x = min(abs(x), 6.0); return exp(-x * x); }",
    "float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }",
    "float tri(vec2 p, float r){",
    "  p.x = abs(p.x) - r; p.y = p.y + r / 1.7320508;",
    "  if (p.x + 1.7320508 * p.y > 0.0) p = vec2(p.x - 1.7320508 * p.y, -1.7320508 * p.x - p.y) / 2.0;",
    "  p.x -= clamp(p.x, -2.0 * r, 0.0);",
    "  return -length(p) * sign(p.y);",
    "}",
    // spectrum, t = 0 red (bent least) to 1 violet (bent most): a hue ramp, smoothstepped
    "vec3 spec(float t){",
    "  vec3 c = clamp(abs(mod(t * 4.6 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);",
    "  return c * c * (3.0 - 2.0 * c);",
    "}",
    "void main(){",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_s;",
    "  vec2 l = p - u_c; l = vec2(u_rot.x * l.x + u_rot.y * l.y, -u_rot.y * l.x + u_rot.x * l.y);",
    "  float d = tri(l, u_r);",
    "  float inside = 1.0 - smoothstep(-0.002, 0.002, d);",
    "  float dust = vn(p * 9.0 + u_off) * 0.6 + vn(p * 23.0 - u_off * 1.7) * 0.4;",
    // the room: a warm dark wall, a little lighter where the fan lands
    "  float vg = 1.0 - 0.35 * length((gl_FragCoord.xy / u_res - 0.5) * vec2(1.2, 1.0));",
    "  vec3 col = u_room * (0.8 + 0.4 * vg);",
    // beam in: white core plus a soft halo lit by the dust
    "  float b1 = seg(p, u_in, u_e);",
    "  col += vec3(1.0, 0.97, 0.9) * (g(b1 * 245.0) * 0.9 + g(b1 * 50.0) * (0.12 + 0.18 * dust)) * (1.0 - inside);",
    // the fan: polar round the exit point
    "  vec2 v = p - u_x;",
    "  float along = dot(v, u_dir);",
    "  float side = u_dir.x * v.y - u_dir.y * v.x;",
    "  float ang = atan(side, max(along, 0.0001));",
    "  float t = 0.5 - ang / " + SPREAD.toFixed(3) + ";",
    "  float wedge = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.88, 1.0, t)) * step(0.0, along);",
    "  float fall = exp(-along * 0.55) * (0.55 + 0.45 * exp(-along * 6.0));",
    "  float ray = vn(vec2(t * 26.0, 3.0));",
    "  float shimmer = 0.75 + 0.25 * sin(along * 16.0 - u_ph + ray * 6.2831);",
    "  col += spec(clamp(t, 0.0, 1.0)) * wedge * fall * (0.55 + 0.5 * dust) * shimmer * (1.0 - inside) * 1.35;",
    // the glass: a faint fill, darker at the base, a rim light, a streak on the left face
    "  float gy = clamp((l.y + u_r * 0.58) / (u_r * 1.73), 0.0, 1.0);",
    "  vec3 glass = mix(u_room, u_glass, 0.1 + 0.12 * gy);",
    // inside, the white ray already starts to split on its way to the exit face
    "  vec2 ex = u_x - u_e; float exl = length(ex); vec2 en = ex / exl; vec2 w = p - u_e;",
    "  float wa = dot(w, en); float wt = 0.5 - atan(en.x * w.y - en.y * w.x, max(wa, 0.0001)) / 0.09;",
    "  float core = g(seg(p, u_e, u_x) / 0.006);",
    "  vec3 inner = mix(vec3(1.0, 0.97, 0.9), spec(clamp(wt, 0.0, 1.0)), smoothstep(0.1, 0.9, wa / exl));",
    "  float innerMask = smoothstep(0.0, 0.2, wt) * (1.0 - smoothstep(0.8, 1.0, wt)) * step(0.0, wa);",
    "  glass += inner * max(core, innerMask * 0.55) * 0.75;",
    "  float rim = exp(-abs(d) * 600.0) * 0.55 + exp(-abs(d) * 90.0) * 0.08;",
    "  float streak = g((0.866 * l.x - 0.5 * l.y + 0.46 * u_r) / (u_r * 0.04)) * inside * smoothstep(-0.2 * u_r, 0.6 * u_r, l.y) * 0.3;",
    "  col = mix(col, glass, inside) + u_glass * (rim + streak);",
    // sparks where the light meets each face
    "  col += vec3(1.0, 0.96, 0.88) * (g(length(p - u_e) * 63.0) * 0.7 + g(length(v) * 55.0) * 0.6);",
    "  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  function num(v, f) { var n = parseFloat(v); return isFinite(n) ? n : f; }

  function setup(root) {
    var canvas = root.querySelector(".ps-canvas");
    if (!canvas || canvas.psOn) return;
    canvas.psOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".ps-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, S = 1;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var room, glass, px = 0.64, py = 0.46, size = 0.16, cx = 0, cy = 0;
    var phi = BASE_OUT, target = BASE_OUT, pointerIn = false, pointerAt = -1e9;

    function read() {
      var cs = getComputedStyle(root);
      room = hex(cs.getPropertyValue("--ps-room"), [0.08, 0.07, 0.05]);
      glass = hex(cs.getPropertyValue("--ps-glass"), [0.85, 0.93, 0.91]);
      px = num(cs.getPropertyValue("--ps-x"), 0.64);
      py = num(cs.getPropertyValue("--ps-y"), 0.46);
      size = num(cs.getPropertyValue("--ps-size"), 0.16);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("prism-split shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("prism-split link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "s", "c", "r", "rot", "in", "e", "x", "dir", "off", "ph", "room", "glass", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed, so every load draws the same dust
      var bytes = new Uint8Array(64 * 64 * 4), seed = 20261109;
      for (var i = 0; i < bytes.length; i++) { seed = (seed * 1103515245 + 12345) >>> 0; bytes[i] = seed >>> 24; }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.uniform1i(U.rnd, 0);
      return true;
    }

    function frac() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD : 0.2; }
    // a point on the prism, from local coordinates, turned by the prism turn: written into tmp
    var tmp = [0, 0];
    function world(lx, ly, c, s) { tmp[0] = cx + c * lx - s * ly; tmp[1] = cy + s * lx + c * ly; }
    function render(f) {
      if (!prog || lost || !w) return;
      var ro = (phi - BASE_OUT) * 0.4, c = Math.cos(ro), s = Math.sin(ro), r = size;
      var tx = 0, ty = 2 * r / K, lxb = -r, ryb = -r / K;
      // entry on the left face, exit on the right face, 0.58 of the way down from the apex
      world(tx + (lxb - tx) * 0.58, ty + (ryb - ty) * 0.58, c, s); var ex = tmp[0], ey = tmp[1];
      world(tx + (r - tx) * 0.58, ty + (ryb - ty) * 0.58, c, s); var xx = tmp[0], xy = tmp[1];
      var inA = -BASE_OUT; // the lamp sits low on the left, the beam rises into the glass
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.s, S);
      gl.uniform2f(U.c, cx, cy);
      gl.uniform1f(U.r, r);
      gl.uniform2f(U.rot, c, s);
      gl.uniform2f(U["in"], ex - Math.cos(inA) * 4, ey - Math.sin(inA) * 4);
      gl.uniform2f(U.e, ex, ey);
      gl.uniform2f(U.x, xx, xy);
      gl.uniform2f(U.dir, Math.cos(phi), Math.sin(phi));
      var a = f * 6.2831853;
      gl.uniform2f(U.off, 3 * Math.cos(a), 3 * Math.sin(a));
      gl.uniform1f(U.ph, ((f * 9) % 1) * 6.2831853);
      gl.uniform3f(U.room, room[0], room[1], room[2]);
      gl.uniform3f(U.glass, glass[0], glass[1], glass[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var b = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(b.width * scale)); h = Math.max(1, Math.round(b.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      read();
      S = Math.min(h, 0.75 * w);
      cx = (px - 0.5) * w / S; cy = (0.5 - py) * h / S;
      if (reduce.matches) still(); else { render(frac()); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog; }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      var f = frac();
      if (!pointerIn && now - pointerAt > 1500) target = BASE_OUT + 0.22 * Math.sin(f * 6.2831853 * 2);
      var k = 1 - Math.exp(-dt / 260), dp = target - phi;
      phi += dp * k;
      render(f);
      if (!paused || Math.abs(dp) > 0.001) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      phi = BASE_OUT - 0.08;
      render(0.2);
    }

    function point(e) {
      if (reduce.matches) return;
      var b = root.getBoundingClientRect();
      // pointer in scene units, then its angle from the prism's exit side
      var sx = ((e.clientX - b.left) / b.width - 0.5) * w / S, sy = (0.5 - (e.clientY - b.top) / b.height) * h / S;
      var a = Math.atan2(sy - cy, Math.max(sx - cx, 0.05));
      target = Math.max(-0.95, Math.min(0.2, a));
      pointerIn = true; pointerAt = performance.now();
      kick();
    }
    function leave() { pointerIn = false; pointerAt = performance.now(); kick(); }
    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
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
        clock.id = "prism dust";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      kick();
    }

    if (!build()) return;
    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", point);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { read(); render(reduce.matches ? 0.2 : frac()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".prism").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
