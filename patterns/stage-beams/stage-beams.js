/*
 * stage-beams.js: in every .beams, a WebGL fragment shader on its .sb-canvas draws moving spotlight
 * beams that sweep through stage haze from a lighting truss, pool light on the floor, and edge the
 * heads of a crowd in silhouette.
 *   <section class="beams" data-sb-beams="4">
 *     <canvas class="sb-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="sb-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --sb-base, --sb-a and --sb-b (6 digit hex), the same ones the CSS fallback uses.
 * The maths: each beam is a ray from its fixture at an angle made of sines of the clock angle. For a
 * pixel, the distance along the ray and across it give a Gaussian cone that widens with distance and
 * fades with the inverse square. Two octaves of value noise (read from a 64 x 64 random texture with
 * linear filtering on smoothstepped coordinates) make the haze; the noise coordinates move round a
 * circle, so the haze drifts and the loop has no seam. The crowd is one head (a circle) and shoulders
 * per grid cell, sized by the same random texture.
 * Time runs on a Web Animations clock ("beam sweep"), so the gallery timeline and the Pause button
 * both stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 48000;   // one full sweep cycle of the beams, ms: the clock period
  var STILL = 2.2;      // the clock angle of the reduced motion frame

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_a;",       // 0 to 2 pi over one loop
    "uniform float u_n;",       // number of beams, 2 to 6
    "uniform vec3 u_base;",
    "uniform vec3 u_ca;",
    "uniform vec3 u_cb;",
    "uniform sampler2D u_rnd;", // 64 x 64 random bytes, linear, repeat
    "vec4 rnd(vec2 id){ return texture2D(u_rnd, (mod(id, 64.0) + 0.5) / 64.0); }",
    // value noise: the texture's own linear filter, fed smoothstepped coordinates
    "float vn(vec2 x){ vec2 i = floor(x); vec2 f = x - i; f = f * f * (3.0 - 2.0 * f); return texture2D(u_rnd, (i + f + 0.5) / 64.0).r; }",
    "void main(){",
    "  vec2 p = gl_FragCoord.xy / u_res.y;",
    "  float asp = u_res.x / u_res.y;",
    // haze: two octaves, their offsets go round circles in noise space
    "  vec2 o1 = vec2(cos(u_a), sin(u_a)) * 1.7;",
    "  vec2 o2 = vec2(cos(u_a * 2.0), -sin(u_a * 2.0)) * 1.3;",
    "  float hz = vn(p * vec2(2.2, 3.4) + o1) * 0.65 + vn(p * vec2(5.0, 7.5) + o2 + 9.0) * 0.35;",
    "  hz = 0.15 + 1.5 * hz * hz;",
    "  vec3 light = (u_ca + u_cb) * 0.025 * hz;",
    "  for (int i = 0; i < 6; i++) {",
    "    float fi = float(i);",
    "    if (fi >= u_n) break;",
    "    float t = (fi + 0.5) / u_n;",
    "    vec2 src = vec2(asp * (0.1 + 0.8 * t), 1.03);",
    // angle from straight down: outer beams lean in, each sweeps on its own whole multiple of the clock
    "    float th = (0.5 - t) * 0.55 + 0.42 * sin(u_a * (1.0 + mod(fi, 3.0)) + fi * 1.9);",
    "    vec2 dir = vec2(sin(th), -cos(th));",
    "    vec2 d = p - src;",
    "    float al = dot(d, dir);",
    "    float lat = d.x * dir.y - d.y * dir.x;",
    "    float w = 0.008 + max(al, 0.0) * 0.055;",
    "    float cone = exp(-lat * lat / (w * w)) * step(0.0, al);",
    "    vec3 c = mix(u_ca, u_cb, mod(fi, 2.0));",
    "    light += c * cone * hz * 1.1 / (1.0 + al * al * 1.4);",
    "    light += c * exp(-dot(d, d) * 700.0) * 1.6;",
    // where the beam meets the stage floor: a flat pool of light
    "    float xh = src.x + dir.x * (src.y - 0.1) / max(-dir.y, 0.2);",
    "    vec2 q = vec2((p.x - xh) / (0.07 + 0.12 * abs(dir.x)), (p.y - 0.1) / 0.03);",
    "    light += c * exp(-dot(q, q)) * 0.55;",
    "  }",
    "  vec3 col = u_base + (1.0 - exp(-light * 1.25));",
    // truss: a dark bar along the top
    "  col = mix(col, u_base * 0.6, step(0.985, p.y) * 0.85);",
    // the crowd in silhouette: a head and shoulders per cell, a few hands up
    "  float g = p.x * 24.0; float id = floor(g); float fx = g - id - 0.5;",
    "  vec4 r = rnd(vec2(id, 7.0));",
    "  float hy = (0.065 + 0.03 * r.x) * 24.0;",
    "  float hx = (r.y - 0.5) * 0.3;",
    "  float y = p.y * 24.0;",
    "  float head = length(vec2(fx - hx, y - hy)) - 0.3;",
    "  float body = y - (hy - 0.22 - 0.9 * (fx - hx) * (fx - hx));",
    "  float ax = fx - hx - 0.3; float top = hy + 0.6 + 0.4 * r.w;",
    "  float hand = min(max(abs(ax) - 0.11, max(y - top, hy - 0.3 - y)), length(vec2(ax, y - top)) - 0.17);",
    "  float sil = min(min(head, body), r.z > 0.8 ? hand : 9.0);",
    "  float inside = 1.0 - smoothstep(-0.04, 0.04, sil);",
    "  float rim = (1.0 - smoothstep(0.0, 0.12, abs(head))) * step(hy, y);",
    "  col = mix(col, u_base * 0.45 + light * 0.12 * rim, inside);",
    "  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
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
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var count = Math.max(2, Math.min(6, Math.round(+root.getAttribute("data-sb-beams") || 4)));
    var base, ca, cb;

    function colours() {
      var cs = getComputedStyle(root);
      base = hex(cs.getPropertyValue("--sb-base"), [0.07, 0.04, 0.06]);
      ca = hex(cs.getPropertyValue("--sb-a"), [1, 0.7, 0.28]);
      cb = hex(cs.getPropertyValue("--sb-b"), [1, 0.31, 0.43]);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("stage-beams shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("stage-beams link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "a", "n", "base", "ca", "cb", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed (xorshift), so every load draws the same crowd and haze
      var bytes = new Uint8Array(64 * 64 * 4), s = 20261121;
      for (var i = 0; i < bytes.length; i++) { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; bytes[i] = (s >>> 8) & 255; }
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

    function angle() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD * 6.2831853 : STILL; }
    function render(a) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.a, a);
      gl.uniform1f(U.n, count);
      gl.uniform3f(U.base, base[0], base[1], base[2]);
      gl.uniform3f(U.ca, ca[0], ca[1], ca[2]);
      gl.uniform3f(U.cb, cb[0], cb[1], cb[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      colours();
      if (reduce.matches) still(); else { render(angle()); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && !paused; }
    function kick() { if (!raf && live()) { if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      render(angle());
      raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      render(STILL);
    }

    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      render(angle());
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
        clock.id = "beam sweep";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? STILL : angle()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".beams").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
