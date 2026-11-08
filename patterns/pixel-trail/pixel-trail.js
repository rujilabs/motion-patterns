/*
 * pixel-trail.js: in every .px-trail, the pointer (mouse, pen or a dragging finger) lights square
 * pixels on a grid of data-px-cell px (default 16). Each pixel fades out over data-px-life ms
 * (default 850) in four hard steps, like an old palette fade. A fast move fills every cell between
 * two pointer events, so the trail never breaks into dots.
 *   <section class="px-trail" data-px-cell="16" data-px-life="850">
 *     <canvas class="px-canvas" aria-hidden="true"></canvas> ...your content...
 *   </section>
 * When the area comes into view a short run of pixels plays once; Tab to a button inside and a run
 * streaks along under it, so the keyboard gets the effect too. Both runs are Web Animations clocks,
 * so the gallery timeline can pause and scrub them.
 * Fixed pool: at most 600 live pixels; the canvas only redraws while one is alive, and never off screen.
 * Under reduced motion it draws one still trail and ignores the pointer.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var MAX = 600;
  var INTRO = [0.04, 0.9, 0.3, 0.9, 0.3, 0.8, 0.58, 0.8, 0.58, 0.9, 0.96, 0.9];   // x, y pairs, as parts of the area

  function setup(area) {
    var canvas = area.querySelector(".px-canvas");
    var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx) return;
    var CELL = Math.max(6, +area.getAttribute("data-px-cell") || 16);
    var LIFE = Math.max(150, +area.getAttribute("data-px-life") || 850);
    var w = 0, h = 0, cols = 0, rows = 0;
    var life = new Float32Array(0), tint = new Uint8Array(0), act = new Int32Array(MAX), n = 0;
    var colors = [], count = 0, penX = null, penY = null;
    var run = null, runPts = null, runLen = 0, introDone = false;
    var seen = !("IntersectionObserver" in window), raf = 0, last = 0;

    function readColors() {
      colors = (getComputedStyle(area).getPropertyValue("--px-colors").trim() || "#ff4f7b #ffd23f #3ee3c3 #6c8cff").split(/\s+/);
    }

    function light(cx, cy, l) {
      if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
      var i = cy * cols + cx;
      if (life[i] <= 0) { if (n >= MAX) return; act[n++] = i; }
      life[i] = l;
      tint[i] = Math.floor(count++ / 3) % colors.length;   // three pixels per colour, then the next
    }
    // light every cell on the straight line from the last cell to this point (px)
    function penTo(x, y, l) {
      var cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
      if (penX === null) { penX = cx; penY = cy; light(cx, cy, l); return; }
      var dx = cx - penX, dy = cy - penY, steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (var s = 1; s <= steps; s++) light(Math.round(penX + dx * s / steps), Math.round(penY + dy * s / steps), l);
      penX = cx; penY = cy;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var k = 0; k < n; k++) {
        var i = act[k], step = Math.ceil(life[i] * 4) / 4;
        var inset = 1 + Math.round((1 - step) * CELL * 0.28);   // each step also shrinks the pixel
        ctx.globalAlpha = step;
        ctx.fillStyle = colors[tint[i]];
        ctx.fillRect((i % cols) * CELL + inset, ((i / cols) | 0) * CELL + inset, CELL - inset * 2, CELL - inset * 2);
      }
      ctx.globalAlpha = 1;
    }
    function decay(dt) {
      var d = dt / LIFE;
      for (var k = 0; k < n; k++) {
        var i = act[k];
        life[i] -= d;
        if (life[i] <= 0) { life[i] = 0; act[k] = act[--n]; k--; }
      }
    }
    function clear() { for (var k = 0; k < n; k++) life[act[k]] = 0; n = 0; penX = null; }

    // a scripted run along a polyline (px), timed by a Web Animations clock
    function along(p) {
      var want = p * runLen;
      for (var s = 0; s + 3 < runPts.length; s += 2) {
        var x0 = runPts[s], y0 = runPts[s + 1], x1 = runPts[s + 2], y1 = runPts[s + 3];
        var len = Math.hypot(x1 - x0, y1 - y0);
        if (want <= len || s + 4 >= runPts.length) { var t = len ? Math.min(1, want / len) : 1; penTo(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 1); return; }
        want -= len;
      }
    }
    function startRun(pts, ms, id) {
      if (!canvas.animate || reduce.matches) return;
      if (run) run.cancel();
      runPts = pts; runLen = 0;
      for (var s = 0; s + 3 < pts.length; s += 2) runLen += Math.hypot(pts[s + 2] - pts[s], pts[s + 3] - pts[s + 1]);
      penX = null;
      run = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: ms, easing: "linear" });
      run.id = id;
      kick();
    }
    function intro() {
      introDone = true;
      var pts = [];
      for (var k = 0; k < INTRO.length; k += 2) pts.push(INTRO[k] * w, INTRO[k + 1] * h);
      startRun(pts, 1500, "pixel trail intro");
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (run) {
        var p = run.effect.getComputedTiming().progress;
        if (run.playState === "finished" || p == null) { along(1); run = null; penX = null; }
        else along(p);
      }
      decay(dt);
      draw();
      if ((n > 0 || run) && seen && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() { if (!raf && seen && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame); }

    // reduced motion: the intro path, drawn once, older pixels already fading
    function still() {
      clear();
      var pts = [];
      for (var k = 0; k < INTRO.length; k += 2) pts.push(INTRO[k] * w, INTRO[k + 1] * h);
      runPts = pts; runLen = 0;
      for (var s = 0; s + 3 < pts.length; s += 2) runLen += Math.hypot(pts[s + 2] - pts[s], pts[s + 3] - pts[s + 1]);
      for (var q = 0; q <= 120; q++) { along(q / 120); if (penX !== null) life[penY * cols + penX] = 0.2 + 0.8 * q / 120; }
      penX = null;
      draw();
    }

    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var c = Math.ceil(w / CELL), rr = Math.ceil(h / CELL);
      if (c !== cols || rr !== rows) { cols = c; rows = rr; life = new Float32Array(cols * rows); tint = new Uint8Array(cols * rows); n = 0; penX = null; }
      if (reduce.matches) still(); else draw();
    }

    function point(e) {
      var b = area.getBoundingClientRect();
      if (run) { run.cancel(); run = null; penX = null; }   // the hand takes over from a scripted run
      penTo(e.clientX - b.left, e.clientY - b.top, 1);
      kick();
    }
    area.addEventListener("pointermove", function (e) { if (!reduce.matches) point(e); });
    area.addEventListener("pointerdown", function (e) { if (!reduce.matches) { penX = null; point(e); } });
    area.addEventListener("pointerleave", function () { penX = null; });
    area.addEventListener("pointercancel", function () { penX = null; });
    // keyboard: a run streaks in from the left edge and underlines the focused control
    area.addEventListener("focusin", function (e) {
      if (reduce.matches || e.target === area) return;
      var b = area.getBoundingClientRect(), t = e.target.getBoundingClientRect();
      var y = (Math.ceil((t.bottom - b.top + 3) / CELL) + 0.5) * CELL;   // the first whole row of cells under it
      startRun([0, y, t.right - b.left, y], 420, "pixel run to button");
    });

    readColors();
    fit();
    area.classList.add("px-live");
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", function () {
      if (run) { run.cancel(); run = null; }
      if (reduce.matches) still(); else { clear(); draw(); }
    });
    if (!seen) {
      new IntersectionObserver(function (es) {
        seen = es[0].isIntersecting;
        if (seen && !introDone) intro();
        kick();
      }, { threshold: 0.2 }).observe(area);
    } else intro();
  }

  function start() { document.querySelectorAll(".px-trail").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
