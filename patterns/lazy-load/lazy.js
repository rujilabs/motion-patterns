/*
 * lazy.js: for every .lazy frame with an <img data-src>, sets src when the frame comes within
 * 200px of the viewport, waits for the image to decode, then adds .is-loaded to the frame.
 * An <img src> without data-src (already loading) just gets .is-loaded once it is ready.
 * data-lazy-margin on any ancestor (or <html>) changes that 200px, for example "-10%" to wait until
 * the frame is well inside the view. data-lazy-delay="ms" on a frame holds its reveal back: for demos
 * and testing only.
 */
(function () {
  document.documentElement.classList.add("js");

  function ready(frame, img) {
    var hold = parseInt(frame.dataset.lazyDelay || "0", 10);
    var done = function () { setTimeout(function () { frame.classList.add("is-loaded"); }, hold); };
    if (img.decode) img.decode().then(done, done);
    else if (img.complete) done();
    else { img.addEventListener("load", done); img.addEventListener("error", done); }
  }

  function load(frame) {
    var img = frame.querySelector("img");
    if (!img) return;
    if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
    ready(frame, img);
  }

  function start() {
    var frames = document.querySelectorAll(".lazy");
    var marked = document.querySelector("[data-lazy-margin]");
    var margin = marked ? marked.dataset.lazyMargin : "200px";
    if (!("IntersectionObserver" in window)) { frames.forEach(load); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        load(e.target);
      });
    }, { rootMargin: margin + " 0px" });
    frames.forEach(function (f) { io.observe(f); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
