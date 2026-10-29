/*
 * rocker.js: the over-centre snap for .rocker switches. A rocker is bistable: once the paddle passes
 * the middle, its spring throws it into the far stop, it knocks back a little and settles. This plays
 * that on --rk (the one number the CSS reads for tilt, light and lamp) with the Web Animations API.
 * The checkbox is still the source of truth; this only animates the change. Off under reduced motion.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ease = getComputedStyle(document.documentElement);
  var EASE_IN = ease.getPropertyValue("--ease-in").trim() || "ease-in";
  var EASE_OUT = ease.getPropertyValue("--ease-out").trim() || "ease-out";
  var ok = !!(window.CSS && "registerProperty" in CSS); // @property support: --rk can animate

  function setup(label) {
    var input = label.querySelector("input");
    var bezel = label.querySelector(".rocker-bezel");
    if (!input || !bezel || !bezel.animate || label._rocker) return;
    label._rocker = true;
    input.addEventListener("change", function () {
      if (reduce.matches || !ok) return;
      var to = input.checked ? 1 : -1;
      // it starts from where the press left it: a quarter of the way over
      var from = -to * 0.76;
      bezel.classList.add("is-snapping");
      if (bezel._snap) bezel._snap.cancel();
      bezel._snap = bezel.animate([
        { "--rk": from, easing: EASE_IN },
        { "--rk": to, offset: 0.55, easing: EASE_OUT },
        { "--rk": to * 0.8, offset: 0.75, easing: EASE_IN },
        { "--rk": to }
      ], { duration: 260 });
      bezel._snap.onfinish = function () { bezel.classList.remove("is-snapping"); bezel._snap = null; };
    });
  }
  function init() { document.querySelectorAll(".rocker").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
