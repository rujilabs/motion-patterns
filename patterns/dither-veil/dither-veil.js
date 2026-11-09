/*
 * dither-veil.js: in every .ditherveil, the .dv-photo image is read into WebGL once and drawn on the
 * .dv-canvas over it under a dithered veil: a one bit print of the same photo in two inks, made of
 * random grains. As the photo scrolls into view the veil dissolves grain by grain from the face outward,
 * through a band of coarse colour grains, to the full photo. Scrolling back up draws the veil again.
 *   <figure class="ditherveil" data-dv-pixel="3" data-dv-focus=".5 .42">
 *     <img class="dv-photo" src="portrait.jpg" alt="..."> <canvas class="dv-canvas" aria-hidden="true"></canvas>
 *   </figure>
 * The image must be same origin (a local file or an SVG drawn for the page) or WebGL may not read it;
 * if it cannot, the plain photo stays. The veil inks come from --dv-ink and --dv-paper (6 digit hex).
 * The maths: stochastic (FM) screening. Each grain gets two random numbers from a 64 x 64 random
 * texture (NEAREST): one is its print threshold, so a grain prints paper where the photo's luminance
 * is above it and ink below (white noise dither, no grid pattern; the luminance is stretched first so
 * the face reads through the veil); the other is when it dissolves.
 * The dissolve front is f = 2.5 p - 1.2 d, with p the scroll progress and d the distance from the focus
 * point over the distance to the farthest corner (so at p = 1 every grain has dissolved): a grain shows the photo when its number is below f - 0.22, a colour grain (each channel
 * dithered to 3 levels with the same threshold) when below f, and the veil otherwise.
 * The progress p is worked out from the box's place in the viewport on every scroll (one rAF per
 * frame, only while the box is near the screen) and also scrubs a paused Web Animations timer
 * ("dither veil"), so the gallery timeline shows it. No loop: nothing draws while the page is still.
 * Drawing buffer at most 1.5 x the CSS size (1 x if 30 scroll frames average over 20 ms), no allocation
 * per frame, the context released on pagehide and rebuilt after webglcontextlost. Under reduced
 * motion the script does not start and the plain photo shows, the finished state.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",        // drawing buffer, px
    "uniform sampler2D u_img;",   // the photo
    "uniform sampler2D u_rnd;",   // 64 x 64 random bytes, NEAREST, REPEAT
    "uniform vec4 u_cov;",        // cover crop: scale xy, offset zw (box uv to texture uv)
    "uniform float u_pix;",       // grain size, buffer px
    "uniform float u_p;",         // scroll progress, 0 to 1
    "uniform vec2 u_focus;",      // where the dissolve starts, box uv (y up)
    "uniform float u_asp;",       // box width / height
    "uniform float u_dmax;",      // distance from the focus to the farthest corner, height units
    "uniform vec3 u_ink;",
    "uniform vec3 u_paper;",
    "void main(){",
    "  vec2 cell = floor(gl_FragCoord.xy / u_pix);",
    "  vec2 uv = (cell + 0.5) * u_pix / u_res;",
    "  vec3 col = texture2D(u_img, clamp(uv * u_cov.xy + u_cov.zw, 0.0, 1.0)).rgb;",
    "  vec4 r = texture2D(u_rnd, (mod(cell, 64.0) + 0.5) / 64.0);",
    "  float th = r.r * 0.98 + 0.01;",
    // the veil: a one bit print of the photo, white noise threshold
    "  float lum = smoothstep(0.2, 0.85, dot(col, vec3(0.299, 0.587, 0.114)));",
    "  vec3 veil = lum > th ? u_paper : u_ink;",
    // the developing band: each channel dithered to three levels with the same threshold
    "  vec3 lv = floor(col * 2.0 + th) * 0.5;",
    "  vec3 coarse = mix(u_ink, u_paper, 0.12) * (1.0 - lv) + lv;",
    // the dissolve front runs out from the focus point as the progress grows
    "  vec2 dv = (uv - u_focus) * vec2(u_asp, 1.0);",
    "  float f = 2.5 * u_p - 1.2 * length(dv) / u_dmax;",
    "  float g = r.g * 0.996;",
    "  vec3 full = texture2D(u_img, clamp(gl_FragCoord.xy / u_res * u_cov.xy + u_cov.zw, 0.0, 1.0)).rgb;",
    "  vec3 o = g < f - 0.22 ? full : g < f ? coarse : veil;",
    "  gl_FragColor = vec4(o, 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function setup(root) {
    var canvas = root.querySelector(".dv-canvas"), img = root.querySelector(".dv-photo");
    if (!canvas || !img || canvas.dvOn || reduce.matches) return;
    canvas.dvOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the plain photo stays
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, ready = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, cw = 1, ch = 1;
    var raf = 0, near = !("IntersectionObserver" in window), timer = null, p = 0;
    var frames = 0, firstT = 0, lastT = 0, checked = false;
    var pixel = Math.max(1, Math.min(8, +root.getAttribute("data-dv-pixel") || 3));
    var fo = (root.getAttribute("data-dv-focus") || ".5 .42").trim().split(/\s+/);
    var fx = isFinite(+fo[0]) ? +fo[0] : 0.5, fy = isFinite(+fo[1]) ? +fo[1] : 0.42;
    var ink, paper, iw = 600, ih = 750;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("dither-veil shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("dither-veil link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "img", "rnd", "cov", "pix", "p", "focus", "asp", "dmax", "ink", "paper"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed, so every load lays the same grains
      var bytes = new Uint8Array(64 * 64 * 4), seed = 20261118;
      for (var i = 0; i < bytes.length; i++) { seed = (seed * 1103515245 + 12345) >>> 0; bytes[i] = seed >>> 24; }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.uniform1i(U.rnd, 1);
      ready = false;
      if (img.complete && img.naturalWidth) upload(); else img.addEventListener("load", upload, { once: true });
      return true;
    }
    // draw the photo once into a 2D canvas at up to 2 x its size (crisp for an SVG), then into a texture
    function upload() {
      if (!prog || lost) return;
      iw = img.naturalWidth || 600; ih = img.naturalHeight || 750;
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
      } catch (e) { return; }   // a cross-origin or unreadable image: the plain photo stays
      ready = true;
      fit();
    }

    function render() {
      if (!prog || lost || !w || !ready) return;
      // cover crop, centred, like object-fit: cover
      var ba = cw / ch, ia = iw / ih, sx = 1, sy = 1;
      if (ba > ia) sy = ia / ba; else sx = ba / ia;
      gl.uniform2f(U.res, w, h);
      gl.uniform4f(U.cov, sx, sy, 0.5 - 0.5 * sx, 0.5 - 0.5 * sy);
      gl.uniform1f(U.pix, Math.max(1, Math.round(pixel * scale)));
      gl.uniform1f(U.p, p);
      gl.uniform2f(U.focus, fx, 1 - fy);
      gl.uniform1f(U.asp, ba);
      var dx = Math.max(fx, 1 - fx) * ba, dy = Math.max(fy, 1 - fy);
      gl.uniform1f(U.dmax, Math.sqrt(dx * dx + dy * dy));
      gl.uniform3f(U.ink, ink[0], ink[1], ink[2]);
      gl.uniform3f(U.paper, paper[0], paper[1], paper[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    // scroll progress: 0 when the box's top is 68 % down the viewport, 1 when its middle is at 45 %
    function progress() {
      var b = root.getBoundingClientRect(), vh = window.innerHeight || 1;
      var q = (0.68 * vh - b.top) / (0.23 * vh + 0.5 * b.height);
      return Math.max(0, Math.min(1, q));
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      w = Math.max(1, Math.round(cw * scale)); h = Math.max(1, Math.round(ch * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      var cs = getComputedStyle(root);
      ink = hex(cs.getPropertyValue("--dv-ink"), [0.23, 0.12, 0.23]);
      paper = hex(cs.getPropertyValue("--dv-paper"), [0.95, 0.91, 0.86]);
      p = progress();
      if (timer) timer.currentTime = p * 1000;
      render();
    }

    function frame(now) {
      raf = 0;
      if (!checked) {
        // 30 back to back scroll frames averaging over 20 ms: drop the buffer to 1 x the CSS size
        if (lastT && now - lastT < 60) { if (!firstT) firstT = lastT; if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); return; } } }
        else { frames = 0; firstT = 0; }
        lastT = now;
      }
      var np = progress();
      if (Math.abs(np - p) < 0.0005 && canvas.classList.contains("is-live")) return;
      p = np;
      if (timer) timer.currentTime = p * 1000;
      render();
    }
    function queue() { if (!raf && near && !lost && prog && ready) raf = requestAnimationFrame(frame); }

    if (!build()) return;
    if (canvas.animate) {
      // a paused timer the scroll scrubs: it animates nothing visible, so the gallery timeline can show it
      timer = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: 1000, fill: "both" });
      timer.id = "dither veil";
      timer.pause();
    }
    window.addEventListener("scroll", queue, { passive: true });
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null; ready = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      canvas.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; build(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (ready && !lost) fit(); }).observe(canvas); else window.addEventListener("resize", fit);
    if (!near) new IntersectionObserver(function (es) { near = es[es.length - 1].isIntersecting; queue(); }, { rootMargin: "25% 0px" }).observe(root);
    document.addEventListener("visibilitychange", queue);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { if (ready && !lost) fit(); });
    // turning reduced motion on mid-visit: hide the canvas and show the finished photo
    reduce.addEventListener("change", function () { if (reduce.matches) { canvas.classList.remove("is-live"); canvas.hidden = true; } else { canvas.hidden = false; if (ready) fit(); } });
  }

  function init() { document.querySelectorAll(".ditherveil").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
