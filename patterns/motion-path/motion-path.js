/*
 * motion-path.js (demo only): the "Replay" button sends the rider along the route again.
 * Under reduced motion the rider is already at the door, so there is nothing to replay.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  function start() {
    document.querySelectorAll("[data-mp-replay]").forEach(function (btn) {
      var scene = btn.closest("[data-mp]");
      btn.addEventListener("click", function () {
        if (still.matches || !scene.getAnimations) return;
        scene.getAnimations({ subtree: true }).forEach(function (a) {
          if (!/^motion-/.test(a.animationName || "")) return;
          a.cancel();
          a.play();
        });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
