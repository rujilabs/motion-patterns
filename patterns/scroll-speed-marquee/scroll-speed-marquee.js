/*
 * scroll-speed-marquee.js: holds each row's CSS loop paused and moves its clock itself, at
 * 1 + (scroll velocity x gain) times the base speed. A fling down speeds it up, a scroll up runs it
 * backwards; when the scroll stops the boost decays (about 0.3 s to half) back to the base pace.
 * data-ssm-gain on .ssm-group sets the gain (default 0.008 per px/s, capped at 10x either way).
 * The loop runs only while a row is on screen and not paused. Off under reduced motion.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var MAX = 10;
  function start() {
    if (still.matches) return;
    document.querySelectorAll(".ssm-group").forEach(function (g) {
      var rows = [];
      g.querySelectorAll(".ssm-track").forEach(function (t) {
        var a = t.getAnimations ? t.getAnimations()[0] : null;
        if (!a) return;
        a.pause();
        rows.push({ a: a, dur: a.effect.getComputedTiming().duration, pos: a.currentTime || 0 });
      });
      if (!rows.length) return;
      var gain = parseFloat(g.getAttribute("data-ssm-gain"));
      if (isNaN(gain)) gain = 0.008;
      var btn = g.querySelector(".ssm-pause");
      var paused = false, seen = true, raf = 0, last = 0, lastY = window.scrollY, boost = 0;

      function frame(t) {
        var dt = last ? Math.min(0.064, (t - last) / 1000) : 0;
        last = t;
        var y = window.scrollY, v = dt ? (y - lastY) / dt : 0;
        lastY = y;
        var want = Math.max(-MAX - 1, Math.min(MAX - 1, v * gain));
        /* catch up fast when the scroll pushes harder, let go slowly */
        var k = Math.abs(want) > Math.abs(boost) ? 14 : 2.4;
        boost += (want - boost) * (1 - Math.exp(-k * dt));
        rows.forEach(function (r) {
          r.pos = ((r.pos + dt * 1000 * (1 + boost)) % r.dur + r.dur) % r.dur;
          r.a.currentTime = r.pos;
        });
        raf = requestAnimationFrame(frame);
      }
      function run() {
        var go = !paused && seen;
        if (go && !raf) { last = 0; lastY = window.scrollY; raf = requestAnimationFrame(frame); }
        if (!go && raf) { cancelAnimationFrame(raf); raf = 0; boost = 0; }
      }
      if (btn) {
        btn.hidden = false;
        btn.addEventListener("click", function () {
          paused = !paused;
          btn.setAttribute("aria-pressed", paused ? "true" : "false");
          run();
        });
      }
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; run(); }).observe(g);
      }
      run();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
