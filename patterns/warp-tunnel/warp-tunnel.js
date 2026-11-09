/*
 * warp-tunnel.js: in every .warp, a WebGL fragment shader on its .wt-canvas draws light streaks rushing
 * past down a night tunnel. While a [data-wt-hold] button inside is held (mouse, pen, finger, or Space
 * or Enter on the keyboard) the streaks speed up and stretch; let go and they ease back. A quick press
 * gives a short burst.
 *   <section class="warp">
 *     <canvas class="wt-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="submit" data-wt-hold>Search trips</button>
 *     <button type="button" class="wt-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --wt-sky, --wt-lamp, --wt-head and --wt-tail (6 digit hex), the same ones the CSS
 * fallback uses.
 * The maths: polar coordinates round the vanishing point; 64 lanes round the circle; along each lane the
 * depth is z = 0.35 / r (a point at depth z on a tunnel wall of radius 1 is seen at r = 1 / z), cut into
 * cells of depth 1, and a random byte per lane and cell (from a 64 x 64 texture made once in JS) says if
 * the cell holds a streak, where it starts and what colour it is. Moving the depth offset forward makes
 * every streak run outward and grow, as things do when you pass them.
 * Time runs on a Web Animations clock ("bus warp"), so the gallery timeline and the Pause button both
 * stop the run; the offset is integrated from that clock, so speed changes never jump.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn, the hold changes nothing and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var SLOW = 0.8, FAST = 5.5;   // depth cells per second, cruising and held
  var WANDER = 60000;           // the road's slow curve, ms: the clock period

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform vec2 u_c;",        // vanishing point in height units from the middle
    "uniform float u_z;",       // depth offset, wraps at 64
    "uniform float u_s;",       // speed, 0 (still) to 1 (held)
    "uniform vec3 u_sky;",
    "uniform vec3 u_lamp;",
    "uniform vec3 u_head;",
    "uniform vec3 u_tail;",
    "uniform sampler2D u_rnd;", // 64 x 64 random bytes, nearest, repeat
    "vec4 rnd(vec2 id){ return texture2D(u_rnd, (mod(id, 64.0) + 0.5) / 64.0); }",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    "  vec2 p = uv - u_c;",
    "  float r = length(p) + 0.0001;",
    "  float lanes = 64.0;",
    "  float la = (atan(p.y, p.x) / 6.2831853 + 0.5) * lanes;",
    "  float lane = floor(la);",
    "  float across = abs(la - lane - 0.5);",
    "  vec4 rl = rnd(vec2(lane, 63.0));",
    // two lane speeds, 1 and 2, so the offset can wrap at 64 without a seam
    "  float zz = 0.35 / r + u_z * (1.0 + floor(rl.x * 2.0)) + rl.y * 64.0;",
    "  float id = floor(zz), f = zz - id;",
    "  vec4 rc = rnd(vec2(lane, id));",
    "  float len = (0.1 + 0.2 * rc.y) * (1.0 + 1.6 * u_s);",
    "  float st = rc.z * 0.4;",
    // head bright at the near end (small f), tail fading toward the far end
    "  float along = smoothstep(st - 0.02, st + 0.01, f) * (1.0 - smoothstep(st, st + len, f));",
    "  float thin = 1.0 - smoothstep(0.0, 0.32 - 0.12 * u_s, across);",
    "  float on = step(0.55, rc.x);",
    "  float fade = smoothstep(0.02, 0.22, r) * min(1.0, 1.4 - r * 0.5);",
    "  vec3 tint = rc.w < 0.55 ? u_lamp : (rc.w < 0.9 ? u_head : u_tail);",
    "  vec3 col = u_sky * (0.7 + 0.5 * (1.0 - smoothstep(0.0, 0.9, r)));",
    "  col += mix(u_lamp, u_head, 0.5) * exp(-r * 9.0) * (0.18 + 0.2 * u_s);",
    "  col += tint * on * along * thin * fade * (0.85 + 0.6 * u_s);",
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
    var canvas = root.querySelector(".wt-canvas");
    if (!canvas || canvas.wtOn) return;
    canvas.wtOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".wt-pause");
    var holds = root.querySelectorAll("[data-wt-hold]");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, last = 0, lastCt = -1, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var z = 0, speed = SLOW, held = 0, burstUntil = 0, cx = 0, cy = 0;
    var sky, lamp, head, tail;

    function colours() {
      var cs = getComputedStyle(root);
      sky = hex(cs.getPropertyValue("--wt-sky"), [0.04, 0.07, 0.19]);
      lamp = hex(cs.getPropertyValue("--wt-lamp"), [1, 0.7, 0.28]);
      head = hex(cs.getPropertyValue("--wt-head"), [0.82, 0.9, 1]);
      tail = hex(cs.getPropertyValue("--wt-tail"), [1, 0.29, 0.24]);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("warp-tunnel shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("warp-tunnel link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "c", "z", "s", "sky", "lamp", "head", "tail", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed, so every load draws the same road
      var bytes = new Uint8Array(64 * 64 * 4), seed = 1311;
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

    function render() {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform2f(U.c, cx, cy);
      gl.uniform1f(U.z, z);
      gl.uniform1f(U.s, Math.max(0, Math.min(1, (speed - SLOW) / (FAST - SLOW))));
      gl.uniform3f(U.sky, sky[0], sky[1], sky[2]);
      gl.uniform3f(U.lamp, lamp[0], lamp[1], lamp[2]);
      gl.uniform3f(U.head, head[0], head[1], head[2]);
      gl.uniform3f(U.tail, tail[0], tail[1], tail[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      colours();
      if (reduce.matches) still(); else { render(); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog; }
    function kick() { if (!raf && live()) { last = 0; lastCt = -1; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
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
      var ct = clock && clock.currentTime != null ? clock.currentTime : 0;
      var dc = lastCt < 0 ? 0 : Math.max(0, Math.min(50, ct - lastCt));
      lastCt = ct;
      // speed eases toward cruising or held, quicker to pick up than to slow down
      var want = held > 0 || now < burstUntil ? FAST : SLOW;
      speed += (want - speed) * (1 - Math.exp(-dt / (want > speed ? 380 : 900)));
      z = (z + speed * dc / 1000) % 64;
      // the road curves gently: the vanishing point drifts on the clock
      var a = (ct % WANDER) / WANDER * 6.2831853;
      cx = 0.06 * Math.sin(a) + 0.02 * Math.sin(a * 3); cy = 0.03 * Math.sin(a * 2 + 1);
      render();
      if (!paused || Math.abs(want - speed) > 0.01) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      z = 7.3; speed = SLOW + 0.25 * (FAST - SLOW); cx = 0.03; cy = 0.01;
      render();
    }

    function press() { if (reduce.matches) return; held++; kick(); }
    function release() { if (held > 0) held--; kick(); }
    Array.prototype.forEach.call(holds, function (b) {
      var down = false;
      function up() { if (down) { down = false; release(); } }
      b.addEventListener("pointerdown", function (e) {
        if (down || e.button > 0) return;
        down = true; press();
        if (b.setPointerCapture) { try { b.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ } }
      });
      b.addEventListener("pointerup", up);
      b.addEventListener("pointercancel", up);
      b.addEventListener("lostpointercapture", up);
      b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
      var key = false;
      b.addEventListener("keydown", function (e) {
        if (e.key !== " " && e.key !== "Enter") return;
        if (e.repeat) { if (e.key === "Enter") e.preventDefault(); return; }
        if (!key) { key = true; press(); }
      });
      b.addEventListener("keyup", function (e) { if ((e.key === " " || e.key === "Enter") && key) { key = false; release(); } });
      b.addEventListener("blur", function () { if (key) { key = false; release(); } up(); });
      // a quick press still shows a short burst
      b.addEventListener("click", function () { if (!reduce.matches) { burstUntil = performance.now() + 700; kick(); } });
    });

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
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: WANDER, iterations: Infinity });
        clock.id = "bus warp";
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".warp").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
