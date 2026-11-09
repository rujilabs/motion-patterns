/*
 * crystal-ball.js: in every .crystalball, the .cb-photo image (a display behind a counter) is read into
 * WebGL once and redrawn on the .cb-canvas with a glass ball resting on the counter. The ball rolls
 * toward the pointer (on touch, drag a finger across) with a heavy, slightly springy lag, and when nobody
 * points it rolls slowly to and fro on its own. Through the ball the display shows refracted and upside
 * down, with coloured fringes near the rim, a reflected window, a small highlight, a soft shadow and the
 * bright spot of light the glass focuses onto the counter.
 *   <div class="crystalball">
 *     <img class="cb-photo" src="display.svg" alt="..."> <div class="cb-still" aria-hidden="true"></div>
 *     <canvas class="cb-canvas" aria-hidden="true"></canvas>
 *     <button type="button" class="cb-pause" aria-pressed="false" hidden>Pause</button>
 *   </div>
 * The image must be same origin or WebGL may not read it; if it cannot, the photo and the CSS ball stay.
 * The maths: each pixel inside the ball is a ray along the view axis. It bends into the sphere at the
 * front (Snell's law, GLSL refract, index 1.5), crosses the chord to the back surface (exit point
 * p1 - 2 (p1.t) t on a unit sphere), bends out again and travels on to the display plane behind, where
 * the photo is read. A full ball flips the picture. The three colours use indices 1.475, 1.5 and 1.525,
 * which gives the fringes. Schlick's Fresnel term mixes in a reflected room and window at the rim.
 * The idle roll runs on a Web Animations clock ("crystal ball"), so the gallery timeline and the Pause
 * button stop it. One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first
 * 30 frames average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the
 * context released on pagehide and rebuilt after webglcontextlost. Under reduced motion it draws one
 * still frame.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 16000;   // one idle roll there and back, ms

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform sampler2D u_img;", // the display
    "uniform vec4 u_cov;",      // cover crop: scale xy, offset zw
    "uniform float u_asp;",     // width / height
    "uniform vec2 u_c;",        // ball centre, height units from the middle, y up
    "uniform float u_r;",       // ball radius, height units
    "uniform float u_fy;",      // the counter line under the ball, height units
    "vec3 bg(vec2 p){ vec2 uv = vec2(p.x / u_asp + 0.5, p.y + 0.5); return texture2D(u_img, clamp(uv * u_cov.xy + u_cov.zw, 0.0, 1.0)).rgb; }",
    "float g2(vec2 q){ float x = min(dot(q, q), 30.0); return exp(-x); }",
    // through a unit glass ball: in at the front, across, out at the back, on to the plane behind
    "vec2 through(vec2 d, float z, float ior){",
    "  vec3 n1 = vec3(d, -z);",
    "  vec3 t1 = refract(vec3(0.0, 0.0, 1.0), n1, 1.0 / ior);",
    "  vec3 p2 = n1 - t1 * (2.0 * dot(n1, t1));",
    "  vec3 t2 = refract(t1, -p2, ior);",
    "  if (dot(t2, t2) < 0.001) t2 = reflect(t1, -p2);",
    "  float s = (4.0 - p2.z) / max(t2.z, 0.15);",
    "  return p2.xy + t2.xy * s;",
    "}",
    "void main(){",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    "  vec3 col = bg(p);",
    // the ball's shadow on the counter, and the light it focuses into it
    "  col *= 1.0 - 0.42 * g2((p - vec2(u_c.x + 0.3 * u_r, u_fy + 0.05 * u_r)) / vec2(1.15 * u_r, 0.26 * u_r));",
    "  col += vec3(1.0, 0.85, 0.58) * 0.5 * g2((p - vec2(u_c.x + 0.62 * u_r, u_fy + 0.07 * u_r)) / vec2(0.36 * u_r, 0.075 * u_r));",
    "  vec2 d = (p - u_c) / u_r;",
    "  float rr = length(d);",
    "  float a = clamp((1.0 - rr) * u_res.y * u_r + 0.5, 0.0, 1.0);",
    "  if (a > 0.0) {",
    "    vec2 e = d * (0.999 / max(rr, 0.999));",
    "    float r2 = dot(e, e);",
    "    float z = sqrt(max(1.0 - r2, 0.0));",
    "    vec3 glass = vec3(bg(u_c + through(e, z, 1.475) * u_r).r, bg(u_c + through(e, z, 1.5) * u_r).g, bg(u_c + through(e, z, 1.525) * u_r).b);",
    "    glass *= vec3(0.96, 0.98, 1.0) * mix(1.0, 0.62, smoothstep(0.7, 1.0, r2));",
    // Fresnel: a reflected room, a window with a cross bar, a small highlight
    "    float F = 0.04 + 0.96 * pow(1.0 - z, 5.0);",
    "    vec3 R = reflect(vec3(0.0, 0.0, 1.0), vec3(e, -z));",
    "    vec3 env = mix(vec3(0.36, 0.24, 0.18), vec3(1.0, 0.96, 0.9), smoothstep(-0.3, 0.6, R.y));",
    "    float win = smoothstep(-0.74, -0.7, R.x) * (1.0 - smoothstep(-0.36, -0.32, R.x)) * smoothstep(0.3, 0.34, R.y) * (1.0 - smoothstep(0.7, 0.74, R.y));",
    "    win *= smoothstep(0.012, 0.024, abs(R.x + 0.53)) * smoothstep(0.012, 0.024, abs(R.y - 0.52));",
    "    glass = mix(glass, env, F * 0.85) + win * (0.35 + F) * vec3(1.0, 0.99, 0.96);",
    "    glass += pow(max(dot(vec3(e, -z), normalize(vec3(-0.42, 0.5, -1.0))), 0.0), 260.0) * 1.2;",
    // light gathered in the lower rim, opposite the window
    "    glass += vec3(1.0, 0.88, 0.7) * 0.4 * smoothstep(0.82, 1.0, r2) * max(0.0, 0.3 * e.x - 0.8 * e.y);",
    "    col = mix(col, glass, a);",
    "  }",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function setup(root) {
    var canvas = root.querySelector(".cb-canvas"), img = root.querySelector(".cb-photo");
    if (!canvas || !img || canvas.cbOn) return;
    canvas.cbOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the photo and the CSS ball stay
    var btn = root.querySelector(".cb-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, ready = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, cw = 1, ch = 1;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var iw = 800, ih = 600, sx = 1, sy = 1, asp = 1, size = 0.2, floor = 0.29, R = 0.2, fy = 0, minX = 0, maxX = 0;
    var x = 0, v = 0, tx = 0, home = 0.24, placed = false, pointerIn = false, pointerAt = -1e9, dragging = false;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("crystal-ball shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("crystal-ball link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "img", "cov", "asp", "c", "r", "fy"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      ready = false;
      if (img.complete && img.naturalWidth) upload(); else img.addEventListener("load", upload, { once: true });
      return true;
    }
    // the photo once into a 2D canvas at up to 2 x its size (crisp for an SVG), then into a texture
    function upload() {
      if (!prog || lost) return;
      iw = img.naturalWidth || 800; ih = img.naturalHeight || 600;
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
      } catch (e) { if (btn) btn.hidden = true; return; }   // unreadable image: the photo and the CSS ball stay
      ready = true;
      if (btn) btn.hidden = !clock;
      fit();
    }

    function render() {
      if (!prog || lost || !w || !ready) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform4f(U.cov, sx, sy, 0.5 - 0.5 * sx, 0.5 - 0.5 * sy);
      gl.uniform1f(U.asp, asp);
      gl.uniform2f(U.c, x, fy + R * 0.97);
      gl.uniform1f(U.r, R);
      gl.uniform1f(U.fy, fy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      root.classList.add("is-live");
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), cs = getComputedStyle(root);
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      w = Math.max(1, Math.round(cw * scale)); h = Math.max(1, Math.round(ch * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      asp = cw / ch;
      var ia = iw / ih; sx = 1; sy = 1;
      if (asp > ia) sy = ia / asp; else sx = asp / ia;
      size = Math.max(0.08, Math.min(0.4, parseFloat(cs.getPropertyValue("--cb-size")) || 0.2));
      floor = Math.max(0, Math.min(1, parseFloat(cs.getPropertyValue("--cb-floor")) || 0.29));
      R = size * Math.min(1, 0.75 * asp);
      fy = (floor - (0.5 - 0.5 * sy)) / sy - 0.5;   // photo height share to box height units
      minX = -asp / 2 + R * 1.08; maxX = asp / 2 - R * 1.08;
      if (minX > maxX) minX = maxX = 0;
      if (!placed || reduce.matches) { x = home * asp; tx = x; placed = true; }
      x = Math.max(minX, Math.min(maxX, x)); tx = Math.max(minX, Math.min(maxX, tx));
      render();
      kick();
    }

    function settled() { return Math.abs(tx - x) + Math.abs(v) < 0.0006; }
    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && ready; }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      var dt = last ? Math.min(40, now - last) : 16, s = dt / 1000;
      last = now;
      if (!checked) {
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      if (!pointerIn && now - pointerAt > 1500) {
        // nobody is pointing: the ball rolls slowly to and fro on the clock
        var a = (clock && clock.currentTime != null ? clock.currentTime % PERIOD : 0) / PERIOD * 6.2831853;
        tx = (minX + maxX) / 2 + (maxX - minX) / 2 * 0.8 * Math.sin(a + 0.6);
      }
      // a heavy ball: a spring with a little overshoot, speed capped
      v += (14 * (tx - x) - 5.2 * v) * s;
      v = Math.max(-1.6, Math.min(1.6, v));
      x += v * s;
      if (x < minX) { x = minX; v = Math.abs(v) * 0.3; } else if (x > maxX) { x = maxX; v = -Math.abs(v) * 0.3; }
      render();
      if (!paused || !settled()) raf = requestAnimationFrame(frame);
    }

    function point(e) {
      if (reduce.matches) return;
      if (e.pointerType === "touch" && !dragging) return;
      var b = root.getBoundingClientRect();
      tx = Math.max(minX, Math.min(maxX, ((e.clientX - b.left) / b.width - 0.5) * asp));
      pointerIn = true; pointerAt = performance.now();
      kick();
    }
    function down(e) { if (e.pointerType === "touch") dragging = true; point(e); }
    function leave() { dragging = false; pointerIn = false; pointerAt = performance.now(); kick(); }
    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      kick();
    }
    function sync() {
      if (reduce.matches) {
        // one still frame, the ball at rest on the right
        if (clock) { clock.cancel(); clock = null; }
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (btn) btn.hidden = true;
        last = 0; v = 0;
        fit();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: PERIOD, iterations: Infinity });
        clock.id = "crystal ball";   // a timer only: it animates nothing visible
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !(clock && ready);
      fit();
    }

    if (!build()) return;
    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointerup", function (e) { if (e.pointerType === "touch") leave(); });
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    if (btn) {
      btn.addEventListener("click", function () { setPaused(!paused); });
      btn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    }
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null; ready = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      root.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; build(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(canvas); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", sync);
    sync();
  }

  function init() { document.querySelectorAll(".crystalball").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
