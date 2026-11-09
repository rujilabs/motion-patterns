/*
 * ball-pit.js: in every .ballpit, 40 glossy play balls tumble into a pit on its .bp-canvas and roll
 * aside when the pointer (mouse, pen or a finger) pushes through them. JS runs the 2D physics; a WebGL
 * fragment shader draws every ball as a lit sphere.
 *   <section class="ballpit">
 *     <canvas class="bp-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="bp-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --bp-wall and --bp-1 to --bp-5 (6 digit hex), the same ones the CSS fallback uses.
 * The physics: circles under gravity in a box, position-based contact (overlaps pushed apart, normal
 * speeds swapped with some bounce, four passes per substep, two substeps per frame), walls with
 * friction, and the pointer as a moving round paddle that shoves balls out of its way and lends them its
 * speed. Idle for 1.5 s, an unseen hand sweeps through the pit so the balls keep tumbling.
 * The drawing: pixels above the highest ball skip the work. Ball positions go to the GPU each frame in a 64 x 1 byte texture (16 bits per coordinate,
 * written into one array made once); the shader loops over the 40 balls, keeps the front-most hit, and
 * shades it as a sphere (normal from the offset, diffuse, a sharp specular, floor bounce light, darker
 * where other balls crowd it), with soft drop shadows on the wall and between balls.
 * The physics steps on a Web Animations clock ("ball pit"), so Pause and the gallery timeline stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames average
 * over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context released on
 * pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays; under reduced motion
 * the balls settle unseen and one still frame is drawn.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 60000;   // the clock period, ms (the idle hand's path repeats on it)
  var N = 40;

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",       // drawing buffer, px
    "uniform sampler2D u_data;", // 64 x 1: per ball x hi, x lo, y hi, y lo (share of the box)
    "uniform vec2 u_box;",       // box size in height units (width, 1)
    "uniform float u_size;",     // ball size factor
    "uniform float u_top;",      // above this height there are no balls or shadows: skip the loop
    "uniform vec3 u_wall;",
    "uniform vec3 u_c1; uniform vec3 u_c2; uniform vec3 u_c3; uniform vec3 u_c4; uniform vec3 u_c5;",
    "void main(){",
    "  vec2 p = gl_FragCoord.xy / u_res.y;",
    "  float px = 1.0 / u_res.y;",
    "  vec2 sh = vec2(0.012, -0.02);",          // where the light throws shadows
    "  float bestZ = -1.0, bestI = 0.0, bestR = 1.0, shade = 0.0, crowd = 0.0;",
    "  vec2 bestD = vec2(0.0);",
    "  if (p.y < u_top) for (int i = 0; i < " + N + "; i++) {",
    "    float fi = float(i);",
    "    vec4 t = texture2D(u_data, vec2((fi + 0.5) / 64.0, 0.5));",
    "    vec2 c = vec2(t.r * 0.99609 + t.g * 0.0038910, t.b * 0.99609 + t.a * 0.0038910) * u_box;",
    "    float r = u_size * (0.045 + 0.02 * fract(fi * 0.618034));",
    "    vec2 d = p - c;",
    "    float dd = dot(d, d);",
    "    float z = r * r - dd;",
    "    if (z > 0.0 && z / (r * r) > bestZ) { bestZ = z / (r * r); bestI = fi; bestR = r; bestD = d; }",
    // soft drop shadow, and crowding just outside other balls
    "    float ls = length(d - sh);",
    "    shade = max(shade, 1.0 - smoothstep(r * 0.55, r * 1.25, ls));",
    "    float l = sqrt(dd);",
    "    crowd += l > r ? clamp(1.0 - (l - r) / (0.7 * r), 0.0, 1.0) : 0.0;",
    "  }",
    // the wall: a soft gradient, darker towards the pit floor, with shadows
    "  vec3 col = u_wall * (0.93 + 0.07 * p.y) * (1.0 - 0.32 * shade);",
    "  if (bestZ > 0.0) {",
    "    float m = mod(bestI, 5.0);",
    "    vec3 base = m < 0.5 ? u_c1 : m < 1.5 ? u_c2 : m < 2.5 ? u_c3 : m < 3.5 ? u_c4 : u_c5;",
    "    vec2 q = bestD / bestR;",
    "    vec3 n = vec3(q, sqrt(max(0.0, 1.0 - dot(q, q))));",
    "    vec3 L = normalize(vec3(-0.45, 0.62, 0.65));",
    "    float diff = max(dot(n, L), 0.0);",
    "    float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 36.0);",
    "    vec3 ball = base * (0.4 + 0.72 * diff);",
    "    ball += base * 0.22 * smoothstep(0.2, 1.0, -n.y) * (1.0 - n.z);",   // light bounced off the balls below
    "    ball *= 1.0 - 0.32 * min(crowd, 1.0) * (1.0 - n.z);",
    "    ball += vec3(1.0) * spec * 0.7;",
    "    float cover = clamp((bestR - length(bestD)) / px + 0.5, 0.0, 1.0);",
    "    col = mix(col, ball, cover);",
    "  }",
    "  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  function frac(x) { return x - Math.floor(x); }

  function setup(root) {
    var canvas = root.querySelector(".bp-canvas");
    if (!canvas || canvas.bpOn) return;
    canvas.bpOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".bp-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, tex = null;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, lastClock = -1, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var X = new Float32Array(N), Y = new Float32Array(N), VX = new Float32Array(N), VY = new Float32Array(N), R = new Float32Array(N);
    var bytes = new Uint8Array(64 * 4);
    var W = 4 / 3, size = 1, started = false;
    // the paddle: target, position, speed, radius; pointerIn says a real pointer drives it
    var hx = -1, hy = -1, hvx = 0, hvy = 0, htx = -1, hty = -1, hr = 0, pointerIn = false, pointerAt = -1e9, idleT = 0;
    var wall, cols = [];

    function colours() {
      var cs = getComputedStyle(root);
      wall = hex(cs.getPropertyValue("--bp-wall"), [0.93, 0.96, 0.95]);
      var def = [[0.94, 0.29, 0.24], [1, 0.76, 0.19], [0.18, 0.44, 0.84], [0.25, 0.68, 0.35], [1, 0.54, 0.17]];
      for (var i = 0; i < 5; i++) cols[i] = hex(cs.getPropertyValue("--bp-" + (i + 1)), def[i]);
      var s = +cs.getPropertyValue("--bp-size") || 1;
      if (s !== size) { size = s; radii(); }
    }
    function radii() { for (var i = 0; i < N; i++) R[i] = size * (0.045 + 0.02 * frac(i * 0.618034)); }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("ball-pit shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("ball-pit link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "data", "box", "size", "top", "wall", "c1", "c2", "c3", "c4", "c5"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(U.data, 0);
      return true;
    }

    // the balls start above the pit, in a fixed shuffled order, and fall in
    function drop() {
      var seed = 5150;
      for (var i = 0; i < N; i++) {
        seed = (seed * 1103515245 + 12345) >>> 0;
        X[i] = R[i] + (seed / 4294967296) * (W - 2 * R[i]);
        Y[i] = 1.1 + i * 0.045;
        VX[i] = 0; VY[i] = -0.4;
      }
      started = true;
    }

    function step(dt) {
      var i, j, k;
      for (i = 0; i < N; i++) {
        VY[i] -= 2.6 * dt;
        X[i] += VX[i] * dt; Y[i] += VY[i] * dt;
      }
      if (hr > 0) { hx += hvx * dt; hy += hvy * dt; }
      for (k = 0; k < 4; k++) {
        for (i = 0; i < N; i++) {
          // the paddle shoves balls out of its way and lends them its speed
          if (hr > 0) {
            var px = X[i] - hx, py = Y[i] - hy, pd = Math.sqrt(px * px + py * py), pm = R[i] + hr;
            if (pd < pm && pd > 1e-5) {
              var pnx = px / pd, pny = py / pd;
              X[i] = hx + pnx * pm; Y[i] = hy + pny * pm;
              var rel = (VX[i] - hvx) * pnx + (VY[i] - hvy) * pny;
              if (rel < 0) { VX[i] -= 1.5 * rel * pnx; VY[i] -= 1.5 * rel * pny; }
            }
          }
          for (j = i + 1; j < N; j++) {
            var dx = X[j] - X[i], dy = Y[j] - Y[i], m = R[i] + R[j];
            if (dx > m || dx < -m || dy > m || dy < -m) continue;
            var d2 = dx * dx + dy * dy;
            if (d2 >= m * m || d2 < 1e-10) continue;
            var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, o = (m - d) * 0.5;
            X[i] -= nx * o; Y[i] -= ny * o; X[j] += nx * o; Y[j] += ny * o;
            var vn = (VX[j] - VX[i]) * nx + (VY[j] - VY[i]) * ny;
            if (vn < 0) {
              var jv = -0.75 * vn;   // 1 + bounce of 0.5, shared by two equal balls
              VX[i] -= jv * nx; VY[i] -= jv * ny; VX[j] += jv * nx; VY[j] += jv * ny;
            }
          }
        }
        for (i = 0; i < N; i++) {
          var r = R[i];
          if (Y[i] < r) { Y[i] = r; if (VY[i] < 0) VY[i] *= -0.35; VX[i] *= 0.985; }
          if (X[i] < r) { X[i] = r; if (VX[i] < 0) VX[i] *= -0.4; }
          if (X[i] > W - r) { X[i] = W - r; if (VX[i] > 0) VX[i] *= -0.4; }
          if (Y[i] > 3) { Y[i] = 3; VY[i] = 0; }
        }
      }
      for (i = 0; i < N; i++) { VX[i] *= 0.998; VY[i] *= 0.998; }
    }

    function paddle(dt, now) {
      if (!pointerIn && now - pointerAt > 1500) {
        // nobody is pushing: an unseen hand sweeps slowly through the pit, on the clock
        idleT += dt;
        var a = idleT * 0.55;
        htx = W * (0.62 + 0.3 * Math.sin(a)); hty = 0.1 + 0.07 * Math.abs(Math.sin(a * 1.7));
        if (hr === 0) { hx = htx; hy = -0.2; }
        hr = 0.085 * size;
      }
      if (hr > 0) {
        // the paddle chases its target; its speed is what it lends the balls
        var k = 1 - Math.exp(-dt / 0.06);
        hvx = (htx - hx) * k / dt; hvy = (hty - hy) * k / dt;
      }
    }

    function upload() {
      for (var i = 0; i < N; i++) {
        var u = Math.min(65535, Math.max(0, Math.round(X[i] / W * 65535)));
        var v = Math.min(65535, Math.max(0, Math.round(Y[i] * 65535)));
        bytes[i * 4] = u >> 8; bytes[i * 4 + 1] = u & 255; bytes[i * 4 + 2] = v >> 8; bytes[i * 4 + 3] = v & 255;
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 64, 1, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    }

    function render() {
      if (!prog || lost || !w) return;
      upload();
      gl.uniform2f(U.res, w, h);
      gl.uniform2f(U.box, W, 1);
      gl.uniform1f(U.size, size);
      var top = 0;
      for (var i = 0; i < N; i++) top = Math.max(top, Y[i] + R[i]);
      gl.uniform1f(U.top, top + 0.06);
      gl.uniform3f(U.wall, wall[0], wall[1], wall[2]);
      for (i = 0; i < 5; i++) gl.uniform3f(U["c" + (i + 1)], cols[i][0], cols[i][1], cols[i][2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      W = w / h;
      colours();
      if (!started) { radii(); drop(); }
      for (var i = 0; i < N; i++) X[i] = Math.min(Math.max(X[i], R[i]), W - R[i]);
      if (reduce.matches) still(); else { render(); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && !paused; }
    function kick() { if (!raf && live()) { lastClock = -1; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      var t = clock && clock.currentTime != null ? clock.currentTime : now;
      var dt = lastClock < 0 ? 1 / 60 : (t - lastClock) / 1000;
      if (dt < 0) dt += PERIOD / 1000;   // the clock wrapped round its period
      lastClock = t;
      dt = Math.min(dt, 1 / 30);
      if (dt > 0.0005) { paddle(dt, now); step(dt / 2); step(dt / 2); }
      render();
      raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      // the balls settle unseen, with the hand resting in the pit, then one frame is drawn
      hr = 0;
      for (var i = 0; i < 480; i++) { step(1 / 120); }
      render();
    }

    function point(e) {
      if (reduce.matches || paused) return;
      var b = root.getBoundingClientRect();
      htx = (e.clientX - b.left) / b.height; hty = 1 - (e.clientY - b.top) / b.height;
      if (!pointerIn) { hx = htx; hy = hty; hvx = hvy = 0; }
      pointerIn = true; pointerAt = performance.now(); hr = 0.085 * size;
      kick();
    }
    function leave() { pointerIn = false; pointerAt = performance.now(); hr = 0; idleT = 0; kick(); }
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
        clock.id = "ball pit";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = false;
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".ballpit").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
