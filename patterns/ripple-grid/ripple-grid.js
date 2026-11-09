/*
 * ripple-grid.js: in every .ripplegrid, a WebGL fragment shader on its .rg-canvas draws a lit grid
 * floating on dark pond water with two koi under it. Every tap or click on the pond drops a ripple
 * that runs out in rings and bends the grid and the fish, like a stone in a pond; a .rg-drop button
 * drops one in front of a koi from the keyboard. When nobody taps, a drop falls now and then on its own.
 *   <section class="ripplegrid" data-rg-cell="26">
 *     <canvas class="rg-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="rg-drop" hidden>Feed the koi</button>
 *     <button type="button" class="rg-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --rg-water, --rg-line and --rg-koi (6 digit hex); --rg-pond places the koi.
 * The maths: each ripple is a wave packet sin(k f) exp(-f^2 / w^2) on f = r - c t (the distance behind
 * the moving front), damped with age and spread as 1 / (1 + 4 r). Its slope along r is written out
 * exactly; summed over up to six ripples it gives the surface gradient, which shifts where the grid
 * and the koi are read (refraction), lights the crests and places a specular glint.
 * The koi are drawn with distance functions in their own frame (a tapered body, a swaying tail).
 * Time runs on a Web Animations clock ("koi pond"): the koi swim and the idle drops fall on it, so the
 * gallery timeline and the Pause button stop them. Ripples you drop yourself always play out.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame with two rings is drawn and both buttons hide.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 16000;               // one loop of the koi and the idle drops, ms: the clock period
  var IDLE = [1900, 7200, 12500];   // idle drops in the loop, ms
  var LIFE = 4;                     // a ripple lasts this many seconds
  var N = 6;                        // ripples at once: 2 idle + 4 of yours

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform float u_s;",       // px per scene unit
    "uniform float u_cell;",    // grid pitch, scene units
    "uniform float u_px;",      // buffer px per CSS px
    "uniform vec4 u_rip[" + N + "];", // ripples: x, y, age (s), strength
    "uniform vec4 u_koi;",      // koi positions: x1, y1, x2, y2
    "uniform vec4 u_kh;",       // koi headings (cos, sin) for both, packed: c1, s1, c2, s2
    "uniform vec2 u_wig;",      // tail sway of both, -1 to 1
    "uniform vec3 u_water;",
    "uniform vec3 u_line;",
    "uniform vec3 u_koic;",
    "float g(float x){ x = min(abs(x), 6.0); return exp(-x * x); }",
    // one koi at q: rgb and coverage
    "vec4 koi(vec2 q, vec2 pos, vec2 hd, float wig, float seed){",
    "  vec2 d = q - pos;",
    "  float lx = dot(d, hd), ly = dot(d, vec2(-hd.y, hd.x));",
    "  if (abs(lx) > 0.16 || abs(ly) > 0.06) return vec4(0.0);",
    "  ly -= wig * 7.0 * (lx - 0.03) * (lx - 0.03) * step(lx, 0.03);",
    "  float bx = (lx + 0.012) / 0.072;",
    "  float bw = 0.024 * sqrt(max(1.0 - bx * bx, 0.0)) * (1.0 - 0.25 * step(bx, 0.0) * -bx);",
    "  float body = 1.0 - smoothstep(bw - 0.004, bw, abs(ly));",
    "  float tx = -lx - 0.078;",
    "  float tw = clamp(tx, 0.0, 0.05) * 0.65;",
    "  float tail = step(0.0, tx) * (1.0 - smoothstep(0.04, 0.055, tx)) * (1.0 - smoothstep(tw - 0.004, tw, abs(ly)));",
    "  float fin = g((lx - 0.02) / 0.012) * g((abs(ly) - 0.03) / 0.008) * 0.8;",
    "  float a = max(max(body, tail * 0.75), fin * 0.6);",
    "  float patch = smoothstep(0.1, 0.3, sin(lx * 70.0 + seed) + 0.6 * sin(ly * 110.0 + seed * 2.0));",
    "  vec3 c = mix(vec3(0.95, 0.93, 0.88), u_koic, patch * body);",
    "  return vec4(c, a);",
    "}",
    "void main(){",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_s;",
    // sum the ripples: height and its exact gradient
    "  float hgt = 0.0; vec2 gr = vec2(0.0);",
    "  for (int i = 0; i < " + N + "; i++) {",
    "    vec4 R = u_rip[i];",
    "    if (R.w <= 0.0) continue;",
    "    vec2 d = p - R.xy; float r = length(d) + 0.0001;",
    "    float f = r - 0.36 * R.z;",
    "    if (abs(f) > 0.5) continue;",
    "    float env = R.w * exp(-R.z * 0.6) * (1.0 - smoothstep(" + (LIFE - 1) + ".0, " + LIFE + ".0, R.z)) / (1.0 + 4.0 * r);",
    "    float G = exp(-f * f * 10.0) * smoothstep(0.0, 0.05, r);",
    "    float kf = f * 55.0;",
    "    hgt += env * G * sin(kf);",
    "    gr += env * G * (55.0 * cos(kf) - 20.0 * f * sin(kf)) * d / r;",
    "  }",
    // the water: deep, a touch lighter in the middle
    "  float vg = length((gl_FragCoord.xy / u_res - vec2(0.62, 0.55)) * vec2(1.3, 1.0));",
    "  vec3 col = u_water * (1.25 - 0.55 * vg);",
    // refraction: read the koi and the grid where the slope sends the eye
    "  vec2 q = p - gr * 0.12;",
    "  vec4 k1 = koi(q * 1.0, u_koi.xy, u_kh.xy, u_wig.x, 1.3);",
    "  vec4 k2 = koi(q * 1.0, u_koi.zw, u_kh.zw, u_wig.y, 4.1);",
    "  col = mix(col, mix(u_water, k1.rgb, 0.75), k1.a);",
    "  col = mix(col, mix(u_water, k2.rgb, 0.75), k2.a);",
    // the lit grid: lines a pixel wide, a lantern at each crossing, brighter on the crests
    "  vec2 c = q / u_cell; vec2 dl = (0.5 - abs(fract(c) - 0.5)) * u_cell * u_s;",
    "  dl /= u_px;",
    "  float line = max(g(dl.x / 0.9), g(dl.y / 0.9));",
    "  float lamp = g(length(dl) / 2.4);",
    "  float lit = dot(gr, vec2(-0.6, 0.8));",
    "  float lift = 1.0 + 14.0 * max(lit, 0.0) + 120.0 * max(hgt, 0.0);",
    // the rings show on the water too: slopes facing the light are lighter, the others darker
    "  col *= 1.0 + clamp(lit * 5.0, -0.45, 0.8);",
    "  col += vec3(0.35, 0.55, 0.5) * 0.18 * clamp(lit * 6.0, 0.0, 1.0);",
    "  col += u_line * (line * 0.32 + lamp * 0.75) * lift * (0.75 + 0.25 * (1.0 - vg));",
    // a glint of sky on the slopes
    "  vec3 n = normalize(vec3(-gr * 2.2, 1.0));",
    "  float spec = pow(max(dot(n, normalize(vec3(-0.35, 0.45, 1.0))), 0.0), 90.0) * step(0.0005, length(gr));",
    "  col += vec3(0.85, 0.95, 0.92) * spec * 0.5;",
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
    var canvas = root.querySelector(".rg-canvas");
    if (!canvas || canvas.rgOn) return;
    canvas.rgOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".rg-pause"), dropBtn = root.querySelector(".rg-drop");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, S = 1;
    var clock = null, paused = false, raf = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var cellPx = Math.max(12, +root.getAttribute("data-rg-cell") || 26);
    var water, line, koic, pondX = 0.72, pondY = 0.5;
    var RIP = new Float32Array(N * 4);
    // your ripples: x, y (scene units), start time (performance.now), in a ring of 4
    var mine = new Float64Array(4 * 3), on = new Uint8Array(4), next = 0, lastTap = -1e9;
    var K = new Float32Array(10);   // koi: x1, y1, x2, y2, c1, s1, c2, s2, wig1, wig2

    function colours() {
      var cs = getComputedStyle(root);
      water = hex(cs.getPropertyValue("--rg-water"), [0.04, 0.11, 0.1]);
      line = hex(cs.getPropertyValue("--rg-line"), [0.94, 0.76, 0.42]);
      koic = hex(cs.getPropertyValue("--rg-koi"), [1, 0.42, 0.17]);
      var pond = (cs.getPropertyValue("--rg-pond") || "").trim().split(/\s+/);
      pondX = isFinite(parseFloat(pond[0])) ? parseFloat(pond[0]) : 0.72;
      pondY = isFinite(parseFloat(pond[1])) ? parseFloat(pond[1]) : 0.5;
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("ripple-grid shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("ripple-grid link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "s", "cell", "px", "koi", "kh", "wig", "water", "line", "koic"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      U.rip = gl.getUniformLocation(prog, "u_rip[0]");
      return true;
    }

    function ctime() { return clock && clock.currentTime != null ? clock.currentTime : 0; }
    // the koi swim on two loops round the pond centre; heading = direction of travel
    function swim(ms) {
      var a = (ms % PERIOD) / PERIOD * 6.2831853, cx = (pondX - 0.5) * w / S, cy = (0.5 - pondY) * h / S;
      var x1 = cx + 0.17 * Math.cos(a), y1 = cy + 0.12 * Math.sin(a), dx1 = -0.17 * Math.sin(a), dy1 = 0.12 * Math.cos(a);
      var b = -a * 2 + 1.2, x2 = cx - 0.04 + 0.11 * Math.cos(b), y2 = cy + 0.05 + 0.08 * Math.sin(b * 1), dx2 = 0.22 * Math.sin(b), dy2 = -0.16 * Math.cos(b);
      var l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1, l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
      K[0] = x1; K[1] = y1; K[2] = x2; K[3] = y2;
      K[4] = dx1 / l1; K[5] = dy1 / l1; K[6] = dx2 / l2; K[7] = dy2 / l2;
      K[8] = Math.sin(a * 24); K[9] = Math.sin(a * 30 + 1);
    }
    // fill the ripple uniforms: the last two idle drops (on the clock) and your four
    function ripples(ms, now) {
      var t = ms % PERIOD, quiet = Math.min(1, Math.max(0, (now - lastTap - 4000) / 1500));
      for (var j = 0; j < 2; j++) {
        // the j-th most recent idle drop
        var k = -1;
        for (var n = 0; n < IDLE.length; n++) if (t >= IDLE[n]) k = n;
        var idx = k - j, back = 0;
        while (idx < 0) { idx += IDLE.length; back += PERIOD; }
        var age = (t - IDLE[idx] + back) / 1000;
        var sd = idx * 7 + 3;
        RIP[j * 4] = (pondX - 0.5) * w / S + 0.2 * Math.sin(sd * 1.7);
        RIP[j * 4 + 1] = (0.5 - pondY) * h / S + 0.16 * Math.cos(sd * 2.3);
        RIP[j * 4 + 2] = age;
        RIP[j * 4 + 3] = age < LIFE && ms > IDLE[idx] ? 0.007 * quiet : 0;
      }
      for (var m = 0; m < 4; m++) {
        var o = (m + 2) * 4, st = mine[m * 3 + 2], ag = (now - st) / 1000;
        RIP[o] = mine[m * 3]; RIP[o + 1] = mine[m * 3 + 1]; RIP[o + 2] = ag;
        RIP[o + 3] = on[m] && ag < LIFE ? 0.007 : 0;
      }
    }
    function anyMine(now) { for (var m = 0; m < 4; m++) if (on[m] && now - mine[m * 3 + 2] < LIFE * 1000) return true; return false; }

    function render(ms, now) {
      if (!prog || lost || !w) return;
      swim(ms);
      ripples(ms, now);
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.s, S);
      gl.uniform1f(U.cell, cellPx * scale / S);
      gl.uniform1f(U.px, scale);
      gl.uniform4fv(U.rip, RIP);
      gl.uniform4f(U.koi, K[0], K[1], K[2], K[3]);
      gl.uniform4f(U.kh, K[4], K[5], K[6], K[7]);
      gl.uniform2f(U.wig, K[8], K[9]);
      gl.uniform3f(U.water, water[0], water[1], water[2]);
      gl.uniform3f(U.line, line[0], line[1], line[2]);
      gl.uniform3f(U.koic, koic[0], koic[1], koic[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      S = Math.min(h, 0.75 * w);
      colours();
      if (reduce.matches) still(); else { render(ctime(), performance.now()); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && (!paused || anyMine(performance.now())); }
    function kick() { if (!raf && live()) { if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) { render(ctime(), performance.now()); return; }
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      render(ctime(), performance.now());
      raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      // two rings frozen part way out, beside the koi
      var now = performance.now();
      mine[0] = (pondX - 0.5) * w / S + 0.12; mine[1] = (0.5 - pondY) * h / S + 0.05; mine[2] = now - 1100;
      mine[3] = (pondX - 0.5) * w / S - 0.22; mine[4] = (0.5 - pondY) * h / S - 0.12; mine[5] = now - 600;
      on[0] = 1; on[1] = 1; on[2] = 0; on[3] = 0;
      lastTap = now;
      render(5200, now);
    }

    function drop(x, y) {
      if (reduce.matches) return;
      var now = performance.now();
      mine[next * 3] = x; mine[next * 3 + 1] = y; mine[next * 3 + 2] = now; on[next] = 1;
      next = (next + 1) % 4; lastTap = now;
      kick();
    }
    function tap(e) {
      if (e.button > 0 || (e.target.closest && e.target.closest("a, button, input, select, textarea, label"))) return;
      var b = root.getBoundingClientRect();
      drop(((e.clientX - b.left) / b.width - 0.5) * w / S, (0.5 - (e.clientY - b.top) / b.height) * h / S);
    }
    function feed() {
      swim(ctime());
      drop(K[0] + K[4] * 0.09, K[1] + K[5] * 0.09);
    }
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
        if (dropBtn) dropBtn.hidden = true;
        still();
        return;
      }
      on[0] = on[1] = on[2] = on[3] = 0;
      lastTap = -1e9;
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: PERIOD, iterations: Infinity });
        clock.id = "koi pond";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      if (dropBtn) dropBtn.hidden = false;
      kick();
    }

    if (!build()) return;
    root.addEventListener("pointerdown", tap);
    if (dropBtn) dropBtn.addEventListener("click", feed);
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); if (reduce.matches) still(); else render(ctime(), performance.now()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".ripplegrid").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
