/*
 * slowmo.js: plays the action in a [data-slowmo] block at normal speed, then again slowed down,
 * pass after pass. The action is any CSS animation inside .slowmo-scene, all sharing one length.
 * The script only changes their playbackRate at the start of each pass (data-slowmo="0.25" sets
 * the slow rate), writes the rate into .slowmo-rate, and sets data-speed="slow" or "normal".
 */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setup(root) {
    if (reduce || !root.getAnimations) return;
    var rate = parseFloat(root.getAttribute("data-slowmo")) || 0.25;
    var scene = root.querySelector(".slowmo-scene") || root;
    var label = root.querySelector(".slowmo-rate");
    var anims = scene.getAnimations({ subtree: true });
    if (!anims.length) return;
    var lead = anims[0];
    var dur = lead.effect.getComputedTiming().duration;
    var pass = -1;

    function show(slow) {
      root.setAttribute("data-speed", slow ? "slow" : "normal");
      if (label) label.textContent = slow ? rate + "x" : "1x";
      anims.forEach(function (a) {
        if (a.updatePlaybackRate) a.updatePlaybackRate(slow ? rate : 1);
        else a.playbackRate = slow ? rate : 1;
      });
    }

    // the pass number is counted in the animation's own time, so a slow pass lasts longer on the clock
    function tick() {
      var t = lead.currentTime;
      if (t !== null && dur > 0) {
        var n = Math.floor(t / dur);
        if (n !== pass) { pass = n; show(n % 2 === 1); }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function start() { document.querySelectorAll("[data-slowmo]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
