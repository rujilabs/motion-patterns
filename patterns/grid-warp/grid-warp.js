/*
 * grid-warp.js: in every .gridwarp, the .gw-photo image is read into WebGL once and redrawn on the
 * .gw-canvas over it, bent like a rubber sheet: where the pointer (mouse, pen or a finger) presses, the
 * photo swells into a dent, a faint grid shows how the sheet stretches, and when the pointer moves the
 * sheet drags along and springs back with a little wobble. When nobody points, a soft press drifts
 * slowly over the photo on its own.
 *   <div class="gridwarp" data-gw-radius=".24">
 *     <img class="gw-photo" src="house.svg" alt="..."> <canvas class="gw-canvas" aria-hidden="true"></canvas>
 *     <button type="button" class="gw-pause" aria-pressed="false" hidden>Pause</button>
 *   </div>
 * The image must be same origin (a local file or an SVG drawn for the page) or WebGL may not read it;
 * if it cannot, the plain photo stays. The grid colour comes from --gw-line (6 digit hex).
 * The maths: the press is a Gaussian G = exp(-r^2 / R^2) round the pointer. The photo is read at
 * p - (p - m) * 0.45 d G - o G: the first term pulls samples toward the centre (the sheet swells), the
 * second shifts them by the drag offset o, which a damped spring in JS drives from the pointer's motion.
 * The dent's height is -d G, so its slope (written out exactly) shades the near and far sides.
 * The idle press moves on a Web Animations clock ("rubber sheet"), so the gallery timeline and the
 * Pause button stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen, in a hidden tab or when settled
 * and paused, the context released on pagehide and rebuilt after webglcontextlost. Under reduced
 * motion the script does not start and the plain photo shows.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 14000;   // one loop of the idle press, ms: the clock period

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform sampler2D u_img;", // the photo
    "uniform vec4 u_cov;",      // cover crop: scale xy, offset zw (box uv to texture uv)
    "uniform float u_asp;",     // box width / height
    "uniform vec2 u_m;",        // press centre, box uv (y up)
    "uniform float u_d;",       // press depth, 0 to 1
    "uniform vec2 u_o;",        // drag offset, height units
    "uniform float u_r;",       // press radius, height units
    "uniform float u_grid;",    // grid pitch, height units
    "uniform float u_px;",      // buffer px per CSS px
    "uniform vec3 u_line;",
    "float g(float x){ x = min(abs(x), 6.0); return exp(-x * x); }",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / u_res;",
    "  vec2 p = vec2(uv.x * u_asp, uv.y), m = vec2(u_m.x * u_asp, u_m.y);",
    "  vec2 dv = p - m;",
    "  float G = exp(-dot(dv, dv) / (u_r * u_r));",
    // the sheet swells under the press and drags with the pointer
    "  vec2 q = p - dv * (0.45 * u_d * G) - u_o * G;",
    "  vec2 t = vec2(q.x / u_asp, q.y) * u_cov.xy + u_cov.zw;",
    "  vec3 col = texture2D(u_img, clamp(t, 0.0, 1.0)).rgb;",
    // shading from the exact slope of the dent (height -d G)
    "  vec2 slope = u_d * G * dv / u_r;",
    "  float lit = dot(slope, normalize(vec2(-0.6, 0.8)));",
    "  col *= 1.0 + clamp(lit * 0.9, -0.28, 0.16);",
    // a faint grid on the sheet, shown only inside the dent
    "  vec2 dl = (0.5 - abs(fract(q / u_grid) - 0.5)) * u_grid * u_res.y / u_px;",
    "  float line = max(g(dl.x / 0.7), g(dl.y / 0.7));",
    "  col = mix(col, u_line, line * G * (0.12 + 0.35 * u_d));",
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
    var canvas = root.querySelector(".gw-canvas"), img = root.querySelector(".gw-photo");
    if (!canvas || !img || canvas.gwOn) return;
    canvas.gwOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the plain photo stays
    var btn = root.querySelector(".gw-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, ready = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, cw = 1, ch = 1;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var radius = Math.max(0.08, Math.min(0.5, +root.getAttribute("data-gw-radius") || 0.24));
    var line, iw = 800, ih = 500;
    var mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, d = 0, td = 0, ox = 0, oy = 0, vx = 0, vy = 0;
    var pointerIn = false, pointerAt = -1e9;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("grid-warp shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("grid-warp link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "img", "cov", "asp", "m", "d", "o", "r", "grid", "px", "line"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      ready = false;
      if (img.complete && img.naturalWidth) upload(); else img.addEventListener("load", upload, { once: true });
      return true;
    }
    // draw the photo once into a 2D canvas at up to 2 x its size (crisp for an SVG), then into a texture
    function upload() {
      if (!prog || lost) return;
      iw = img.naturalWidth || 800; ih = img.naturalHeight || 500;
      var k = Math.min(2, 2048 / Math.max(iw, ih)), c2 = document.createElement("canvas");
      c2.width = Math.round(iw * k); c2.height = Math.round(ih * k);
      try {
        c2.getContext("2d").drawImage(img, 0, 0, c2.width, c2.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(U.img, 0);
      } catch (e) { if (btn) btn.hidden = true; return; }   // a cross-origin or unreadable image: the plain photo stays
      ready = true;
      if (btn) btn.hidden = !(clock && ready);
      fit();
    }

    function render() {
      if (!prog || lost || !w || !ready) return;
      // cover crop, centred, like object-fit: cover
      var ba = cw / ch, ia = iw / ih, sx = 1, sy = 1;
      if (ba > ia) sy = ia / ba; else sx = ba / ia;
      gl.uniform2f(U.res, w, h);
      gl.uniform4f(U.cov, sx, sy, 0.5 - 0.5 * sx, 0.5 - 0.5 * sy);
      gl.uniform1f(U.asp, ba);
      gl.uniform2f(U.m, mx, my);
      gl.uniform1f(U.d, d);
      gl.uniform2f(U.o, ox, oy);
      gl.uniform1f(U.r, radius);
      gl.uniform1f(U.grid, 24 / ch);
      gl.uniform1f(U.px, scale);
      gl.uniform3f(U.line, line[0], line[1], line[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      w = Math.max(1, Math.round(cw * scale)); h = Math.max(1, Math.round(ch * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      line = hex(getComputedStyle(root).getPropertyValue("--gw-line"), [1, 1, 1]);
      render();
      kick();
    }

    function settled() { return Math.abs(tx - mx) + Math.abs(ty - my) + Math.abs(td - d) + Math.abs(ox) + Math.abs(oy) + Math.abs(vx) + Math.abs(vy) < 0.002; }
    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && ready; }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      var dt = last ? Math.min(50, now - last) : 16, s = dt / 1000;
      last = now;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      if (!pointerIn && now - pointerAt > 1500) {
        // nobody is pointing: a soft press drifts over the photo on the clock
        var a = (clock && clock.currentTime != null ? clock.currentTime % PERIOD : 0) / PERIOD * 6.2831853;
        tx = 0.5 + 0.3 * Math.sin(a); ty = 0.5 + 0.22 * Math.sin(a * 2 + 0.7); td = 0.55;
      } else if (!pointerIn) td = 0;
      var k = 1 - Math.exp(-dt / 90), dmx = (tx - mx) * k, dmy = (ty - my) * k;
      mx += dmx; my += dmy;
      d += (td - d) * (1 - Math.exp(-dt / 220));
      // the sheet is dragged by the press's motion and springs back (in height units)
      var asp = cw / ch;
      vx += (-260 * ox - 16 * vx) * s + dmx * asp * 30; vy += (-260 * oy - 16 * vy) * s + dmy * 30;
      ox += vx * s; oy += vy * s;
      var ol = Math.sqrt(ox * ox + oy * oy);
      if (ol > 0.12) { ox *= 0.12 / ol; oy *= 0.12 / ol; }
      render();
      if (!paused || !settled()) raf = requestAnimationFrame(frame);
    }

    function point(e) {
      if (reduce.matches) return;
      var b = root.getBoundingClientRect();
      tx = (e.clientX - b.left) / b.width; ty = 1 - (e.clientY - b.top) / b.height; td = 1;
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
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (btn) btn.hidden = true;
        canvas.classList.remove("is-live");
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: PERIOD, iterations: Infinity });
        clock.id = "rubber sheet";   // a timer only: it animates nothing visible (not opacity, which hides the canvas until it is live)
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !(clock && ready);
      fit();
    }

    if (!build()) return;
    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", point);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null; ready = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      canvas.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; build(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (!reduce.matches) fit(); }).observe(canvas); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", sync);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fit);
    sync();
  }

  function init() { document.querySelectorAll(".gridwarp").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
