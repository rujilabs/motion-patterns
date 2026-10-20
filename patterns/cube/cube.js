/*
 * cube.js: turns a [data-cube] frame to its next or previous face.
 * Buttons with data-cube-go="next|prev" and aria-controls="<.cube id>" turn it a quarter. A
 * [data-cube-y] checkbox with the same aria-controls turns it over the top edge instead.
 * The face turned away is inert. The frame fires "cubechange" with the new face index.
 * The turn is a CSS transition, so reduced motion needs nothing here beyond skipping the dip.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(cube) {
    var faces = Array.prototype.slice.call(cube.querySelectorAll(".cube-face"));
    var box = cube.querySelector(".cube-box");
    var turn = 0;
    function face() { return ((turn % faces.length) + faces.length) % faces.length; }
    function mark() { faces.forEach(function (f, n) { f.inert = n !== face(); }); }
    mark();

    function go(step) {
      turn += step;
      cube.style.setProperty("--cube-turn", turn);
      mark();
      if (!reduce.matches) {
        cube.classList.remove("is-turning");
        void cube.offsetWidth; // restart the dip if a turn is already running
        cube.classList.add("is-turning");
      }
      cube.dispatchEvent(new CustomEvent("cubechange", { detail: { index: face() } }));
    }
    cube.addEventListener("animationend", function (e) { if (e.target === cube) cube.classList.remove("is-turning"); });

    var axis = document.querySelector('[data-cube-y][aria-controls="' + cube.id + '"]');
    if (axis) {
      var flip = function () {
        // change axis without a spin: drop the transition for one frame
        box.style.transition = "none";
        cube.classList.toggle("cube-y", axis.checked);
        void box.offsetWidth;
        box.style.transition = "";
      };
      flip();
      axis.addEventListener("change", flip);
    }

    document.querySelectorAll('[data-cube-go][aria-controls="' + cube.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-cube-go") === "prev" ? -1 : 1); });
    });
  }

  function start() { document.querySelectorAll("[data-cube]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
