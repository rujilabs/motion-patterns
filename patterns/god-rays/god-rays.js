/*
 * god-rays.js: in every .godrays, a WebGL fragment shader on its .gr-canvas draws a morning valley:
 * the sun just behind a tree-lined ridge, layered hills of tea rows, drifting mist in the valleys, and
 * shafts of light falling through the gaps in the trees and the mist.
 *   <section class="godrays">
 *     <canvas class="gr-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="gr-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --gr-sky, --gr-sun, --gr-hill and --gr-mist (6 digit hex), the same ones the CSS
 * fallback uses; the sun's place from --gr-sun-at ("x y", fractions of the box from the top left).
 * The maths: the hills are sums of sines and a Gaussian bump under the sun; the trees on the ridge are
 * one crown (a half ellipse) per grid cell, some cells left empty, sized from a 64 x 64 random texture.
 * The rays are angular: from the sun toward each pixel, 8 samples just past the sun ask "is this
 * point open sky?" (above the ridge and trees) and "how thick is the mist here?". Their average is how
 * much of the sun gets through along that angle, so every gap between two crowns throws a shaft. The mist is value noise (the same texture, linear filtering
 * on smoothstepped coordinates) whose offsets go round circles in noise space, so it drifts, the rays
 * shift with it, and the loop has no seam.
 * Time runs on a Web Animations clock ("mist drift"), so the gallery timeline and the Pause button
 * both stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 90000;   // one full loop of the mist, ms: the clock period
  var STILL = 1.1;      // the clock angle of the reduced motion frame

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform float u_k;",       // the scene unit, px: the height, or 3/4 of the width on a tall box
    "uniform float u_a;",       // 0 to 2 pi over one loop
    "uniform vec2 u_s;",        // the sun, in scene units from the bottom left
    "uniform vec3 u_sky;",
    "uniform vec3 u_sun;",
    "uniform vec3 u_hill;",
    "uniform vec3 u_mist;",
    "uniform sampler2D u_rnd;", // 64 x 64 random bytes, linear, repeat
    "vec4 rnd(vec2 id){ return texture2D(u_rnd, (mod(id, 64.0) + 0.5) / 64.0); }",
    "float vn(vec2 x){ vec2 i = floor(x); vec2 f = x - i; f = f * f * (3.0 - 2.0 * f); return texture2D(u_rnd, (i + f + 0.5) / 64.0).r; }",
    // the far ridge, with a tree crown in most cells: this is what the sun hides behind
    "float ridge(float x){",
    "  float dx = (x - u_s.x) / 0.45;",
    "  float h = u_s.y - 0.17 + 0.12 * exp(-dx * dx) + 0.015 * sin(x * 7.0 + 1.3);",
    "  float g = x * 34.0; float id = floor(g); float f = g - id - 0.5;",
    "  vec4 r = rnd(vec2(id, 3.0));",
    "  float rad = 0.28 + 0.2 * r.z;",
    "  float c = max(0.0, 1.0 - f * f / (rad * rad));",
    "  return h + step(0.25, r.x) * (0.025 + 0.035 * r.y) * sqrt(c);",
    "}",
    "float mid(float x){ return u_s.y - 0.27 + 0.05 * sin(x * 2.3 + 0.4) + 0.03 * sin(x * 5.1 + 2.0); }",
    "float near(float x){ return u_s.y - 0.45 + 0.07 * sin(x * 1.7 + 2.6) + 0.02 * sin(x * 6.3); }",
    "float mist(vec2 q, vec2 o){ return vn(q * vec2(2.4, 7.0) + o); }",
    "void main(){",
    "  vec2 p = gl_FragCoord.xy / u_k;",
    "  vec2 o1 = vec2(cos(u_a), sin(u_a)) * 1.8;",
    "  vec2 o2 = vec2(cos(u_a * 2.0 + 1.0), sin(u_a * 2.0 + 1.0)) * 1.1 + 17.0;",
    // the rays: from the sun toward this pixel, how much of the sun's glow gets past the trees
    "  vec2 e = p - u_s; float sd = max(length(e), 0.0001);",
    "  vec2 v = e / sd;",
    "  float ray = 0.0;",
    "  for (int i = 1; i <= 8; i++) {",
    "    vec2 q = u_s + v * (0.007 * float(i));",
    "    float open = smoothstep(-0.002, 0.002, q.y - ridge(q.x));",
    "    ray += open * (1.0 - 0.6 * smoothstep(0.4, 0.8, mist(q * 3.0, o2)));",
    "  }",
    "  ray = ray / 8.0 * exp(-sd * 2.2) * (1.0 - 0.7 * smoothstep(-0.35, 0.25, v.y));",
    // sky, sun disc and glow
    "  vec3 top = mix(u_sky, vec3(0.55, 0.68, 0.8), 0.55);",
    "  vec3 air = mix(u_sky, top, smoothstep(u_s.y - 0.1, 1.15, p.y));",
    "  vec3 col = air + u_sun * (exp(-sd * 9.0) * 0.45 + (1.0 - smoothstep(0.036, 0.042, sd)) * 0.7);",
    // far ridge, then mist lying in front of it
    "  float r1 = ridge(p.x);",
    "  col = mix(col, mix(u_hill, air, 0.36), 1.0 - smoothstep(-0.002, 0.002, p.y - r1));",
    "  float hm = mid(p.x), hn = near(p.x);",
    "  float m1 = mist(p, o1) * 0.7 + mist(p * 2.1, o2) * 0.3;",
    "  col = mix(col, u_mist, smoothstep(0.25, 0.85, m1) * (1.0 - smoothstep(0.0, 0.14, p.y - hm)) * 0.7);",
    // the middle hill of tea rows
    "  float rows = 0.5 + 0.5 * sin((hm - p.y) * 210.0 + sin(p.x * 13.0) * 1.5);",
    "  vec3 midc = mix(u_hill, air, 0.26) * (0.88 + 0.2 * rows);",
    "  col = mix(col, midc, 1.0 - smoothstep(-0.002, 0.002, p.y - hm));",
    "  float m2 = mist(p * 1.3 + 5.0, o2) * 0.7 + mist(p * 2.7, o1) * 0.3;",
    "  col = mix(col, u_mist, smoothstep(0.3, 0.9, m2) * (1.0 - smoothstep(0.0, 0.12, p.y - hn)) * 0.8);",
    // the near hill: deeper rows, lit gold along its crest
    "  float rn = 0.5 + 0.5 * sin((hn - p.y) * 150.0 + sin(p.x * 9.0 + 1.0) * 2.0);",
    "  vec3 nearc = u_hill * (0.8 + 0.35 * rn) + u_sun * 0.35 * exp(-(hn - p.y) * 40.0);",
    "  col = mix(col, nearc, 1.0 - smoothstep(-0.002, 0.002, p.y - hn));",
    // light in the air, strongest where there is mist to catch it
    "  col += u_sun * ray * (0.42 + 0.8 * m1 * m1);",
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
    var canvas = root.querySelector(".gr-canvas");
    if (!canvas || canvas.grOn) return;
    canvas.grOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".gr-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var sx = 0.72, sy = 0.36, sky, sun, hill, mistC;

    function colours() {
      var cs = getComputedStyle(root);
      // the sun position is read here too, so a media query can move it
      var at = cs.getPropertyValue("--gr-sun-at").trim().split(/\s+/);
      sx = +at[0]; sy = +at[1];
      if (!(sx >= 0 && sx <= 1)) sx = 0.72;
      if (!(sy >= 0.1 && sy <= 0.6)) sy = 0.36;
      sky = hex(cs.getPropertyValue("--gr-sky"), [0.95, 0.89, 0.76]);
      sun = hex(cs.getPropertyValue("--gr-sun"), [1, 0.78, 0.38]);
      hill = hex(cs.getPropertyValue("--gr-hill"), [0.14, 0.25, 0.18]);
      mistC = hex(cs.getPropertyValue("--gr-mist"), [0.93, 0.95, 0.92]);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("god-rays shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("god-rays link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["k", "a", "s", "sky", "sun", "hill", "mist", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed (xorshift), so every load draws the same trees and mist
      var bytes = new Uint8Array(64 * 64 * 4), s = 20261110;
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
      var k = Math.min(h, w * 0.75);
      gl.uniform1f(U.k, k);
      gl.uniform1f(U.a, a);
      gl.uniform2f(U.s, sx * w / k, (1 - sy) * h / k);
      gl.uniform3f(U.sky, sky[0], sky[1], sky[2]);
      gl.uniform3f(U.sun, sun[0], sun[1], sun[2]);
      gl.uniform3f(U.hill, hill[0], hill[1], hill[2]);
      gl.uniform3f(U.mist, mistC[0], mistC[1], mistC[2]);
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
        clock.id = "mist drift";
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

  function init() { document.querySelectorAll(".godrays").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
