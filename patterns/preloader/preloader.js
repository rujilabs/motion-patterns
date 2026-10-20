/*
 * preloader.js: runs every [data-preloader]. It sets --preload (0 to 1) on the screen, writes the
 * percent into .preloader-count and the bar's aria-valuenow, then finishes: .is-done lifts the
 * screen, .is-gone hides it, and <html> gets .is-loaded so the page can rise in.
 *
 * data-preloader="auto" (default): progress counts the page's images, and it finishes on window
 * load, but not before data-preloader-min milliseconds (default 600), so it never flashes.
 * data-preloader="manual": your code calls el.preloader.set(p), el.preloader.finish() and
 * el.preloader.reset().
 */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(el) {
    var count = el.querySelector(".preloader-count");
    var bar = el.querySelector(".preloader-bar");
    var timer, finished = false;

    function set(p) {
      p = Math.max(0, Math.min(1, p));
      el.style.setProperty("--preload", p);
      var pct = Math.round(p * 100);
      if (count) count.textContent = pct;
      if (bar) bar.setAttribute("aria-valuenow", pct);
    }

    function finish() {
      if (finished) return;
      finished = true;
      set(1);
      var wait = reduce.matches ? 0 : parseFloat(getComputedStyle(el).getPropertyValue("--preloader-hold")) || 450;
      timer = setTimeout(function () {
        el.classList.add("is-done");
        root.classList.add("is-loaded");
        el.setAttribute("aria-hidden", "true");
        if (reduce.matches) { el.classList.add("is-gone"); return; }
        var gone = function (e) {
          if (e && (e.target !== el || e.propertyName !== "translate")) return;
          el.removeEventListener("transitionend", gone);
          el.classList.add("is-gone");
        };
        el.addEventListener("transitionend", gone);
      }, wait);
    }

    function reset() {
      clearTimeout(timer);
      finished = false;
      el.classList.add("is-snap");
      el.classList.remove("is-done", "is-gone");
      root.classList.remove("is-loaded");
      el.removeAttribute("aria-hidden");
      set(0);
      void el.offsetWidth;
      el.classList.remove("is-snap");
    }

    el.preloader = { set: set, finish: finish, reset: reset };
    set(0);
    if (el.dataset.preloader === "manual") return;

    var imgs = Array.prototype.slice.call(document.images);
    var total = imgs.length + 1, loaded = 0;
    function tick() { loaded++; if (!finished) set(loaded / total * .9); }
    imgs.forEach(function (img) {
      if (img.complete) tick();
      else { img.addEventListener("load", tick); img.addEventListener("error", tick); }
    });
    var min = parseInt(el.dataset.preloaderMin || "600", 10);
    var t0 = Date.now();
    function onLoad() { setTimeout(finish, Math.max(0, min - (Date.now() - t0))); }
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
  }

  function start() { document.querySelectorAll("[data-preloader]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
