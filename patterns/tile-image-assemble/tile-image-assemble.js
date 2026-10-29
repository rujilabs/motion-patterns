/*
 * tile-image-assemble.js: a picture that puts itself together from tiles once it has loaded.
 *
 *   <figure class="image-assemble" data-cols="8" data-rows="5">
 *     <img src="hero.jpg" alt="..." width="1200" height="675">
 *   </figure>
 *
 * When the image has loaded and the figure is in view, the script lays a grid of tiles over it.
 * Every tile shows its own slice of the same image (background-position), starts scattered outward
 * from the centre, tilted, a little closer to you and over-lit, and flies to its place in a sweep
 * from the top left corner, with a small random lag so the sweep looks loaded, not drawn. When
 * the last tile lands the real image shows again and the tiles go, so no seams are left behind.
 * Call figure.assemble() to play it again. Under reduced motion the image just shows.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // a small fixed random sequence, so the scatter is the same on every visit
  function rand(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function setup(fig) {
    var img = fig.querySelector("img");
    if (!img || fig._assemble) return;
    fig._assemble = true;
    var cols = parseInt(fig.dataset.cols, 10) || 8;
    var rows = parseInt(fig.dataset.rows, 10) || 5;
    var layer = null, running = [];

    function clear() {
      running.forEach(function (a) { a.cancel(); });
      running = [];
      if (layer) layer.remove();
      layer = null;
    }

    function play() {
      clear();
      if (reduce.matches || !img.animate) { fig.classList.add("ia-done"); return; }
      fig.classList.remove("ia-done");
      var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-spring").trim() || "ease-out";
      var turn = parseFloat(getComputedStyle(fig).getPropertyValue("--ia-turn")) || 760;
      var sweep = parseFloat(getComputedStyle(fig).getPropertyValue("--ia-sweep")) || 1300;
      var src = img.currentSrc || img.src;
      var r = rand(7);
      layer = document.createElement("div");
      layer.className = "ia-tiles";
      layer.setAttribute("aria-hidden", "true");
      layer.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
      layer.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
      var last = null, lastEnd = 0;
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var t = document.createElement("span");
        t.className = "ia-tile";
        t.style.backgroundImage = 'url("' + src.replace(/"/g, "%22") + '")';
        t.style.backgroundSize = cols * 100 + "% " + rows * 100 + "%";
        t.style.backgroundPosition = (cols > 1 ? x / (cols - 1) * 100 : 0) + "% " + (rows > 1 ? y / (rows - 1) * 100 : 0) + "%";
        layer.appendChild(t);
        // out from the centre: each tile starts further along the line from the middle to itself
        var cx = (x + 0.5) / cols - 0.5, cy = (y + 0.5) / rows - 0.5;
        var dx = cx * 70 + (r() - 0.5) * 30, dy = cy * 70 + (r() - 0.5) * 30;
        var rx = (r() - 0.5) * 70, ry = (r() - 0.5) * 70;
        // the sweep runs along the diagonal from the top left; the jitter makes it look loaded
        var order = (x / Math.max(1, cols - 1) + y / Math.max(1, rows - 1)) / 2;
        var delay = order * sweep + r() * 160;
        var a = t.animate([
          { transform: "translate3d(" + dx.toFixed(1) + "%," + dy.toFixed(1) + "%,160px) rotateX(" + rx.toFixed(1) + "deg) rotateY(" + ry.toFixed(1) + "deg) scale(.7)", opacity: 0, filter: "brightness(1.5)" },
          { opacity: 1, offset: 0.25 },
          { transform: "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)", opacity: 1, filter: "brightness(1)" }
        ], { duration: turn, delay: delay, easing: ease, fill: "both" });
        running.push(a);
        if (delay + turn > lastEnd) { lastEnd = delay + turn; last = a; }
      }
      fig.appendChild(layer);
      var mine = layer;
      last.finished.then(function () {
        if (layer !== mine) return;
        // the whole picture comes back under the tiles, then the tiles go
        fig.classList.add("ia-done");
        var fade = mine.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: "linear", fill: "forwards" });
        running.push(fade);
        fade.finished.then(function () { if (layer === mine) clear(); }, function () {});
        fig.dispatchEvent(new CustomEvent("assembled"));
      }, function () {});
    }

    fig.assemble = function () {
      if (img.complete && img.naturalWidth) play();
      else img.addEventListener("load", play, { once: true });
    };

    var seen = false;
    function start() {
      if (seen) return;
      seen = true;
      fig.assemble();
    }
    if (!("IntersectionObserver" in window)) { start(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); start(); }
    }, { threshold: 0.3 });
    io.observe(fig);
  }

  function init() { document.querySelectorAll(".image-assemble").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
