// Demo only: the "goal hit" count runs up with the fill, and the replay button. The grid itself is
// tile-habit-grid.js plus style.css.
(function () {
  var grid = document.getElementById("grid");
  var hit = document.getElementById("hit");
  var replay = document.getElementById("replay");
  if (!grid || !grid.replay) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var cs = getComputedStyle(grid);
  var week = parseFloat(cs.getPropertyValue("--hg-week")) || 42;
  var step = parseFloat(cs.getPropertyValue("--hg-step")) || 14;
  // when each hit day lands, in ms after the fill starts (same sum as the CSS delay)
  var times = Array.prototype.filter.call(grid.querySelectorAll(".hg-day[data-l]"), function (d) { return d.dataset.l >= "2"; })
    .map(function (d) { return +d.style.getPropertyValue("--w") * week + +d.style.getPropertyValue("--d") * step + 200; });
  var total = times.length, raf = 0;

  function run() {
    cancelAnimationFrame(raf);
    if (reduce.matches) { hit.textContent = total; return; }
    var t0 = performance.now();
    (function tick(now) {
      var t = now - t0, n = 0;
      while (n < total && times[n] <= t) n++;
      hit.textContent = n;
      if (n < total) raf = requestAnimationFrame(tick);
    })(t0);
  }
  // start counting when play.js sets .go
  new MutationObserver(function () { if (grid.classList.contains("go")) run(); })
    .observe(grid, { attributes: true, attributeFilter: ["class"] });
  if (grid.classList.contains("go")) run();
  else if (!reduce.matches) hit.textContent = "0";
  replay.addEventListener("click", function () { grid.replay(); });
})();
