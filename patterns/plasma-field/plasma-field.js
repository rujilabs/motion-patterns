/*
 * plasma-field.js: in every .plasma, a WebGL fragment shader on its .pf-canvas draws a slow plasma glow
 * in two house colours, shown as an LED wall: round dots on a dark board, each lit by the plasma at its
 * centre, over a faint glow of the same plasma.
 *   <section class="plasma" data-pf-pitch="7">
 *     <canvas class="pf-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="pf-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --pf-base, --pf-a and --pf-b (6 digit hex), the same ones the CSS fallback uses.
 * The maths: the classic plasma, a sum of four sines (a horizontal wave, a turning wave, and two rings
 * round centres that wander on Lissajous paths), mapped through two phase-shifted sines into the two
 * colours. The LED wall samples it once per dot: floor() the pixel to the dot grid, take the value at
 * the dot centre, and cut a round dot with a smoothstep on the distance.
 * Time runs on a Web Animations clock ("plasma glow"), so the gallery timeline and the Pause button
 * both stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 120000;   // one full loop of the plasma, ms: the clock period

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_a;",       // 0 to 2 pi over one loop
    "uniform float u_pitch;",   // LED dot pitch, buffer px
    "uniform vec3 u_base;",
    "uniform vec3 u_ca;",
    "uniform vec3 u_cb;",
    // the plasma at p (height units): four sines, every time term a whole multiple of u_a
    "float plasma(vec2 p){",
    "  float v = sin(p.x * 4.0 + u_a * 3.0);",
    "  float r = u_a * 2.0;",
    "  v += sin(5.0 * (p.x * sin(r) + p.y * cos(r)) - u_a * 4.0);",
    "  vec2 c1 = vec2(0.5 * sin(u_a * 5.0), 0.35 * cos(u_a * 3.0));",
    "  v += sin(length(p - c1) * 7.0 - u_a * 6.0);",
    "  vec2 c2 = vec2(0.45 * cos(u_a * 4.0 + 1.0), 0.3 * sin(u_a * 7.0));",
    "  v += sin(length(p - c2) * 5.0 + u_a * 5.0);",
    "  return v * 0.25;",
    "}",
    "vec3 tint(float v){",
    "  float a = 0.5 + 0.5 * sin(v * 3.1416 * 1.5);",
    "  float b = 0.5 + 0.5 * sin(v * 3.1416 * 1.5 + 2.4);",
    "  return u_base + u_ca * smoothstep(0.45, 1.0, a) * 0.78 + u_cb * smoothstep(0.5, 1.0, b) * 0.72;",
    "}",
    "void main(){",
    "  vec2 g = gl_FragCoord.xy / u_pitch;",
    "  vec2 cell = floor(g);",
    "  vec2 f = g - cell - 0.5;",
    "  vec2 pc = ((cell + 0.5) * u_pitch - 0.5 * u_res) / u_res.y;",
    "  vec2 pp = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    "  vec3 led = tint(plasma(pc));",
    "  float dot1 = 1.0 - smoothstep(0.28, 0.42, length(f));",
    "  vec3 glow = tint(plasma(pp)) - u_base;",
    "  vec3 col = u_base * 0.6 + glow * 0.22 + (led - u_base * 0.6) * dot1;",
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
    var canvas = root.querySelector(".pf-canvas");
    if (!canvas || canvas.pfOn) return;
    canvas.pfOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".pf-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var pitch = Math.max(4, +root.getAttribute("data-pf-pitch") || 7);
    var base, ca, cb;

    function colours() {
      var cs = getComputedStyle(root);
      base = hex(cs.getPropertyValue("--pf-base"), [0.05, 0.06, 0.05]);
      ca = hex(cs.getPropertyValue("--pf-a"), [0.71, 1, 0.23]);
      cb = hex(cs.getPropertyValue("--pf-b"), [1, 0.35, 0.16]);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("plasma-field shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("plasma-field link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "a", "pitch", "base", "ca", "cb"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      return true;
    }

    function angle() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD * 6.2831853 : 0.7; }
    function render(a) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.a, a);
      gl.uniform1f(U.pitch, pitch * scale);
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
      render(0.7);
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
        clock.id = "plasma glow";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? 0.7 : angle()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".plasma").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
