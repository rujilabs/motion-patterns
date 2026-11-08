/*
 * masonry-settle.js: numbers each tile of a .masonry by where it sits (rows of 24 px, then left to right)
 * as --i, and gives every other tile the opposite tilt. Renumbers on resize, since the columns change.
 * A [data-replay] button inside the same .frame drops the tiles again.
 */
(function () {
  function order(grid) {
    var tiles = [].slice.call(grid.children);
    var pos = tiles.map(function (t) {
      var r = t.getBoundingClientRect();
      return { t: t, row: Math.round(r.top / 24), x: r.left };
    });
    pos.sort(function (a, b) { return a.row - b.row || a.x - b.x; });
    pos.forEach(function (p, i) {
      p.t.style.setProperty("--i", i);
      p.t.style.setProperty("--settle-tilt", i % 2 ? "2deg" : "-2.5deg");
    });
  }
  function start() {
    var grids = document.querySelectorAll(".masonry");
    grids.forEach(order);
    var timer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { grids.forEach(order); }, 150);
    });
    document.querySelectorAll("[data-replay]").forEach(function (b) {
      b.addEventListener("click", function () {
        var frame = b.closest(".frame") || document;
        frame.querySelectorAll(".masonry").forEach(function (g) {
          g.classList.remove("go");
          void g.offsetWidth;
          g.classList.add("go");
        });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
