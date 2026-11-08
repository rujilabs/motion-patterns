/*
 * shape-grid-drift.js: a grid of squares drifts slowly down and to the right behind a hero, with a
 * heavier line every 4 cells like drafting paper. The cell size is --sgd-cell (read again on resize). The cell under the pointer fills, and the cells
 * it leaves fade out; when nobody points, a cell now and then fills on its own.
 *   <section class="sgd" data-sgd-speed="9">
 *     <canvas class="sgd-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="sgd-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * The drift runs on a Web Animations clock ("grid drift"), so the gallery timeline and the Pause
 * button both stop it. Drawing stops off screen, in a hidden tab, and when paused with nothing fading.
 * Without the script a CSS grid shows; under reduced motion the grid stands still and the hovered
 * cell fills without fading.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var POOL = 24, FADE = 900, AUTO = 1300;

  function setup(area) {
    var canvas = area.querySelector(".sgd-canvas");
    var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx) return;
    var btn = area.querySelector(".sgd-pause");
    var CELL = 56;
    var SPEED = +area.getAttribute("data-sgd-speed") || 9;
    var gx = new Int32Array(POOL), gy = new Int32Array(POOL), life = new Float32Array(POOL), next = 0;
    var w = 0, h = 0, colors = {}, clock = null, paused = false;
    var px = 0, py = 0, pointerIn = false, hx = 0, hy = 0, hover = -1;
    var seen = !("IntersectionObserver" in window), raf = 0, last = 0, autoAt = 0;

    function readColors() {
      var cs = getComputedStyle(area);
      function c(n, f) { return cs.getPropertyValue(n).trim() || f; }
      colors = { line: c("--sgd-line", "#cdd1ca"), major: c("--sgd-major", "#a7ada3"), fill: c("--sgd-fill", "#c8553d") };
      CELL = Math.max(16, parseFloat(c("--sgd-cell", "56")) || 56);
    }
    function offset() {
      var t = clock && clock.currentTime != null ? clock.currentTime / 1000 : 0;
      return t * SPEED;
    }
    // light cell (x, y) in grid space, reusing the slot it already has
    function lightCell(x, y) {
      for (var i = 0; i < POOL; i++) if (life[i] > 0 && gx[i] === x && gy[i] === y) { life[i] = 1; return i; }
      var k = next; next = (next + 1) % POOL;
      gx[k] = x; gy[k] = y; life[k] = 1;
      return k;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      var ox = offset(), oy = ox * 0.5;
      ctx.fillStyle = colors.fill;
      for (var i = 0; i < POOL; i++) {
        if (life[i] <= 0) continue;
        ctx.globalAlpha = i === hover ? 0.92 : life[i] * life[i] * 0.7;
        ctx.fillRect(gx[i] * CELL + ox + 1, gy[i] * CELL + oy + 1, CELL - 1, CELL - 1);
      }
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
      for (var pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        var c0 = Math.floor(-ox / CELL), r0 = Math.floor(-oy / CELL), x, y, n;
        for (n = c0, x = n * CELL + ox; x <= w; n++, x += CELL) {
          if ((((n % 4) + 4) % 4 === 0) !== (pass === 1)) continue;
          ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h);
        }
        for (n = r0, y = n * CELL + oy; y <= h; n++, y += CELL) {
          if ((((n % 4) + 4) % 4 === 0) !== (pass === 1)) continue;
          ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5);
        }
        ctx.strokeStyle = pass ? colors.major : colors.line;
        ctx.stroke();
      }
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      var ox = offset(), oy = ox * 0.5, live = false;
      hover = -1;
      if (pointerIn) {
        var cx = Math.floor((px - ox) / CELL), cy = Math.floor((py - oy) / CELL);
        hover = lightCell(cx, cy);
      } else if (!paused && clock && now > autoAt) {
        // nobody is pointing: fill a cell on the right half now and then, so the hero is never dead
        autoAt = now + AUTO;
        lightCell(Math.floor((w * (0.5 + Math.random() * 0.5) - ox) / CELL), Math.floor((h * Math.random() - oy) / CELL));
      }
      for (var i = 0; i < POOL; i++) {
        if (i === hover || life[i] <= 0) continue;
        life[i] = Math.max(0, life[i] - dt / FADE);
        if (life[i] > 0) live = true;
      }
      draw();
      if (seen && !document.hidden && (!paused || live || pointerIn)) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() { if (!raf && seen && !document.hidden) raf = requestAnimationFrame(frame); }

    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      draw();
    }
    function point(e) {
      var b = area.getBoundingClientRect();
      px = e.clientX - b.left; py = e.clientY - b.top; pointerIn = true;
      if (reduce.matches) { stillHover(); return; }
      kick();
    }
    function leave() {
      pointerIn = false;
      if (reduce.matches) { stillHover(); return; }
      autoAt = performance.now() + AUTO;
      kick();
    }
    // reduced motion: the grid stands still and only the cell under the pointer is filled
    function stillHover() {
      for (var i = 0; i < POOL; i++) life[i] = 0;
      hover = pointerIn ? lightCell(Math.floor(px / CELL), Math.floor(py / CELL)) : -1;
      draw();
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
        stillHover();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 60000, iterations: Infinity });
        clock.id = "grid drift";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      kick();
    }

    area.addEventListener("pointermove", point);
    area.addEventListener("pointerdown", point);
    area.addEventListener("pointerleave", leave);
    area.addEventListener("pointercancel", leave);
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });

    fit();
    area.classList.add("sgd-live");
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", sync);
    if (!seen) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; kick(); }, { threshold: 0 }).observe(area);
    sync();
  }

  function start() { document.querySelectorAll(".sgd").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
