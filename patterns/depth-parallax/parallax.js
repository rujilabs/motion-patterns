/*
 * parallax.js: follows the pointer over every .parallax[data-parallax] and writes --px and --py
 * (-1 at the left or top edge, 1 at the right or bottom) on it. On leave both go back to 0 and
 * the layers ease home. Reduced motion: nothing is written.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function setup(scene) {
    var frame = 0, x = 0, y = 0;
    function write() {
      frame = 0;
      scene.style.setProperty("--px", x.toFixed(3));
      scene.style.setProperty("--py", y.toFixed(3));
    }
    scene.addEventListener("pointermove", function (e) {
      if (reduce.matches) return;
      var r = scene.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 2 - 1;
      y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(write);
    });
    scene.addEventListener("pointerleave", function () { x = 0; y = 0; if (!frame) frame = requestAnimationFrame(write); });
  }
  function start() { document.querySelectorAll("[data-parallax]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
