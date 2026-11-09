/*
 * smoke-ether.js: in every .ether, a WebGL fragment shader on its .sx-canvas draws soft coloured smoke
 * rising through a dark room, flowing along curl noise and parting round the pointer (mouse, pen or a
 * finger) like smoke round a passing hand.
 *   <section class="ether">
 *     <canvas class="sx-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="sx-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --sx-base, --sx-a and --sx-b (6 digit hex), the same ones the CSS fallback uses.
 * The maths, all analytic (no simulation, nothing kept between frames): a stream function psi = (value
 * noise + an upward drift) x a smoothstep that is zero round the pointer. Its curl (d psi / dy, -d psi / dx)
 * is a velocity field with no divergence that flows round the pointer like water round a stone. The value
 * noise gives its own gradient analytically from the four corner values (no finite differences). Each
 * pixel is traced back four short steps along that field, and the smoke density (three octaves of value
 * noise scrolling upward) is read where it came from, so wisps stretch along the flow.
 * Time runs on a Web Animations clock ("smoke drift"): the noise scrolls one whole period of its tile and
 * the flow's noise moves once round a circle per loop, so the loop has no seam and coordinates stay small
 * (precise at mediump). Idle for 1.5 s, an unseen hand drifts slowly through the smoke.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames average
 * over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context released on
 * pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays; under reduced motion
 * one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 90000;   // one full loop, ms: the clock period
  var TILE = 16;        // the density noise repeats every 16 cells; it scrolls one tile per loop

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",       // drawing buffer, px
    "uniform float u_a;",        // 0 to 2 pi over one loop
    "uniform float u_scroll;",   // 0 to 16 cells over one loop
    "uniform vec3 u_hand;",      // eased pointer in height units from the middle, and its radius (0 = none)
    "uniform vec3 u_base;",
    "uniform vec3 u_ca;",
    "uniform vec3 u_cb;",
    "uniform sampler2D u_rnd;",  // 64 x 64 random bytes, NEAREST
    "float cell(vec2 i){ return texture2D(u_rnd, (i + 0.5) / 64.0).r; }",
    // value noise with its gradient, both exact: v = bilinear of the corners on smoothstepped f; it tiles every 16 cells
    "vec3 vnd(vec2 p, vec2 off){",
    "  vec2 i = floor(p); vec2 f = p - i;",
    "  vec2 u = f * f * (3.0 - 2.0 * f); vec2 du = 6.0 * f * (1.0 - f);",
    "  vec2 i0 = mod(i, 16.0) + off, i1 = mod(i + 1.0, 16.0) + off;",
    "  float a = cell(i0), b = cell(vec2(i1.x, i0.y)), c = cell(vec2(i0.x, i1.y)), d = cell(i1);",
    "  float k = a - b - c + d;",
    "  return vec3(a + (b - a) * u.x + (c - a) * u.y + k * u.x * u.y, du * vec2(b - a + k * u.y, c - a + k * u.x));",
    "}",
    "float vn(vec2 p, vec2 off){",
    "  vec2 i = floor(p); vec2 f = p - i; f = f * f * (3.0 - 2.0 * f);",
    "  vec2 i0 = mod(i, 16.0) + off, i1 = mod(i + 1.0, 16.0) + off;",
    "  float a = cell(i0), b = cell(vec2(i1.x, i0.y)), c = cell(vec2(i0.x, i1.y)), d = cell(i1);",
    "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
    "}",
    // the flow: curl of psi = (noise + drift) x gate, the gate zero round the hand
    "vec2 flow(vec2 p, vec2 orbit){",
    "  vec3 n = vnd(p * 1.4 + orbit, vec2(20.0, 3.0));",
    "  float psi = (n.x - 0.5) * 0.8 - 0.32 * p.x;",
    "  vec2 g = n.yz * 1.4 * 0.8 - vec2(0.32, 0.0);",
    "  vec2 d = p - u_hand.xy;",
    "  float r = length(d) + 0.0001;",
    "  float r0 = u_hand.z * 0.35, r1 = u_hand.z * 2.4 + 0.0001;",
    "  float s = clamp((r - r0) / (r1 - r0), 0.0, 1.0);",
    "  float gate = u_hand.z > 0.0 ? s * s * (3.0 - 2.0 * s) : 1.0;",
    "  vec2 dgate = u_hand.z > 0.0 ? (6.0 * s * (1.0 - s) / (r1 - r0)) * d / r : vec2(0.0);",
    "  g = g * gate + psi * dgate;",
    // cap the speed so a trace step never jumps across the hand (that would draw a hard ring)
    "  return vec2(g.y, -g.x) * min(1.0, 0.9 / (length(g) + 0.0001));",
    "}",
    "void main(){",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    "  vec2 orbit = 1.8 * vec2(cos(u_a), sin(u_a));",
    "  vec2 q = p;",
    "  for (int k = 0; k < 4; k++) q -= flow(q, orbit) * 0.11;",
    "  vec2 s = q * 2.2 - vec2(0.0, u_scroll);",
    "  float d = vn(s, vec2(0.0)) * 0.5 + vn(s * 2.0 + 5.0, vec2(30.0, 40.0)) * 0.3 + vn(s * 4.0 + 9.0, vec2(4.0, 44.0)) * 0.2;",
    // wisps: the ridge where the noise crosses its middle, plus a soft body
    "  float wisp = 1.0 - min(abs(d - 0.52) * 6.0, 1.0);",
    "  float body = smoothstep(0.4, 0.82, d);",
    "  float dens = body * 0.95 + wisp * wisp * wisp * 0.5;",
    // more smoke low in the room, thinning as it rises
    "  dens *= clamp(0.85 - p.y * 0.9, 0.12, 1.0);",
    // smoke thins where the hand is
    "  if (u_hand.z > 0.0) dens *= smoothstep(u_hand.z * 0.5, u_hand.z * 1.5, length(p - u_hand.xy));",
    "  float mixc = vn(q * 1.9 + orbit * 0.6, vec2(48.0, 12.0));",
    "  vec3 smoke = mix(u_ca, u_cb, smoothstep(0.22, 0.78, mixc));",
    "  vec3 col = mix(u_base, smoke, min(dens, 1.0) * 0.92);",
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
    var canvas = root.querySelector(".sx-canvas");
    if (!canvas || canvas.sxOn) return;
    canvas.sxOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".sx-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    // the hand: eased position and radius, target position and radius
    var hx = 0.3, hy = -0.1, hr = 0, tx = 0.3, ty = -0.1, tr = 0, pointerIn = false, pointerAt = -1e9;
    var base, ca, cb, reach = 0.12, idleX = 0.25;

    function colours() {
      var cs = getComputedStyle(root);
      base = hex(cs.getPropertyValue("--sx-base"), [0.13, 0.1, 0.11]);
      ca = hex(cs.getPropertyValue("--sx-a"), [0.96, 0.76, 0.66]);
      cb = hex(cs.getPropertyValue("--sx-b"), [0.66, 0.8, 0.75]);
      reach = +cs.getPropertyValue("--sx-reach") || 0.12;
      idleX = cs.getPropertyValue("--sx-idle-x") === "" ? 0.25 : +cs.getPropertyValue("--sx-idle-x");
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("smoke-ether shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("smoke-ether link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "a", "scroll", "hand", "base", "ca", "cb", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed, read cell by cell (NEAREST): the corners of the value noise
      var bytes = new Uint8Array(64 * 64 * 4), seed = 2203;
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

    function phase() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD : 0.31; }
    function render(f) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.a, f * 6.2831853);
      gl.uniform1f(U.scroll, f * TILE);
      gl.uniform3f(U.hand, hx, hy, hr);
      gl.uniform3f(U.base, base[0], base[1], base[2]);
      gl.uniform3f(U.ca, ca[0], ca[1], ca[2]);
      gl.uniform3f(U.cb, cb[0], cb[1], cb[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      colours();
      if (reduce.matches) still(); else { render(phase()); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog; }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function idle(f) {
      // nobody is pointing: an unseen hand drifts slowly through the smoke, on the drift's clock
      var a = f * 6.2831853;
      tx = idleX * w / h + 0.16 * w / h * Math.sin(a * 4); ty = -0.12 + 0.2 * Math.sin(a * 6 + 0.8); tr = reach;
    }
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
      var f = phase();
      if (!pointerIn && now - pointerAt > 1500) idle(f);
      var k = 1 - Math.exp(-dt / 220), dx = tx - hx, dy = ty - hy, dr = tr - hr;
      hx += dx * k; hy += dy * k; hr += dr * k;
      render(f);
      if (!paused || Math.abs(dx) + Math.abs(dy) + Math.abs(dr) > 0.002) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      idle(0.31); hx = tx; hy = ty; hr = tr;
      render(0.31);
    }

    function point(e) {
      if (reduce.matches) return;
      var b = root.getBoundingClientRect();
      tx = ((e.clientX - b.left) - b.width / 2) / b.height; ty = (b.height / 2 - (e.clientY - b.top)) / b.height; tr = reach;
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
        clock.id = "smoke drift";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? 0.31 : phase()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".ether").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
