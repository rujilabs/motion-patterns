/*
 * molten-metal.js: in every .molten, a WebGL fragment shader on its .mo-canvas draws blobs of molten gold
 * that rise, sink, merge and split like a lava lamp, glowing hot where they are thin and mirroring a
 * workshop light where they are round.
 *   <section class="molten">
 *     <canvas class="mo-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="mo-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --mo-base, --mo-gold and --mo-heat (6 digit hex), the same ones the CSS fallback uses.
 * The maths: a metaball field F = sum of r^2 / |p - c|^2 over seven blobs, gold where F > 1. Its gradient
 * is summed analytically alongside it. (F - 1) / |grad F| estimates the distance to the edge, for a one
 * pixel antialiased rim. The surface height is 1 - 1 / F (zero at the edge, flat on top), so its normal
 * comes from grad F / F^2 with no finite differences; a heat glow sits just outside. The normal reflects an analytic environment (a softbox above, a warm side light, a dark
 * floor with ember glow) tinted by the gold, with Schlick Fresnel at the rim.
 * Each blob rides its own sine at a whole multiple of one loop angle (worked out in JS), so the loop has
 * no seam. Time runs on a Web Animations clock ("gold flow"), so the gallery timeline and Pause stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames average
 * over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context released on
 * pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays; under reduced motion
 * one still frame is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 84000;   // one full loop, ms: the clock period
  var N = 7;
  // per blob: radius, rise turns, rise phase, sway turns, sway phase, lane (-1 to 1)
  var BLOBS = [
    [0.082, 2, 0.0, 3, 1.1, -0.15],
    [0.066, 3, 2.1, 2, 0.4, 0.35],
    [0.098, 1, 4.0, 2, 2.6, 0.05],
    [0.055, 4, 1.3, 5, 3.3, -0.55],
    [0.074, 2, 3.4, 3, 5.0, 0.6],
    [0.047, 5, 5.2, 4, 0.9, -0.3],
    [0.062, 3, 0.7, 1, 4.4, 0.2]
  ];

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",          // drawing buffer, px
    "uniform vec4 u_b[" + N + "];", // blob centres (height units from the middle), r^2, unused
    "uniform vec3 u_base;",
    "uniform vec3 u_gold;",
    "uniform vec3 u_heat;",
    "uniform float u_px;",          // one pixel in height units
    // the studio round the gold: softbox above, warm light from the left, dark floor with ember glow
    "vec3 env(vec3 r){",
    "  vec3 c = mix(u_base * 0.6, vec3(0.32, 0.26, 0.22), smoothstep(-0.2, 0.5, r.y));",
    "  float box = smoothstep(0.32, 0.42, r.y) * (1.0 - smoothstep(0.72, 0.8, r.y)) * (1.0 - smoothstep(0.38, 0.5, abs(r.x - 0.1)));",
    "  c += vec3(2.4, 2.3, 2.1) * box;",
    "  c += vec3(1.3, 1.0, 0.7) * smoothstep(0.3, 0.9, -r.x) * smoothstep(-0.4, 0.2, r.y);",
    "  c += vec3(0.5, 0.4, 0.3) * smoothstep(0.5, 0.95, r.x);",
    "  c += u_heat * 0.45 * smoothstep(-0.2, -0.75, r.y);",
    "  c += vec3(0.95, 0.8, 0.62) * smoothstep(0.2, 1.0, r.z);",
    "  return c;",
    "}",
    "void main(){",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    "  float F = 0.0; vec2 G = vec2(0.0);",
    "  for (int i = 0; i < " + N + "; i++) {",
    "    vec2 d = p - u_b[i].xy;",
    // softened (smooth, no crease) so r^2 q and d q stay small at mediump
    "    float q = 1.0 / (dot(d, d) + 0.0012);",
    "    float f = u_b[i].z * q;",
    "    F += f;",
    "    G -= 2.0 * f * (d * q);",
    "  }",
    "  float g = length(G) + 0.0001;",
    "  float dist = (F - 1.0) / g;",             // about the distance inside the edge
    // the room: dark, with heat glowing round the gold
    "  float vig = 1.0 - 0.45 * dot(p, p);",
    "  vec3 col = u_base * vig;",
    "  col += u_heat * 0.55 * smoothstep(0.25, 1.0, F) * (1.0 - smoothstep(0.0, 0.3, F - 1.0));",
    // the gold: a rounded profile from the edge distance
    // the gold's height is 1 - 1 / F: zero at the edge, flat on top; its slope is grad F / F^2 (faded out deep inside)
    "  vec3 n = normalize(vec3(-G / (F * F) * 0.11 * (1.0 - smoothstep(1.6, 4.0, F)), 1.0));",
    "  float t = length(n.xy);",
    "  vec3 r = vec3(2.0 * n.z * n.xy, 2.0 * n.z * n.z - 1.0);",
    "  float fres = 0.8 + 0.2 * pow(1.0 - n.z, 5.0);",
    "  vec3 metal = env(r) * mix(u_gold, vec3(1.0), 0.25 * fres) * fres;",
    // molten: still glowing hot where the gold is thin, at the rim
    "  metal += u_heat * 0.7 * smoothstep(0.75, 1.0, t);",
    "  metal = metal / (1.0 + 0.35 * metal);",
    "  float cover = clamp(dist / u_px + 0.5, 0.0, 1.0);",
    "  col = mix(col, metal, cover);",
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
    var canvas = root.querySelector(".mo-canvas");
    if (!canvas || canvas.moOn) return;
    canvas.moOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".mo-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var base, gold, heat, colX = 0.7, colW = 0.26, size = 1, colY = 0, rise = 0.36;
    var blobs = new Float32Array(N * 4);

    function colours() {
      var cs = getComputedStyle(root);
      base = hex(cs.getPropertyValue("--mo-base"), [0.07, 0.045, 0.035]);
      gold = hex(cs.getPropertyValue("--mo-gold"), [1, 0.76, 0.33]);
      heat = hex(cs.getPropertyValue("--mo-heat"), [0.9, 0.3, 0.06]);
      // where the lamp stands: centre (0 to 1 from the left, height units up), spread, rise and blob size, read on every resize
      colX = +cs.getPropertyValue("--mo-x") || 0.7;
      colW = +cs.getPropertyValue("--mo-spread") || 0.26;
      size = +cs.getPropertyValue("--mo-size") || 1;
      colY = +cs.getPropertyValue("--mo-y") || 0;
      rise = +cs.getPropertyValue("--mo-rise") || 0.36;
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("molten-metal shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("molten-metal link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "b", "base", "gold", "heat", "px"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      return true;
    }

    // blob positions for loop angle a: rise and sink on whole-multiple sines, so the loop has no seam
    function place(a) {
      var cx = (colX - 0.5) * w / h;
      for (var i = 0; i < N; i++) {
        var b = BLOBS[i], o = i * 4, r = b[0] * size;
        var up = Math.sin(b[1] * a + b[2]);
        blobs[o] = cx + colW * (b[5] + 0.35 * Math.sin(b[3] * a + b[4]));
        // a lava lamp lingers at the top and bottom: push the sine towards its ends
        blobs[o + 1] = colY + rise * (up + 0.25 * up * (1 - up * up));
        // blobs stretch a little as they move fast
        blobs[o + 2] = r * r * (1 + 0.18 * Math.cos(b[1] * a + b[2]) * Math.cos(b[1] * a + b[2]));
        blobs[o + 3] = 0;
      }
    }

    function angle() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / PERIOD * 6.2831853 : 1.9; }
    function render(a) {
      if (!prog || lost || !w) return;
      place(a);
      gl.uniform2f(U.res, w, h);
      gl.uniform4fv(U.b, blobs);
      gl.uniform1f(U.px, 1.2 / h);
      gl.uniform3f(U.base, base[0], base[1], base[2]);
      gl.uniform3f(U.gold, gold[0], gold[1], gold[2]);
      gl.uniform3f(U.heat, heat[0], heat[1], heat[2]);
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

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && !paused; }
    function kick() { if (!raf && live()) { if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      render(angle());
      raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      render(1.9);
    }

    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      render(angle());
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
        clock.id = "gold flow";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      kick();
    }

    if (!build()) return;
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? 1.9 : angle()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".molten").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
