/*
 * halftone-reveal.js: in every .halftone, the .hr-photo image is read into WebGL once and redrawn on the
 * .hr-canvas over it as a four colour halftone print: cyan, magenta, yellow and black dots on paper, each
 * ink on its own screen angle. Under the pointer (mouse, pen or a finger) the dots grow until they merge,
 * and in the middle the full picture shows through. When nobody points, a soft loupe drifts slowly over
 * the print on its own.
 *   <div class="halftone" data-hr-pitch="8" data-hr-radius=".26">
 *     <img class="hr-photo" src="poster.svg" alt="..."> <canvas class="hr-canvas" aria-hidden="true"></canvas>
 *     <button type="button" class="hr-pause" aria-pressed="false" hidden>Pause</button>
 *   </div>
 * The image must be same origin (a local file or an SVG drawn for the page) or WebGL may not read it;
 * if it cannot, the plain picture stays. The paper colour comes from --hr-paper (6 digit hex).
 * The maths: for each ink the pixel is turned onto that ink's screen (15, 75, 0 and 45 degrees) and
 * floored to a cell. The picture is read once at the cell centre and split into CMYK with a light
 * black: k = 0.9 (1 - max(r, g, b))^2, then c = (1 - r - k) / (1 - k) and so on. The dot radius is pitch x sqrt(ink / pi),
 * so the dot covers the same share of its cell as the ink amount, times a growth 1 + 1.6 G, where
 * G = exp(-r^2 / R^2) is a Gaussian round the pointer measured at the cell centre (so dots stay round).
 * A grown dot also thins toward the ink amount, so where the dots merge they print the continuous tone.
 * The inks multiply on the paper like real ink; near the pointer the print mixes into the picture.
 * The idle loupe moves on a Web Animations clock ("halftone loupe"), so the gallery timeline and the
 * Pause button stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen, in a hidden tab or when settled
 * and paused, the context released on pagehide and rebuilt after webglcontextlost. Under reduced
 * motion one still frame is drawn with the loupe resting on the picture, and nothing follows the pointer.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 16000;   // one loop of the idle loupe, ms: the clock period

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform sampler2D u_img;", // the picture
    "uniform vec4 u_cov;",      // cover crop: scale xy, offset zw (box uv to texture uv)
    "uniform vec2 u_m;",        // loupe centre, buffer px
    "uniform float u_r;",       // loupe radius, buffer px
    "uniform float u_d;",       // loupe strength, 0 to 1
    "uniform float u_pitch;",   // halftone cell, buffer px
    "uniform vec3 u_paper;",
    "vec3 pic(vec2 px){ return texture2D(u_img, clamp(px / u_res * u_cov.xy + u_cov.zw, 0.0, 1.0)).rgb; }",
    "float gauss(float x){ x = min(abs(x), 6.0); return exp(-x * x); }",
    // one ink's dot coverage at px: cs = (cos, sin) of its screen angle, mask picks the ink from CMYK
    "float ink(vec2 px, vec2 cs, vec4 mask){",
    "  vec2 q = vec2(cs.x * px.x + cs.y * px.y, cs.x * px.y - cs.y * px.x) / u_pitch;",
    "  vec2 c = floor(q) + 0.5;",
    "  vec2 cp = vec2(cs.x * c.x - cs.y * c.y, cs.y * c.x + cs.x * c.y) * u_pitch;",
    "  vec3 s = pic(cp);",
    // light grey component replacement: only deep shadows take black, the colour inks carry the rest
    "  float k = 1.0 - max(s.r, max(s.g, s.b));",
    "  k *= k * 0.9;",
    "  vec4 cmyk = vec4(clamp((1.0 - s - k) / (1.0 - k), 0.0, 1.0), k);",
    "  float a = clamp(dot(cmyk, mask), 0.0, 1.0);",
    "  float g = u_d * gauss(length(cp - u_m) / u_r);",
    "  float r = sqrt(a * 0.3183) * (1.0 + 1.6 * g);",
    "  float aa = 0.9 / u_pitch;",
    // a grown dot thins toward the ink amount itself, so merged dots give the continuous tone, not solid ink
    "  return (1.0 - smoothstep(r - aa, r + aa, length(q - c))) * mix(1.0, a, smoothstep(0.0, 0.8, g));",
    "}",
    "void main(){",
    "  vec2 px = gl_FragCoord.xy;",
    "  float cC = ink(px, vec2(0.9659, 0.2588), vec4(1.0, 0.0, 0.0, 0.0));",
    "  float cM = ink(px, vec2(0.2588, 0.9659), vec4(0.0, 1.0, 0.0, 0.0));",
    "  float cY = ink(px, vec2(1.0, 0.0), vec4(0.0, 0.0, 1.0, 0.0));",
    "  float cK = ink(px, vec2(0.7071, 0.7071), vec4(0.0, 0.0, 0.0, 1.0));",
    // process inks multiply on the paper
    "  vec3 col = u_paper;",
    "  col *= mix(vec3(1.0), vec3(0.0, 0.63, 0.89), cC);",
    "  col *= mix(vec3(1.0), vec3(0.9, 0.0, 0.49), cM);",
    "  col *= mix(vec3(1.0), vec3(1.0, 0.93, 0.0), cY);",
    "  col *= mix(vec3(1.0), vec3(0.11, 0.11, 0.11), cK);",
    // the middle of the loupe: the dots have merged into the picture itself
    "  float g = gauss(length(px - u_m) / u_r);",
    "  col = mix(col, pic(px), smoothstep(0.45, 0.9, g) * u_d);",
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
    var canvas = root.querySelector(".hr-canvas"), img = root.querySelector(".hr-photo");
    if (!canvas || !img || canvas.hrOn) return;
    canvas.hrOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the plain picture stays
    var btn = root.querySelector(".hr-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, ready = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, cw = 1, ch = 1;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var pitch = Math.max(4, Math.min(20, +root.getAttribute("data-hr-pitch") || 8));
    var radius = Math.max(0.08, Math.min(0.6, +root.getAttribute("data-hr-radius") || 0.26));
    var paper, iw = 800, ih = 420;
    var mx = 0.6, my = 0.5, tx = 0.6, ty = 0.5, d = 0, td = 0;
    var pointerIn = false, pointerAt = -1e9;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("halftone-reveal shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("halftone-reveal link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "img", "cov", "m", "r", "d", "pitch", "paper"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      ready = false;
      if (img.complete && img.naturalWidth) upload(); else img.addEventListener("load", upload, { once: true });
      return true;
    }
    // draw the picture once into a 2D canvas at up to 2 x its size (crisp for an SVG), then into a texture
    function upload() {
      if (!prog || lost) return;
      iw = img.naturalWidth || 800; ih = img.naturalHeight || 420;
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
      } catch (e) { if (btn) btn.hidden = true; return; }   // a cross-origin or unreadable image: the plain picture stays
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
      gl.uniform2f(U.m, mx * w, my * h);
      gl.uniform1f(U.r, radius * h);
      gl.uniform1f(U.d, d);
      gl.uniform1f(U.pitch, pitch * scale);
      gl.uniform3f(U.paper, paper[0], paper[1], paper[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      w = Math.max(1, Math.round(cw * scale)); h = Math.max(1, Math.round(ch * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      paper = hex(getComputedStyle(root).getPropertyValue("--hr-paper"), [0.97, 0.96, 0.93]);
      if (reduce.matches) still(); else { render(); kick(); }
    }

    // reduced motion: one still frame, the loupe resting on the brightest part of the picture
    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      mx = 0.66; my = 0.5; d = 1;
      render();
    }

    function settled() { return Math.abs(tx - mx) + Math.abs(ty - my) + Math.abs(td - d) < 0.002; }
    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && ready; }
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
      if (!pointerIn && now - pointerAt > 1500) {
        // nobody is pointing: a soft loupe drifts over the print on the clock
        var a = (clock && clock.currentTime != null ? clock.currentTime % PERIOD : 0) / PERIOD * 6.2831853;
        tx = 0.5 + 0.3 * Math.sin(a + 1.2); ty = 0.5 + 0.2 * Math.sin(a * 2 + 0.4); td = 0.85;
      } else if (!pointerIn) td = 0;
      var k = 1 - Math.exp(-dt / 90);
      mx += (tx - mx) * k; my += (ty - my) * k;
      d += (td - d) * (1 - Math.exp(-dt / 200));
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
        if (btn) btn.hidden = true;
        still();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: PERIOD, iterations: Infinity });
        clock.id = "halftone loupe";   // a timer only: it animates nothing visible (not opacity, which hides the canvas until it is live)
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
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", sync);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fit);
    sync();
  }

  function init() { document.querySelectorAll(".halftone").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
