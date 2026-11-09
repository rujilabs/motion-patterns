/*
 * silk-fold.js: in every .silk, a WebGL fragment shader on its .sk-canvas draws a sheet of silk that
 * folds slowly and catches the light, with a fine gold diamond weave that rides the folds. The light
 * follows the pointer (mouse, pen or a finger); when nobody points it drifts on its own.
 *   <section class="silk">
 *     <canvas class="sk-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="sk-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --sk-deep, --sk-silk, --sk-sheen and --sk-gold (6 digit hex), the same ones the
 * CSS fallback uses.
 * The maths: the cloth is a height field, three travelling sines whose phase is bent by a fourth sine,
 * so the folds swell and slide rather than scroll. The normal comes from the slope of the height,
 * worked out by hand, the light is Lambert diffuse plus a wide sheen lobe and a tight Blinn highlight, and the weave
 * is drawn in cloth coordinates, the screen point pushed by the slope, so it bends with each fold.
 * Time runs on a Web Animations clock ("silk folds"), so the gallery timeline and the Pause button
 * both stop the folds.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 96000;   // one full cycle of the folds, ms: the clock period

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_a;",       // 0 to 2 pi over one cycle
    "uniform vec2 u_light;",    // eased light position, -1 to 1 across the sheet
    "uniform vec3 u_deep;",
    "uniform vec3 u_silk;",
    "uniform vec3 u_sheen;",
    "uniform vec3 u_gold;",
    // the cloth height and its slope, worked out by hand (no finite differences, so mediump stays smooth);
    // travelling sines, whole multiples of u_a so the cycle has no seam
    "vec3 cloth(vec2 p){",
    "  float qa = 2.1 * p.y + u_a * 3.0;",
    "  float fa = 3.0 * p.x + 1.2 * p.y + 0.9 * sin(qa) + u_a * 2.0;",
    "  float qb = 1.6 * p.x - u_a * 4.0;",
    "  float fb = 5.4 * p.x - 2.2 * p.y + 1.3 * sin(qb) - u_a * 3.0;",
    "  float fc = 8.7 * p.x + 4.3 * p.y + u_a * 5.0;",
    "  float ca = 0.5 * cos(fa), cb = 0.25 * cos(fb), cc = 0.06 * cos(fc);",
    "  return vec3(0.5 * sin(fa) + 0.25 * sin(fb) + 0.06 * sin(fc),",
    "    ca * 3.0 + cb * (5.4 + 2.08 * cos(qb)) + cc * 8.7,",
    "    ca * (1.2 + 1.89 * cos(qa)) - cb * 2.2 + cc * 4.3);",
    "}",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    "  vec2 p = uv * 1.15;",
    "  vec3 cl = cloth(p);",
    "  float h0 = cl.x;",
    "  vec2 g = cl.yz;",
    "  vec3 n = normalize(vec3(-g * 0.22, 1.0));",
    "  vec3 L = normalize(vec3(u_light * 1.2 - uv * 0.8, 0.9));",
    "  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));",
    "  float dif = max(dot(n, L), 0.0);",
    "  float nh = max(dot(n, H), 0.0);",
    "  float sheen = pow(nh, 7.0);",
    "  float spec = pow(nh, 70.0);",
    // the fold valleys fall into shadow
    "  float cavity = smoothstep(-0.9, 0.7, h0);",
    "  vec3 col = mix(u_deep, u_silk, dif * dif * cavity);",
    "  col += u_sheen * sheen * 0.42 * cavity + vec3(1.0, 0.95, 0.88) * spec * 0.22;",
    // a gold diamond weave in cloth coordinates: it bends with the folds and glints in the light
    "  vec2 c = (p + g * 0.03) * 8.0;",
    "  float d1 = abs(fract(c.x + c.y) - 0.5), d2 = abs(fract(c.x - c.y) - 0.5);",
    "  float line = 1.0 - smoothstep(0.0, 0.03, min(d1, d2));",
    "  vec2 cell = fract(vec2(c.x + c.y, c.x - c.y)) - 0.5;",
    "  float dot1 = 1.0 - smoothstep(0.045, 0.08, length(cell));",
    "  float weave = max(line * 0.35, dot1 * 0.8);",
    "  col = mix(col, u_gold * (0.2 + 0.55 * dif * cavity + 1.5 * sheen), weave * 0.6);",
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
    var canvas = root.querySelector(".sk-canvas");
    if (!canvas || canvas.skOn) return;
    canvas.skOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".sk-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var lx = 0.4, ly = 0.5, tx = 0.4, ty = 0.5, pointerIn = false, pointerAt = -1e9;
    var deep, silk, sheen, gold;

    function colours() {
      var cs = getComputedStyle(root);
      deep = hex(cs.getPropertyValue("--sk-deep"), [0.12, 0.02, 0.06]);
      silk = hex(cs.getPropertyValue("--sk-silk"), [0.55, 0.08, 0.17]);
      sheen = hex(cs.getPropertyValue("--sk-sheen"), [0.91, 0.71, 0.54]);
      gold = hex(cs.getPropertyValue("--sk-gold"), [0.85, 0.65, 0.3]);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("silk-fold shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("silk-fold link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "a", "light", "deep", "silk", "sheen", "gold"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      return true;
    }

    function angle() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD * 6.2831853 : 1.3; }
    function render(a) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.a, a);
      gl.uniform2f(U.light, lx, ly);
      gl.uniform3f(U.deep, deep[0], deep[1], deep[2]);
      gl.uniform3f(U.silk, silk[0], silk[1], silk[2]);
      gl.uniform3f(U.sheen, sheen[0], sheen[1], sheen[2]);
      gl.uniform3f(U.gold, gold[0], gold[1], gold[2]);
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
        // nobody is pointing: the light drifts slowly across the sheet, on the folds' clock
        tx = 0.55 * Math.sin(a * 3 + 0.6); ty = 0.35 + 0.3 * Math.sin(a * 2);
      }
      var k = 1 - Math.exp(-dt / 500), dx = tx - lx, dy = ty - ly;
      lx += dx * k; ly += dy * k;
      render(a);
      if (!paused || Math.abs(dx) + Math.abs(dy) > 0.002) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      lx = 0.45; ly = 0.55;
      render(1.3);
    }

    function point(e) {
      if (reduce.matches) return;
      var b = root.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - 0.5) * 2; ty = (0.5 - (e.clientY - b.top) / b.height) * 2;
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
        clock.id = "silk folds";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? 1.3 : angle()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".silk").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
