/*
 * paint-swirl.js: in every .paintswirl, a WebGL fragment shader on its .ps-canvas draws thick bands of
 * paint in five house colours, stirred into a slow vortex and printed in chunky square pixels.
 *   <section class="paintswirl" data-ps-pixel="4">
 *     <canvas class="ps-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="ps-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --ps-c0 to --ps-c4 (6 digit hex), the same ones the CSS fallback uses. The vortex
 * centre comes from --ps-at (two numbers, shares of the width and height), read on every resize.
 * The maths: value noise read from a 64 x 64 random texture (LINEAR filtering on smoothstepped
 * coordinates), three octaves of fbm, and a two step domain warp (the noise bends the coordinates fed to
 * the noise). The paint is cut into five spiral arms, t = 8 r + 5 theta / 2 pi + 3.2 (v - 0.5), where
 * theta is turned by a + 2.0 / (r + 0.4), so the arms wind tighter toward the centre and the warped value
 * v bends them. Five bands per turn put the same colour on both sides of atan's jump. Each band gets one
 * colour and a raised ridge along one edge, like a thick stroke.
 * Time runs on a Web Animations clock ("paint swirl") as an angle 0 to 2 pi: the vortex turns once and
 * the noise moves round a circle once per loop, so the loop is seamless. The gallery timeline and the
 * Pause button both stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 90000;   // one full turn of the vortex, ms: the clock period
  var STILL = 2.1;      // the angle drawn under reduced motion

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",        // drawing buffer, px
    "uniform float u_a;",         // 0 to 2 pi over one loop
    "uniform float u_pix;",       // paint pixel, buffer px
    "uniform vec2 u_at;",         // vortex centre, height units from the middle
    "uniform sampler2D u_rnd;",   // 64 x 64 random bytes, LINEAR, REPEAT
    "uniform vec3 u_c0;",
    "uniform vec3 u_c1;",
    "uniform vec3 u_c2;",
    "uniform vec3 u_c3;",
    "uniform vec3 u_c4;",
    // value noise: the hardware blends four random texels, at smoothstepped weights
    "float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return texture2D(u_rnd, (i + f + 0.5) / 64.0).r; }",
    "float fbm(vec2 p){ return (0.5 * vn(p) + 0.25 * vn(p * 2.03 + 11.7) + 0.125 * vn(p * 4.01 + 23.1)) / 0.875; }",
    "vec3 pal(float k){ return k < 0.5 ? u_c0 : k < 1.5 ? u_c1 : k < 2.5 ? u_c2 : k < 3.5 ? u_c3 : u_c4; }",
    "void main(){",
    "  vec2 cell = floor(gl_FragCoord.xy / u_pix);",
    "  vec2 p = ((cell + 0.5) * u_pix - 0.5 * u_res) / u_res.y - u_at;",
    "  float r = length(p);",
    // the stir: inner paint turns further than outer paint, and the whole pot turns once per loop
    "  float ang = u_a + 2.0 / (r + 0.4);",
    "  float c = cos(ang), s = sin(ang);",
    "  vec2 sp = vec2(c * p.x - s * p.y, s * p.x + c * p.y) * 1.7;",
    // a circle in noise space: the drift comes back to its start after one loop
    "  vec2 o = vec2(cos(u_a), sin(u_a)) * 1.3;",
    "  vec2 q = vec2(fbm(sp + o), fbm(sp + vec2(5.2, 1.3) - o));",
    "  float v = fbm(sp + 1.2 * q + vec2(-o.y, o.x) * 0.5);",
    // five spiral arms of paint (five bands per turn, so the seam at atan's jump lands on the same colour),
    // wound tighter toward the centre and bent by the warped noise
    "  float t = r * 8.0 + (atan(p.y, p.x) + ang) * 0.7958 + (v - 0.5) * 3.2;",
    "  float k = floor(t), f = t - k;",
    "  vec3 col = mix(pal(mod(k, 5.0)), pal(mod(k + 1.0, 5.0)), smoothstep(0.9, 1.0, f));",
    "  float ridge = (1.0 - smoothstep(0.0, 0.22, f)) * 0.22 - smoothstep(0.62, 0.9, f) * 0.16;",
    "  col *= 1.0 + ridge;",
    // a little bristle grain per paint pixel
    "  float grain = texture2D(u_rnd, (mod(cell, 64.0) + 0.5) / 64.0).g;",
    "  col *= 0.95 + 0.07 * grain;",
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
    var canvas = root.querySelector(".ps-canvas");
    if (!canvas || canvas.psOn) return;
    canvas.psOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".ps-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var pixel = Math.max(2, Math.min(12, +root.getAttribute("data-ps-pixel") || 4));
    var cols = [], atx = 0.68, aty = 0.5;
    var FALL = [[0.95, 0.9, 0.8], [0.84, 0.27, 0.18], [0.91, 0.71, 0.17], [0.12, 0.48, 0.47], [0.13, 0.19, 0.35]];

    function read() {
      var cs = getComputedStyle(root);
      for (var i = 0; i < 5; i++) cols[i] = hex(cs.getPropertyValue("--ps-c" + i), FALL[i]);
      var at = (cs.getPropertyValue("--ps-at") || "").trim().split(/\s+/);
      atx = isFinite(+at[0]) && at[0] !== "" ? +at[0] : 0.68;
      aty = isFinite(+at[1]) && at[1] !== undefined && at[1] !== "" ? +at[1] : 0.5;
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("paint-swirl shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("paint-swirl link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "a", "pix", "at", "rnd", "c0", "c1", "c2", "c3", "c4"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed, so every load paints the same pot
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

    function angle() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD * 6.2831853 : STILL; }
    function render(a) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.a, a);
      gl.uniform1f(U.pix, Math.max(1, Math.round(pixel * scale)));
      gl.uniform2f(U.at, (atx - 0.5) * w / h, 0.5 - aty);
      for (var i = 0; i < 5; i++) gl.uniform3f(U["c" + i], cols[i][0], cols[i][1], cols[i][2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      read();
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
        clock = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: PERIOD, iterations: Infinity });
        clock.id = "paint swirl";   // a timer only: it animates nothing visible
        clock.currentTime = STILL / 6.2831853 * PERIOD;
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { read(); render(reduce.matches ? STILL : angle()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".paintswirl").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
