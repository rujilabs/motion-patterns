/*
 * thread-waves.js: fine horizontal threads, like warp on a loom, ripple in a slow travelling wave;
 * near the pointer they bend away from it, the ones above lifting and the ones below sinking, as a
 * finger parts real threads. They ease back when the pointer moves on.
 *   <section class="tw" data-tw-threads="34" data-tw-reach="90">
 *     <canvas class="tw-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="tw-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Every 9th thread is drawn in --tw-accent, the rest alternate --tw-thread and --tw-thread-alt.
 * When nobody points, a slow unseen hand drifts through the threads on the wave's clock, so the
 * parting shows without a mouse too.
 * The wave runs on a Web Animations clock ("threads wave"), so the gallery timeline and the Pause
 * button both stop it; the threads still part for the pointer while paused. Arrays are made once
 * per size; drawing is 3 strokes a frame and stops off screen or in a hidden tab.
 * Without the script the CSS draws still lines; under reduced motion one still wave is drawn.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var P = 40;   // points per thread, joined with curves

  function setup(area) {
    var canvas = area.querySelector(".tw-canvas");
    var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx) return;
    var btn = area.querySelector(".tw-pause");
    var N = Math.max(4, +area.getAttribute("data-tw-threads") || 34);
    var REACH = +area.getAttribute("data-tw-reach") || 90;
    var bend = new Float32Array(N * P);
    var w = 0, h = 0, colors = {}, clock = null, paused = false;
    var px = -9999, py = -9999, amp = 0, ampT = 0, pointerIn = false;
    var seen = !("IntersectionObserver" in window), raf = 0, last = 0;

    function readColors() {
      var cs = getComputedStyle(area);
      function c(n, f) { return cs.getPropertyValue(n).trim() || f; }
      colors = { a: c("--tw-thread", "#2d3f86"), b: c("--tw-thread-alt", "#7d89b8"), acc: c("--tw-accent", "#c4372b") };
    }
    function time() { return clock && clock.currentTime != null ? clock.currentTime / 1000 : 0; }

    // the resting wave of thread i at x, in px
    function wave(i, x, t) {
      var a = Math.min(6, h * 0.012) * (0.55 + 0.45 * Math.sin(i * 0.37 + t * 0.35));
      return a * Math.sin(x * 0.012 - t * 1.1 + i * 0.5);
    }

    // ease every point's bend toward where the pointer pushes it; returns how far they still had to go
    function settle(dt) {
      var k = 1 - Math.exp(-dt / 90), gap = h / N, moved = 0, R = REACH;
      for (var i = 0; i < N; i++) {
        var y0 = (i + 0.5) * gap, dy = y0 - py;
        for (var j = 0; j < P; j++) {
          var x = j / (P - 1) * w, dx = x - px, d = Math.sqrt(dx * dx + dy * dy), want = 0;
          if (amp > 0.001 && d < R) {
            var f = 1 - d / R;
            want = f * f * R * 0.42 * amp * (dy < 0 ? -1 : 1);
          }
          var o = i * P + j, step = (want - bend[o]) * k;
          bend[o] += step;
          moved += step < 0 ? -step : step;
        }
      }
      return moved;
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      var gap = h / N;
      ctx.lineWidth = 1;
      for (var pass = 0; pass < 3; pass++) {
        ctx.beginPath();
        for (var i = 0; i < N; i++) {
          var kind = i % 9 === 4 ? 2 : i % 2;
          if (kind !== pass) continue;
          var y0 = (i + 0.5) * gap;
          // through the midpoints with each point as the control: a smooth thread, no corners at a bend
          var lx = 0, ly = y0 + wave(i, 0, t) + bend[i * P];
          ctx.moveTo(lx, ly);
          for (var j = 1; j < P; j++) {
            var x = j / (P - 1) * w, y = y0 + wave(i, x, t) + bend[i * P + j];
            ctx.quadraticCurveTo(lx, ly, (lx + x) / 2, (ly + y) / 2);
            lx = x; ly = y;
          }
          ctx.lineTo(lx, ly);
        }
        ctx.strokeStyle = pass === 2 ? colors.acc : pass ? colors.b : colors.a;
        ctx.stroke();
      }
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (!pointerIn) {
        // nobody is pointing: a slow unseen hand drifts through the threads, on the same clock as the wave
        var t = time();
        px = w * (0.5 + 0.45 * Math.sin(t * 0.23)); py = h * (0.5 + 0.42 * Math.sin(t * 0.31 + 1));
        ampT = clock ? 0.75 : 0;
      }
      amp += (ampT - amp) * (1 - Math.exp(-dt / 120));
      var moved = settle(dt);
      draw(time());
      var busy = !paused || moved > 0.05 || Math.abs(ampT - amp) > 0.002;
      if (busy && seen && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() { if (!raf && seen && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame); }

    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      draw(time());
      kick();
    }
    function point(e) {
      if (reduce.matches) return;
      var b = area.getBoundingClientRect();
      px = e.clientX - b.left; py = e.clientY - b.top; ampT = 1; pointerIn = true;
      kick();
    }
    function leave() {
      pointerIn = false;
      kick();
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
        bend.fill(0); amp = ampT = 0;
        draw(0);
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 60000, iterations: Infinity });
        clock.id = "threads wave";
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
    area.classList.add("tw-live");
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", sync);
    if (!seen) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; kick(); }, { threshold: 0 }).observe(area);
    sync();
  }

  function start() { document.querySelectorAll(".tw").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
