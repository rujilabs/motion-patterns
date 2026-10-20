/*
 * carousel.js: [data-carousel] holding a .carousel-track of .carousel-slide elements, optional
 * .carousel-prev and .carousel-next buttons and an empty .carousel-dots container (one dot per
 * slide is added). The slide nearest the centre of the track gets .is-active, and so does its dot.
 */
(function () {
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");

  function setup(root) {
    var track = root.querySelector(".carousel-track");
    var slides = Array.prototype.slice.call(track.querySelectorAll(".carousel-slide"));
    var prev = root.querySelector(".carousel-prev");
    var next = root.querySelector(".carousel-next");
    var dotsBox = root.querySelector(".carousel-dots");
    var dots = [];
    var current = -1;
    var queued = false;

    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      track.scrollTo({
        left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2,
        behavior: still && still.matches ? "auto" : "smooth"
      });
    }

    function mark(i) {
      if (i === current) return;
      current = i;
      slides.forEach(function (s, n) {
        var on = n === i;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
        s.inert = !on;
      });
      dots.forEach(function (d, n) {
        d.classList.toggle("is-active", n === i);
        if (n === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
      });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    }

    function measure() {
      queued = false;
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestD = Infinity;
      slides.forEach(function (s, n) {
        var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = n; }
      });
      mark(best);
    }

    if (dotsBox) {
      slides.forEach(function (s, n) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "carousel-dot";
        d.setAttribute("aria-label", "Show slide " + (n + 1) + " of " + slides.length);
        d.addEventListener("click", function () { goTo(n); });
        dotsBox.appendChild(d);
        dots.push(d);
      });
    }
    if (prev) prev.addEventListener("click", function () { goTo(current - 1); });
    if (next) next.addEventListener("click", function () { goTo(current + 1); });
    track.addEventListener("scroll", function () {
      if (!queued) { queued = true; requestAnimationFrame(measure); }
    }, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(track);
    measure();
  }

  function start() { document.querySelectorAll("[data-carousel]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
