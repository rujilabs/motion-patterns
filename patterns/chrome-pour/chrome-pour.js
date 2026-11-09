/*
 * chrome-pour.js: in every .chromepour, a WebGL fragment shader on its .cp-canvas draws a stream of
 * liquid chrome pouring into a pool of it. Bulges run down the stream, rings run out across the pool,
 * and both mirror a studio: a softbox behind you that follows the pointer (mouse, pen or a finger),
 * ceiling tubes and a warm glow from the welding bay. When nobody points, the light wanders on its own.
 *   <section class="chromepour">
 *     <canvas class="cp-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="cp-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --cp-wall, --cp-light and --cp-warm (6 digit hex); --cp-x and --cp-h place the
 * stream and the far edge of the pool.
 * The maths: chrome is a mirror, so each pixel is the studio seen along the reflected view ray. The
 * stream is a cylinder whose radius ripples with two sines running down it; across it the normal is
 * (u, ny, sqrt(1 - u^2)). The pool is a flat plane seen in perspective (depth = 1 / distance below the
 * far edge) with a damped radial wave from the point of impact plus two travelling waves; their slopes
 * are written out exactly, so the normal needs no finite differences. Below the impact point the pool
 * also mirrors the stream, shifted by the ripple slope.
 * Time runs on a Web Animations clock ("chrome pour"); every phase is worked out in JS as a whole
 * number of turns per loop, so the loop has no seam and stays precise at mediump.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 6000;   // one loop of the flow, ms: the clock period
  // whole turns per loop of each phase: stream bulge, fine bulge, sway, rings, two pool waves
  var TURNS = [5, 9, 1, 4, 2, 3];

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_s;",       // px per scene unit
    "uniform float u_cx;",      // stream centre x, scene units
    "uniform float u_hz;",      // far edge of the pool, scene y
    "uniform vec4 u_ph;",       // phases: bulge, fine bulge, sway, rings
    "uniform vec2 u_ph2;",      // phases: pool waves
    "uniform vec2 u_l;",        // softbox direction, eased pointer
    "uniform vec3 u_wall;",
    "uniform vec3 u_light;",
    "uniform vec3 u_warm;",
    "float g(float x){ x = min(abs(x), 6.0); return exp(-x * x); }",
    // the studio, seen along direction r (x right, y up, z toward the viewer)
    "vec3 env(vec3 r){",
    "  vec3 c = mix(u_wall * 0.3, u_wall * 2.2 + 0.05, smoothstep(-0.45, 0.4, r.y));",
    // ceiling tubes overhead
    "  float cy = max(r.y, 0.08);",
    "  float tx = r.x / cy - u_l.x * 0.7;",
    "  c += vec3(0.92, 0.96, 1.0) * (g((tx - 0.85) / 0.06) + g((tx + 0.75) / 0.06)) * smoothstep(0.3, 0.55, r.y) * 0.85;",
    // high windows on the far wall, ahead
    "  float fz = max(-r.z, 0.2);",
    "  float wx = fract(r.x / fz * 1.6 + 0.3); float pane = smoothstep(0.05, 0.14, wx) * (1.0 - smoothstep(0.86, 0.95, wx));",
    "  c += vec3(0.72, 0.8, 0.88) * 0.5 * pane * (1.0 - smoothstep(0.035, 0.06, abs(r.y / fz - 0.2))) * (1.0 - smoothstep(-0.25, 0.0, r.z));",
    // behind the viewer: a pale studio wall, a tall softbox and a strip light
    "  float behind = smoothstep(-0.1, 0.3, r.z);",
    "  vec2 q = r.xy / (1.0 + max(r.z, -0.6));",
    "  float box = (1.0 - smoothstep(0.14, 0.22, abs(q.x - u_l.x))) * (1.0 - smoothstep(0.3, 0.42, abs(q.y - u_l.y)));",
    "  c += u_light * behind * (0.1 + box * 1.5 + 0.55 * g((q.x - u_l.x - 0.6) / 0.035) * (1.0 - smoothstep(0.35, 0.6, abs(q.y - u_l.y))));",
    // a warm glow from the welding bay, ahead and to the left
    "  c += u_warm * 0.45 * g(length(vec2(r.x + 0.6, r.y - 0.02)) / 0.22) * (1.0 - smoothstep(-0.3, 0.1, r.z));",
    "  return c;",
    "}",
    "vec3 chrome(vec3 r){ return env(r) * vec3(0.9, 0.93, 0.97); }",
    // the stream at p: rgb, and coverage in a
    "vec4 stream(vec2 p, float yb, float top){",
    "  if (p.y < yb - 0.01) return vec4(0.0);",
    "  float down = clamp((p.y - yb) / (top - yb), 0.0, 1.0);",
    "  float hw = (0.052 + 0.008 * sin(p.y * 15.0 + u_ph.x) + 0.003 * sin(p.y * 41.0 + u_ph.y)) * (0.78 + 0.4 * down);",
    "  float dhw = (0.105 * cos(p.y * 15.0 + u_ph.x) + 0.123 * cos(p.y * 41.0 + u_ph.y)) * (0.78 + 0.4 * down);",
    "  float u = (p.x - u_cx - 0.006 * sin(p.y * 6.0 + u_ph.z)) / hw;",
    "  float cov = clamp((1.0 - abs(u)) * hw * u_s * 0.8, 0.0, 1.0) * smoothstep(yb - 0.01, yb + 0.004, p.y);",
    "  float nz = sqrt(max(1.0 - u * u, 0.0));",
    "  vec3 n = normalize(vec3(u, -dhw * abs(u) * 0.6, nz + 0.001));",
    "  vec3 r = vec3(0.0, 0.0, -1.0) + 2.0 * n.z * n;",
    "  return vec4(chrome(r) * (0.75 + 0.25 * nz), cov);",
    "}",
    "void main(){",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_s;",
    "  float top = 0.5 * u_res.y / u_s;",
    "  float yb = u_hz - 0.1;",
    // the wall behind: dark, with a soft wash of the studio light
    "  vec3 col = u_wall * (0.8 + 0.5 * smoothstep(-0.2, 0.6, p.y)) + u_light * 0.05 * g(length(p - vec2(u_l.x, top * 0.6)) / 0.7);",
    "  col += u_warm * 0.05 * g(length(p - vec2(-0.9, u_hz + 0.1)) / 0.5);",
    "  if (p.y < u_hz) {",
    // the pool in perspective: camera 1 above the surface, depth 1 / distance below the far edge
    "    float dy = max(u_hz - p.y, 0.03);",
    "    float z = 1.0 / dy, x = (p.x - u_cx) * z;",
    "    vec2 rv = vec2(x, z - 10.0);",
    "    float rr = length(rv) + 0.001;",
    "    float fade = smoothstep(0.03, 0.14, u_hz - p.y);",
    "    float e = exp(-rr * 0.16);",
    "    float a = rr * 3.2 - u_ph.w;",
    "    vec2 gr = rv / rr * 0.05 * e * (3.2 * cos(a) - 0.16 * sin(a));",
    "    gr += vec2(0.7, 1.1) * 0.016 * cos(0.7 * x + 1.1 * z - u_ph2.x) + vec2(-1.3, 0.6) * 0.01 * cos(-1.3 * x + 0.6 * z - u_ph2.y);",
    "    gr *= fade;",
    "    vec3 n = normalize(vec3(-gr.x, 1.0, gr.y));",
    "    vec3 d = normalize(vec3(x, -1.0, -z));",
    "    vec3 pool = chrome(reflect(d, n));",
    // the stream, mirrored below its foot and shaken by the ripple slope
    "    vec4 m = stream(vec2(p.x + gr.x * 0.35, 2.0 * yb - p.y), yb, top);",
    "    pool = mix(pool, m.rgb * 0.7, m.a * step(p.y, yb) * (0.12 + 0.55 * exp(-(yb - p.y) * 7.0)));",
    "    pool = mix(u_wall * 1.6, pool, 0.35 + 0.65 * fade);",
    "    col = pool + u_light * 0.25 * g((u_hz - p.y) / 0.004);",
    "  }",
    "  vec4 s = stream(p, yb, top);",
    "  col = mix(col, s.rgb, s.a);",
    // a bright collar where the stream meets the pool
    "  col += u_light * 0.35 * g(length((p - vec2(u_cx, yb)) * vec2(1.0, 3.0)) / 0.05);",
    "  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  function num(v, f) { var n = parseFloat(v); return isFinite(n) ? n : f; }

  function setup(root) {
    var canvas = root.querySelector(".cp-canvas");
    if (!canvas || canvas.cpOn) return;
    canvas.cpOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".cp-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, S = 1;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var wall, light, warm, sx = 0.72, sh = 0.56;
    var lx = 0.1, ly = 0.05, tx = 0.1, ty = 0.05, pointerIn = false, pointerAt = -1e9;
    var ph = new Float32Array(6);

    function read() {
      var cs = getComputedStyle(root);
      wall = hex(cs.getPropertyValue("--cp-wall"), [0.08, 0.09, 0.1]);
      light = hex(cs.getPropertyValue("--cp-light"), [1, 0.96, 0.89]);
      warm = hex(cs.getPropertyValue("--cp-warm"), [1, 0.48, 0.18]);
      sx = num(cs.getPropertyValue("--cp-x"), 0.72);
      sh = num(cs.getPropertyValue("--cp-h"), 0.56);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("chrome-pour shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("chrome-pour link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "s", "cx", "hz", "ph", "ph2", "l", "wall", "light", "warm"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      return true;
    }

    function frac() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD : 0.3; }
    function render(f) {
      if (!prog || lost || !w) return;
      for (var i = 0; i < 6; i++) ph[i] = ((f * TURNS[i]) % 1) * 6.2831853;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.s, S);
      gl.uniform1f(U.cx, (sx - 0.5) * w / S);
      gl.uniform1f(U.hz, (0.5 - sh) * h / S);
      gl.uniform4f(U.ph, ph[0], ph[1], ph[2], ph[3]);
      gl.uniform2f(U.ph2, ph[4], ph[5]);
      gl.uniform2f(U.l, lx, ly);
      gl.uniform3f(U.wall, wall[0], wall[1], wall[2]);
      gl.uniform3f(U.light, light[0], light[1], light[2]);
      gl.uniform3f(U.warm, warm[0], warm[1], warm[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var b = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(b.width * scale)); h = Math.max(1, Math.round(b.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      S = Math.min(h, 0.75 * w);
      read();
      if (reduce.matches) still(); else { render(frac()); kick(); }
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
      var f = frac();
      if (!pointerIn && now - pointerAt > 1500) {
        // nobody is pointing: the light wanders slowly, once round per four loops of the flow
        var a = ((clock && clock.currentTime != null ? clock.currentTime : 0) % (PERIOD * 4)) / (PERIOD * 4) * 6.2831853;
        tx = 0.45 * Math.sin(a); ty = 0.05 + 0.12 * Math.sin(a * 2 + 0.6);
      }
      var k = 1 - Math.exp(-dt / 300), dx = tx - lx, dy = ty - ly;
      lx += dx * k; ly += dy * k;
      render(f);
      if (!paused || Math.abs(dx) + Math.abs(dy) > 0.002) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      lx = 0.2; ly = 0.05;
      render(0.3);
    }

    function point(e) {
      if (reduce.matches) return;
      var b = root.getBoundingClientRect();
      // the softbox moves with the pointer: across the width, and a little up and down
      tx = Math.max(-0.7, Math.min(0.7, ((e.clientX - b.left) / b.width - 0.5) * 1.6));
      ty = Math.max(-0.25, Math.min(0.3, (0.5 - (e.clientY - b.top) / b.height) * 0.6));
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
        clock.id = "chrome pour";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { read(); render(reduce.matches ? 0.3 : frac()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".chromepour").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
