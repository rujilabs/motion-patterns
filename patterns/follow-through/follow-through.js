/*
 * follow-through.js (demo only): the "Play again" button restarts every follow animation inside
 * its [data-follow] scene, all on the same clock. Under reduced motion there is nothing to replay.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  function start() {
    document.querySelectorAll("[data-follow-replay]").forEach(function (btn) {
      var scene = btn.closest("[data-follow]");
      btn.addEventListener("click", function () {
        if (still.matches || !scene.getAnimations) return;
        scene.getAnimations({ subtree: true }).forEach(function (a) {
          if (!/^follow/.test(a.animationName || "")) return;
          a.cancel();
          a.play();
        });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
