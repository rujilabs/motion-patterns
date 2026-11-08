/*
 * bell-toggle.js: rings every .bell switch when it turns on. The bell swings about its hanger on a
 * decaying sine, and the clapper swings about the same point a beat behind, so it strikes the rim on
 * each return; two sound arcs pulse out at the first strikes. Web Animations, so a page timeline shows
 * it. el.ring() rings it again without changing the value. Off under reduced motion.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var N = 33, DUR = 1100, A = 24, F = 2.6, TAU = 0.32;
  // the swing worked out once: bell angle, and the clapper's angle inside the bell
  var SWING = [], CLAP = [];
  for (var i = 0; i < N; i++) {
    var t = i / (N - 1) * DUR / 1000, env = Math.exp(-t / TAU) * (1 - i / (N - 1));
    SWING.push({ transform: "rotate(" + (A * env * Math.sin(2 * Math.PI * F * t)).toFixed(2) + "deg)" });
    CLAP.push({ transform: "rotate(" + (-0.8 * A * env * Math.sin(2 * Math.PI * F * t - 0.9)).toFixed(2) + "deg)" });
  }
  var WAVE = [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1)", offset: 0.3 }, { opacity: 0, transform: "scale(1.35)" }];

  function setup(label) {
    var input = label.querySelector("input");
    var swing = label.querySelector(".bell-swing"), clap = label.querySelector(".bell-clap");
    if (!input || !swing || label._bell || !swing.animate) return;
    label._bell = true;
    var running = [];
    function ring() {
      if (reduce.matches) return;
      running.forEach(function (a) { a.cancel(); });
      running = [swing.animate(SWING, { duration: DUR, easing: "linear" })];
      if (clap) running.push(clap.animate(CLAP, { duration: DUR, easing: "linear" }));
      label.querySelectorAll(".bell-wave").forEach(function (w) {
        running.push(w.animate(WAVE, { duration: 520, easing: "ease-out" }));
        running.push(w.animate(WAVE, { duration: 520, delay: 400, easing: "ease-out" }));
      });
    }
    label.ring = ring;
    input.addEventListener("change", function () { if (input.checked) ring(); });
  }
  function init() { document.querySelectorAll(".bell").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
