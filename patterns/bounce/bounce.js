/*
 * bounce.js (demo only): the "Drop it again" button replays every bounce inside its [data-bounce] scene.
 * Under reduced motion there is nothing to replay, so the button does nothing.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  function start() {
    document.querySelectorAll("[data-bounce-replay]").forEach(function (btn) {
      var scene = btn.closest("[data-bounce]");
      btn.addEventListener("click", function () {
        if (still.matches || !scene.getAnimations) return;
        scene.getAnimations({ subtree: true }).forEach(function (a) {
          if (!/^bounce/.test(a.animationName || "")) return;
          a.cancel();
          a.play();
        });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
