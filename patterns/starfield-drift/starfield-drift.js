/*
 * starfield-drift.js: in every .starfield, a spiral galaxy drawn by a WebGL fragment shader on its
 * .sf-canvas turns slowly and leans toward the pointer (mouse, pen or a finger), the near side of the
 * disc tipping toward it while the far background stars shift a little the other way.
 *   <section class="starfield" data-sf-centre="0.7 0.42">
 *     <canvas class="sf-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="sf-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --sf-sky, --sf-star and --sf-glow (6 digit hex), the same ones the CSS fallback uses.
 * The maths: stars sit one per cell of a grid in the turning disc plane, kept by a two-armed log spiral
 * density cos(2 theta - 4.6 ln r) times an exponential falloff, with random bytes from a 64 x 64 texture
 * (made once in JS) placing and sizing each star. The lean is a projective skew of the disc toward the
 * pointer plus a small parallax on a second, still star layer.
 * Time runs on a Web Animations clock ("galaxy turn"), so the gallery timeline and the Pause button
 * both stop the turn. When nobody points, a slow unseen hand leans the disc on the same clock.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TURN = 240000;   // one full turn of the galaxy, ms: the clock period

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_a;",       // spin angle, 0 to 2 pi over one turn
    "uniform vec2 u_lean;",     // eased pointer from the galaxy centre, length up to 1
    "uniform vec2 u_c;",        // galaxy centre in height units from the middle
    "uniform vec3 u_sky;",
    "uniform vec3 u_star;",
    "uniform vec3 u_glow;",
    "uniform sampler2D u_rnd;", // 64 x 64 random bytes, nearest, repeat
    "vec4 rnd(vec2 id){ return texture2D(u_rnd, (mod(id, 64.0) + 0.5) / 64.0); }",
    // two-armed log spiral density in the disc plane, 0 to 1
    "float arm(vec2 p){",
    "  float r = length(p) + 0.02;",
    "  float s = 0.5 + 0.5 * cos(2.0 * atan(p.y, p.x) - 4.6 * log(r));",
    "  return s * s * s * exp(-r * 2.4);",
    "}",
    // one star per cell; dens(cell centre) decides if the cell has one
    "float disc(vec2 p, float cells, float off, float tw){",
    "  vec2 g = p * cells + off; vec2 id = floor(g); vec2 f = g - id - 0.5;",
    "  vec4 r = rnd(id + cells);",
    "  vec2 cc = (id + 0.5 - off) / cells;",
    "  float dens = 0.05 + 2.6 * arm(cc) + 1.4 * exp(-dot(cc, cc) * 30.0);",
    "  float on = step(1.0 - min(dens, 0.92), r.z);",
    "  float d = length(f - (r.xy - 0.5) * 0.55);",
    "  float size = 0.07 + 0.11 * r.w * r.w;",
    "  float twinkle = 0.7 + 0.3 * sin(tw * (3.0 + floor(r.w * 5.0)) + r.x * 6.283);",
    "  return on * (1.0 - smoothstep(0.0, size, d)) * twinkle;",
    "}",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    "  vec2 c = u_c + u_lean * 0.05;",
    "  vec2 p = uv - c;",
    // lean: the side toward the pointer comes nearer (bigger), the far side recedes
    "  float m = length(u_lean);",
    "  vec2 n = m > 0.001 ? u_lean / m : vec2(1.0, 0.0);",
    "  p /= 1.0 + 0.9 * m * dot(p, n);",
    // the disc is seen at an angle, then turned by the spin
    "  p *= 1.15; p.y /= 0.58 - 0.12 * m;",
    "  float ca = cos(u_a), sa = sin(u_a);",
    "  vec2 q = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);",
    "  float r = length(q);",
    "  float a = arm(q);",
    "  vec3 col = u_sky * (0.75 + 0.35 * (1.0 - gl_FragCoord.y / u_res.y));",
    "  col += u_glow * (a * 0.55 + exp(-r * r * 26.0) * 0.6);",
    "  col += mix(u_star, vec3(1.0, 0.93, 0.82), 0.5) * exp(-r * r * 160.0) * 0.8;",
    "  float s = disc(q, 46.0, 0.0, u_a * 40.0) + 0.8 * disc(q, 78.0, 31.5, u_a * 55.0);",
    // far stars: not in the disc, shifted a little against the lean
    "  vec2 b = (uv - u_lean * 0.02) * 30.0; vec2 bi = floor(b); vec4 br = rnd(bi + 17.0);",
    "  float fs = step(0.86, br.z) * (1.0 - smoothstep(0.0, 0.09, length(b - bi - 0.5 - (br.xy - 0.5) * 0.6))) * (0.35 + 0.4 * br.w);",
    "  col += u_star * (s + fs);",
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
    var canvas = root.querySelector(".sf-canvas");
    if (!canvas || canvas.sfOn) return;
    canvas.sfOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".sf-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var lx = 0, ly = 0, tx = 0, ty = 0, pointerIn = false, pointerAt = -1e9;
    var at = (root.getAttribute("data-sf-centre") || "0.7 0.42").split(" ");
    var cxS = +at[0] || 0.7, cyS = +at[1] || 0.42;
    var sky, star, glow;

    function colours() {
      var cs = getComputedStyle(root);
      sky = hex(cs.getPropertyValue("--sf-sky"), [0.03, 0.04, 0.11]);
      star = hex(cs.getPropertyValue("--sf-star"), [0.92, 0.9, 1]);
      glow = hex(cs.getPropertyValue("--sf-glow"), [0.55, 0.32, 0.2]);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("starfield-drift shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("starfield-drift link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "a", "lean", "c", "sky", "star", "glow", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed, so every load draws the same sky
      var bytes = new Uint8Array(64 * 64 * 4), seed = 20261109;
      for (var i = 0; i < bytes.length; i++) { seed = (seed * 1103515245 + 12345) >>> 0; bytes[i] = seed >>> 24; }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.uniform1i(U.rnd, 0);
      return true;
    }

    function angle() { return clock && clock.currentTime != null ? (clock.currentTime % TURN) / TURN * 6.2831853 : 0.9; }
    function render(a) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.a, a);
      gl.uniform2f(U.lean, lx, ly);
      gl.uniform2f(U.c, (cxS - 0.5) * w / h, 0.5 - cyS);
      gl.uniform3f(U.sky, sky[0], sky[1], sky[2]);
      gl.uniform3f(U.star, star[0], star[1], star[2]);
      gl.uniform3f(U.glow, glow[0], glow[1], glow[2]);
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
        // nobody is pointing: a slow unseen hand leans the disc, on the turn's clock
        tx = 0.55 * Math.cos(a * 4); ty = 0.4 * Math.sin(a * 6 + 1);
      }
      var k = 1 - Math.exp(-dt / 420), dx = tx - lx, dy = ty - ly;
      lx += dx * k; ly += dy * k;
      render(a);
      if (!paused || Math.abs(dx) + Math.abs(dy) > 0.002) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      lx = 0.35; ly = 0.12;
      render(0.9);
    }

    function point(e) {
      if (reduce.matches) return;
      var b = root.getBoundingClientRect();
      var x = ((e.clientX - b.left) / b.width - cxS) / 0.5, y = (cyS - (e.clientY - b.top) / b.height) / 0.5;
      var l = Math.sqrt(x * x + y * y);
      if (l > 1) { x /= l; y /= l; }
      tx = x; ty = y; pointerIn = true; pointerAt = performance.now();
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
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: TURN, iterations: Infinity });
        clock.id = "galaxy turn";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? 0.9 : angle()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".starfield").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
