/*
 * dither-wave.js: in every .dither, a WebGL fragment shader on its .dw-canvas draws a slow moving
 * gradient in three inks with an ordered 4 x 4 (Bayer) dither, like a riso print or an old screen.
 * A pool of light follows the pointer (mouse, pen or a finger) with fine grooves in it, like a record.
 *   <section class="dither" data-dw-pixel="3">
 *     <canvas class="dw-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="dw-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --dw-ink, --dw-mid and --dw-paper (6 digit hex), the same ones the CSS fallback uses.
 * The maths: the gradient is two sines over a domain-warped plane (the plane is pushed by two more
 * sines before it is read), plus a Gaussian pool round the pointer. It is read once per dither cell,
 * at the cell centre. The Bayer matrix (0 8 2 10 / 12 4 14 6 / 3 11 1 9 / 15 7 13 5, over 16) sits in
 * a 4 x 4 texture; the cell picks its threshold t and its ink is floor(value x 2 + t): ink, mid or paper.
 * Time runs on a Web Animations clock ("dither drift"), so the gallery timeline and the Pause button
 * both stop it. When nobody points, the pool drifts on a slow path on the same clock.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 40000;   // one full loop of the gradient, ms: the clock period
  var STILL = 0.8;      // the clock angle of the reduced motion frame

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",        // drawing buffer, px
    "uniform float u_a;",         // 0 to 2 pi over one loop
    "uniform float u_px;",        // dither cell, buffer px
    "uniform vec2 u_ptr;",        // eased pointer, height units from the bottom left
    "uniform vec3 u_ink;",
    "uniform vec3 u_mid;",
    "uniform vec3 u_paper;",
    "uniform sampler2D u_bayer;", // 4 x 4 Bayer thresholds, nearest, repeat
    "void main(){",
    "  vec2 cell = floor(gl_FragCoord.xy / u_px);",
    "  vec2 p = (cell + 0.5) * u_px / u_res.y;",
    // warp the plane with two sines, then read two more sines off it
    "  vec2 w = p + 0.22 * vec2(sin(p.y * 3.1 + u_a * 2.0), cos(p.x * 2.3 - u_a * 3.0));",
    "  float v = 0.36 + 0.32 * sin(w.x * 2.4 - w.y * 1.6 + u_a) + 0.18 * sin(w.x * 1.1 + w.y * 3.3 - u_a * 2.0 + 1.0);",
    // the pool of light round the pointer, with fine grooves turning in it
    "  vec2 d = p - u_ptr; float g = exp(-dot(d, d) * 9.0);",
    "  v += g * (0.36 + 0.14 * sin(length(d) * 60.0 - u_a * 10.0));",
    "  float t = texture2D(u_bayer, (mod(cell, 4.0) + 0.5) / 4.0).r;",
    "  float k = clamp(floor(v * 2.0 + t), 0.0, 2.0);",
    "  vec3 col = k < 0.5 ? u_ink : (k < 1.5 ? u_mid : u_paper);",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function setup(root) {
    var canvas = root.querySelector(".dw-canvas");
    if (!canvas || canvas.dwOn) return;
    canvas.dwOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".dw-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var px = Math.max(2, Math.min(8, Math.round(+root.getAttribute("data-dw-pixel") || 3)));
    var lx = 0.7, ly = 0.5, tx = 0.7, ty = 0.5, pointerIn = false, pointerAt = -1e9;   // pointer as fractions of the box
    var ink, mid, paper;

    function colours() {
      var cs = getComputedStyle(root);
      ink = hex(cs.getPropertyValue("--dw-ink"), [0.1, 0.09, 0.08]);
      mid = hex(cs.getPropertyValue("--dw-mid"), [0.84, 0.27, 0.17]);
      paper = hex(cs.getPropertyValue("--dw-paper"), [0.94, 0.89, 0.81]);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("dither-wave shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("dither-wave link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "a", "px", "ptr", "ink", "mid", "paper", "bayer"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // the 4 x 4 Bayer matrix as thresholds (n + 0.5) / 16, one byte per texel
      var order = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], bytes = new Uint8Array(16);
      for (var i = 0; i < 16; i++) bytes[i] = order[i] * 16 + 8;
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 4, 4, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.uniform1i(U.bayer, 0);
      return true;
    }

    function angle() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD * 6.2831853 : STILL; }
    function render(a) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.a, a);
      gl.uniform1f(U.px, Math.round(px * scale));
      gl.uniform2f(U.ptr, lx * w / h, 1 - ly);
      gl.uniform3f(U.ink, ink[0], ink[1], ink[2]);
      gl.uniform3f(U.mid, mid[0], mid[1], mid[2]);
      gl.uniform3f(U.paper, paper[0], paper[1], paper[2]);
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
      var a = angle();
      if (!pointerIn && now - pointerAt > 1500) {
        // nobody is pointing: the pool drifts on a slow path, on the gradient's clock
        tx = 0.68 + 0.2 * Math.cos(a * 3); ty = 0.5 + 0.28 * Math.sin(a * 2);
      }
      var k = 1 - Math.exp(-dt / 260), dx = tx - lx, dy = ty - ly;
      lx += dx * k; ly += dy * k;
      render(a);
      if (!paused || Math.abs(dx) + Math.abs(dy) > 0.001) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      lx = 0.74; ly = 0.42;
      render(STILL);
    }

    function point(e) {
      if (reduce.matches) return;
      var b = root.getBoundingClientRect();
      tx = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width));
      ty = Math.max(0, Math.min(1, (e.clientY - b.top) / b.height));
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
        clock.id = "dither drift";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? STILL : angle()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".dither").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
