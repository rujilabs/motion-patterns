/*
 * oil-sheen.js: in every .sheen, a WebGL fragment shader on its .os-canvas draws a dark, glossy panel
 * with a thin-film rainbow sheen, the colours of a fresh ceramic coat or oil on water. The sheen
 * shifts as the pointer (mouse, pen or a finger) moves, as the colours do when you walk round a car;
 * when nobody points, a slow unseen hand moves the light on its own.
 *   <section class="sheen">
 *     <canvas class="os-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="os-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --os-paint and --os-light (6 digit hex), the same ones the CSS fallback uses; the
 * rainbow itself comes from the physics, not a colour list.
 * The maths: the film thickness is fbm value noise (three octaves) with a domain warp, the noise read
 * from a 64 x 64 random texture made once in JS, filtered by the GPU with a smoothstep remap. The
 * colour is two-beam interference: brightness 0.5 + 0.5 cos(2 pi * path / wavelength) for red, green
 * and blue wavelengths in the ratio 1 : 1.18 : 1.38, where the path grows with the thickness and with
 * how slantwise you look, which the pointer sets.
 * Time runs on a Web Animations clock ("sheen drift"), so the gallery timeline and the Pause button
 * both stop the drift.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 80000;   // one full loop of the film drift, ms: the clock period

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_a;",       // 0 to 2 pi over one loop
    "uniform vec2 u_eye;",      // eased pointer in height units from the middle
    "uniform vec3 u_paint;",
    "uniform vec3 u_light;",
    "uniform sampler2D u_rnd;", // 64 x 64 random bytes, linear, repeat
    // smooth value noise: the GPU's bilinear filter on a smoothstepped cell position
    "float vn(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  return texture2D(u_rnd, (mod(i, 64.0) + f + 0.5) / 64.0).r;",
    "}",
    "float fbm(vec2 p){",
    "  return 0.55 * vn(p) + 0.3 * vn(p * 2.03 + 17.0) + 0.15 * vn(p * 4.01 + 41.0);",
    "}",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    // the film drifts round a circle in noise space, so the loop has no seam
    "  vec2 o = vec2(cos(u_a), sin(u_a)) * 1.6;",
    "  vec2 q = uv * 1.7;",
    "  vec2 warp = vec2(fbm(q * 0.8 + o), fbm(q * 0.8 + 7.3 - o.yx));",
    "  float film = fbm(q + 1.8 * warp + o * 0.5);",
    // slantwise view near the pointer: a longer path through the film shifts the colours
    "  vec2 dv = uv - u_eye;",
    "  float slant = exp(-dot(dv, dv) * 4.5);",
    "  float path = 0.8 + 2.2 * film + 0.6 * slant + 0.2 * dot(uv, u_eye);",
    "  vec3 irid = 0.5 + 0.5 * cos(6.2831853 * path * vec3(1.0, 1.18, 1.38));",
    "  irid = mix(vec3(dot(irid, vec3(0.333))), irid, 0.6);",
    // the panel: dark paint with a clear-coat gradient and the reflection of a two-tube softbox
    "  vec3 col = u_paint * (0.8 + 0.6 * smoothstep(-0.6, 0.6, uv.y + uv.x * 0.3));",
    "  float off = uv.y - 0.38 * uv.x - 0.2 - 0.12 * u_eye.y;",
    "  float px = 1.0 / u_res.y;",
    "  float tubes = 1.0 - smoothstep(2.5 * px, 6.0 * px, min(abs(off), abs(off + 0.1)));",
    "  float wide = 1.0 - smoothstep(0.04, 0.32, abs(off + 0.05));",
    "  float glow = 0.03 + 0.32 * slant + 0.2 * wide;",
    "  col += pow(irid, vec3(2.4)) * glow;",
    "  col += u_light * tubes * (0.55 + 0.15 * irid);",
    "  col += u_light * pow(slant, 5.0) * 0.14;",
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
    var canvas = root.querySelector(".os-canvas");
    if (!canvas || canvas.osOn) return;
    canvas.osOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".os-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var ex = 0.3, ey = 0.1, tx = 0.3, ty = 0.1, pointerIn = false, pointerAt = -1e9;
    var paint, light;

    function colours() {
      var cs = getComputedStyle(root);
      paint = hex(cs.getPropertyValue("--os-paint"), [0.05, 0.06, 0.08]);
      light = hex(cs.getPropertyValue("--os-light"), [0.9, 0.93, 1]);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("oil-sheen shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("oil-sheen link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "a", "eye", "paint", "light", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed, so every load lays the same film; LINEAR makes it value noise
      var bytes = new Uint8Array(64 * 64 * 4), seed = 9119;
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

    function angle() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD * 6.2831853 : 2.1; }
    function render(a) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.a, a);
      gl.uniform2f(U.eye, ex, ey);
      gl.uniform3f(U.paint, paint[0], paint[1], paint[2]);
      gl.uniform3f(U.light, light[0], light[1], light[2]);
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
      var a = angle(), half = w / h / 2;
      if (!pointerIn && now - pointerAt > 1500) {
        // nobody is pointing: a slow unseen hand walks the light round the panel, on the drift's clock
        tx = half * 0.6 * Math.sin(a * 3); ty = 0.28 * Math.sin(a * 4 + 1);
      }
      var k = 1 - Math.exp(-dt / 260), dx = tx - ex, dy = ty - ey;
      ex += dx * k; ey += dy * k;
      render(a);
      if (!paused || Math.abs(dx) + Math.abs(dy) > 0.002) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      ex = 0.32 * w / h; ey = 0.12;
      render(2.1);
    }

    function point(e) {
      if (reduce.matches) return;
      var b = root.getBoundingClientRect();
      tx = ((e.clientX - b.left) - b.width / 2) / b.height; ty = (b.height / 2 - (e.clientY - b.top)) / b.height;
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
        clock.id = "sheen drift";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? 2.1 : angle()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".sheen").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
