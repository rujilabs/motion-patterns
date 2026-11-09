/*
 * elastic-mesh.js: in every .elasticmesh, a quilted fabric on a spring grid. Press it (mouse button,
 * pen or finger) and it dents under the press; let go and it springs back with a soft overshoot. A mouse
 * that only hovers presses lightly. When nobody touches it, an unseen hand presses it now and then.
 *   <section class="elasticmesh">
 *     <canvas class="em-canvas" aria-hidden="true"></canvas> ...content...
 *     <button type="button" class="em-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Only presses that start on the area itself count, not on the content over it.
 * The maths: a 32 x 24 grid of heights in JS. Each node feels the pull of its four neighbours (the
 * discrete Laplacian, a stretched membrane), a spring back to flat, damping, and the hand: where the
 * hand's Gaussian shape lies below the fabric, a stiff spring pulls the fabric down to it. Two half
 * steps of semi-implicit Euler per frame. Heights and slopes (central differences on the grid) go into
 * a small texture each frame and are read with linear filtering. The shader adds diamond quilting:
 * pillows (1 - 4u^2)(1 - 4v^2) with their exact slopes, tufts at the corners, dashed stitching and a
 * fine knit, all pulled toward the dent, and lights them with soft wrapped diffuse light.
 * The idle presses run on a Web Animations clock ("quilted fabric"), so the gallery timeline and the
 * Pause button stop them. One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if
 * the first 30 frames average over 20 ms), no allocation per frame, no drawing off screen or in a hidden
 * tab, the context released on pagehide and rebuilt after webglcontextlost. Under reduced motion it
 * draws one still frame with a dent in it.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 16000;        // four idle presses, ms
  var NX = 32, NY = 24;      // the spring grid

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",         // drawing buffer, px
    "uniform sampler2D u_sim;",    // r height, g b slopes (per grid cell), 0.5 = zero
    "uniform float u_q;",          // quilted cells across the height
    "uniform vec3 u_fab;",
    "uniform vec3 u_thr;",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / u_res;",
    "  vec4 s = texture2D(u_sim, uv);",
    "  float H = (s.r - 0.5) * 2.56;",
    "  vec2 g = (s.gb - 0.5) * 2.04;",
    "  float cell = u_res.y / u_q;",                  // px per quilted cell
    // the quilting, pulled toward the dent
    "  vec2 qp = vec2(uv.x * u_res.x / u_res.y, uv.y) * u_q + g * 1.6;",
    "  vec2 ab = vec2(qp.x + qp.y, qp.x - qp.y) * 0.70711;",
    "  vec2 f = fract(ab) - 0.5;",
    "  float px = 0.70711 / cell;",                   // one px in cell units
    "  float ux = 1.0 - 4.0 * f.x * f.x, uy = 1.0 - 4.0 * f.y * f.y;",
    "  float pillow = ux * uy;",
    "  vec2 dp = vec2(-8.0 * f.x * uy, -8.0 * f.y * ux);",   // exact slope of the pillow in (a, b)
    "  vec2 dq = vec2(dp.x + dp.y, dp.x - dp.y) * 0.70711;", // back to screen axes
    // tufts where four pillows meet
    "  vec2 cf = 0.5 - abs(f);",
    "  float tuft = exp(-min(dot(cf, cf) * 160.0, 20.0));",
    // the normal: the dent (scaled per cell) plus the pillows
    "  vec3 N = normalize(vec3(-g * 8.0 - dq * 0.075 * (1.0 - tuft), 1.0));",
    "  vec3 L = normalize(vec3(-0.55, 0.65, 0.5));",
    "  float dif = (dot(N, L) + 0.45) / 1.45;",
    "  vec3 col = u_fab * (0.7 + 0.42 * dif);",
    "  col *= 0.88 + 0.12 * pillow;",                   // the seams sit in shade
    "  col *= 1.0 + 0.4 * min(H, 0.0);",              // the dent is deeper and darker
    "  col *= 1.0 - 0.28 * tuft;",
    // dashed stitching along the seams, thin and antialiased by the pixel size
    "  vec2 e = cf / px;",
    "  float lx = (1.0 - smoothstep(0.4, 1.3, e.x)) * step(0.45, fract(ab.y * 7.0));",
    "  float ly = (1.0 - smoothstep(0.4, 1.3, e.y)) * step(0.45, fract(ab.x * 7.0));",
    "  col = mix(col, u_thr * (0.7 + 0.4 * dif), max(lx, ly) * 0.85 * (1.0 - tuft));",
    // a fine knit, faded out when it would be smaller than a few pixels
    "  vec2 kq = qp * 34.0;",
    "  float knit = sin(kq.x * 3.1416 + sin(kq.y * 3.1416) * 1.3);",
    "  col *= 1.0 + 0.035 * knit * clamp(cell / 34.0 / 4.0 - 0.5, 0.0, 1.0);",
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
    var canvas = root.querySelector(".em-canvas");
    if (!canvas || canvas.emOn) return;
    canvas.emOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the still quilting stays
    var btn = root.querySelector(".em-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, tex = null;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, cw = 1, ch = 1;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var fab = [0.89, 0.91, 0.93], thr = [0.55, 0.61, 0.67], quilt = 6;
    var H = new Float32Array(NX * NY), V = new Float32Array(NX * NY), bytes = new Uint8Array(NX * NY * 4);
    // the hand: centre in grid cells, depth 0 to 1 (eased), radius in cells
    var hx = 20, hy = 12, hd = 0, thd = 0, kx = 0.3, ky = 0.3;
    var userAt = -1e9, held = false, hovering = false, energy = 1;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("elastic-mesh shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("elastic-mesh link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "sim", "q", "fab", "thr"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      pack();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, NX, NY, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(U.sim, 0);
      return true;
    }

    // one step of the membrane: neighbours, a spring to flat, damping and the hand
    function step(dt) {
      var i, j, k, e = 0;
      for (j = 1; j < NY - 1; j++) for (i = 1; i < NX - 1; i++) {
        k = j * NX + i;
        var lap = H[k - 1] + H[k + 1] + H[k - NX] + H[k + NX] - 4 * H[k];
        var a = 46 * lap - 70 * H[k] - 5.5 * V[k];
        if (hd > 0.001) {
          var dx = (i - hx) * kx, dy = (j - hy) * ky, q = dx * dx + dy * dy;
          if (q < 9) {
            var target = -hd * Math.exp(-q);
            if (H[k] > target) a += 900 * (target - H[k]);
          }
        }
        V[k] += a * dt;
      }
      for (k = 0; k < NX * NY; k++) { H[k] += V[k] * dt; e += Math.abs(V[k]) + Math.abs(H[k]) * 0.2; }
      energy = e;
    }
    // heights and slopes into bytes, 0.5 = zero
    function pack() {
      for (var j = 0; j < NY; j++) for (var i = 0; i < NX; i++) {
        var k = j * NX + i, o = k * 4;
        var sx = (H[j * NX + Math.min(NX - 1, i + 1)] - H[j * NX + Math.max(0, i - 1)]) * 0.5;
        var sy = (H[Math.min(NY - 1, j + 1) * NX + i] - H[Math.max(0, j - 1) * NX + i]) * 0.5;
        bytes[o] = Math.max(0, Math.min(255, Math.round(127.5 + H[k] * 99.6)));
        bytes[o + 1] = Math.max(0, Math.min(255, Math.round(127.5 + sx * 125)));
        bytes[o + 2] = Math.max(0, Math.min(255, Math.round(127.5 + sy * 125)));
        bytes[o + 3] = 255;
      }
    }

    function render() {
      if (!prog || lost || !w) return;
      pack();
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, NX, NY, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.q, quilt);
      gl.uniform3f(U.fab, fab[0], fab[1], fab[2]);
      gl.uniform3f(U.thr, thr[0], thr[1], thr[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), cs = getComputedStyle(root);
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      w = Math.max(1, Math.round(cw * scale)); h = Math.max(1, Math.round(ch * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      fab = hex(cs.getPropertyValue("--em-fabric"), fab);
      thr = hex(cs.getPropertyValue("--em-thread"), thr);
      quilt = Math.max(2, Math.min(14, parseFloat(cs.getPropertyValue("--em-quilt")) || 6));
      // the hand is a 64 px radius Gaussian whatever the grid cells measure
      kx = cw / NX / 64; ky = ch / NY / 64;
      if (reduce.matches) still(); else render();
      kick();
    }
    // reduced motion: let the fabric settle under one press, then draw it once
    function still() {
      hx = NX * 0.68; hy = NY * 0.62; hd = 1;
      H.fill(0); V.fill(0);
      for (var n = 0; n < 240; n++) step(1 / 120);
      render();
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog; }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      var dt = last ? Math.min(40, now - last) : 16;
      last = now;
      if (!checked) {
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      if (!paused && !held && !hovering && now - userAt > 2000) {
        // nobody touches it: an unseen hand presses at four places in turn, each held about 1.6 s
        var t = clock && clock.currentTime != null ? clock.currentTime % PERIOD : 0;
        var n = Math.floor(t / 4000), ph = (t % 4000) / 4000;
        var spots = [0.66, 0.42, 0.84, 0.3, 0.5, 0.7, 0.78, 0.58];
        hx = 1 + (NX - 3) * spots[n * 2]; hy = 1 + (NY - 3) * spots[n * 2 + 1];
        thd = ph > 0.42 && ph < 0.82 ? 1 : 0;
      }
      hd += (thd - hd) * (1 - Math.exp(-dt / (thd > hd ? 140 : 60)));
      step(dt / 2000); step(dt / 2000);
      render();
      // keep going while the clock runs or anything still moves
      if (!paused || held || hovering || hd > 0.002 || energy > 0.2) raf = requestAnimationFrame(frame);
    }

    function place(e) {
      var b = root.getBoundingClientRect();
      hx = (e.clientX - b.left) / b.width * NX - 0.5;
      hy = (1 - (e.clientY - b.top) / b.height) * NY - 0.5;
    }
    function down(e) {
      if (reduce.matches || e.target !== root) return;
      held = true; place(e); thd = 1; userAt = performance.now();
      kick();
    }
    function move(e) {
      if (reduce.matches) return;
      if (held) { place(e); userAt = performance.now(); kick(); return; }
      if (e.pointerType === "mouse" && e.target === root) { hovering = true; place(e); thd = 0.28; userAt = performance.now(); kick(); }
      else if (hovering) { hovering = false; thd = 0; }
    }
    function up() { if (held || hovering) { held = false; hovering = false; thd = 0; userAt = performance.now(); kick(); } }
    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      if (p && !held && !hovering) thd = 0;
      kick();
    }
    function sync() {
      if (reduce.matches) {
        if (clock) { clock.cancel(); clock = null; }
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (btn) btn.hidden = true;
        fit();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: PERIOD, iterations: Infinity });
        clock.id = "quilted fabric";   // a timer only: it animates nothing visible
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      hd = 0; H.fill(0); V.fill(0);
      fit();
    }

    if (!build()) return;
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointerleave", up);
    root.addEventListener("pointercancel", up);
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      canvas.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; if (build()) fit(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(canvas); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", sync);
    sync();
  }

  function init() { document.querySelectorAll(".elasticmesh").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
