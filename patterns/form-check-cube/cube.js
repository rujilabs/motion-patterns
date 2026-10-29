/*
 * cube.js: the lift for .cube-check. A cube turning about its own centre would cut into the table
 * with its edge, so while it turns it rises a little toward you and its contact shadow tightens,
 * then it lands. The turn itself is CSS; this only adds the lift with the Web Animations API.
 * Off under reduced motion.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function setup(label) {
    var input = label.querySelector("input");
    var box = label.querySelector(".cube-box");
    var lift = label.querySelector(".cube-lift");
    if (!input || !box || !lift || !lift.animate || label._cube) return;
    label._cube = true;
    input.addEventListener("change", function () {
      if (reduce.matches) return;
      var turn = parseFloat(getComputedStyle(box).getPropertyValue("--cube-turn")) || 520;
      var t = { duration: turn * 0.8, easing: "ease-in-out" };
      lift.animate([
        { transform: "none" },
        { transform: "translateY(-12%) scale(1.1)", offset: 0.35 },
        { transform: "none" }
      ], t);
      // the shadow stays on the table: it shrinks and fades while the cube is up
      try {
        box.animate([
          { transform: "none", opacity: 1 },
          { transform: "scaleX(.7)", opacity: 0.55, offset: 0.35 },
          { transform: "none", opacity: 1 }
        ], { duration: t.duration, easing: t.easing, pseudoElement: "::before" });
      } catch (err) {}
    });
  }
  function init() { document.querySelectorAll(".cube-check").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
