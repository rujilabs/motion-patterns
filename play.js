/*
 * play.js: adds the class "go" to every [data-play] element (and every .reveal, for browsers
 * without scroll timelines) when it enters the viewport.
 * Load it in <head> without defer: it marks <html class="js"> before first paint, so hidden
 * start states (written under .js) only apply when this script runs. No script, no hidden content.
 */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  function start() {
    var els = document.querySelectorAll("[data-play], .reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("go"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("go");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
