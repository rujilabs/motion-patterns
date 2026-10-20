/*
 * freeze.js: stops the action in a [data-freeze] block on its key frame once per pass, holds it while
 * the flash and the label play, then lets it run on. The action is any set of CSS animations inside
 * .freeze-scene that share one length. data-freeze-at is the key frame as a fraction of that length
 * (default .5), data-freeze-hold the hold in milliseconds (default 1600). A checkbox inside
 * .freeze-pause in the surrounding .freeze-group pauses the whole thing.
 */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setup(root) {
    if (reduce || !root.getAnimations) return;
    var scene = root.querySelector(".freeze-scene") || root;
    var acts = scene.getAnimations({ subtree: true }).filter(function (a) {
      return !(window.CSSTransition && a instanceof CSSTransition);
    });
    if (!acts.length) return;
    var lead = acts[0];
    var dur = lead.effect.getComputedTiming().duration;
    if (!(dur > 0)) return;
    var at = (parseFloat(root.getAttribute("data-freeze-at")) || 0.5) * dur;
    var hold = parseFloat(root.getAttribute("data-freeze-hold")) || 1600;
    var group = root.closest(".freeze-group") || root;
    var toggle = group.querySelector(".freeze-pause input");
    var frozen = false, held = 0, last = 0, done = -1;

    function paused() { return !!(toggle && toggle.checked); }
    function run(on) { acts.forEach(function (a) { if (on) a.play(); else a.pause(); }); }

    function freeze(pass) {
      done = pass;
      frozen = true;
      held = 0;
      run(false);
      // land every part exactly on the key frame, not on the first frame the check happened to see
      acts.forEach(function (a) { a.currentTime = pass * dur + at; });
      root.classList.add("is-frozen");
    }

    function tick(now) {
      var dt = last ? now - last : 0;
      last = now;
      if (!paused()) {
        if (frozen) {
          held += dt;
          if (held >= hold) { frozen = false; root.classList.remove("is-frozen"); run(true); }
        } else if (lead.currentTime !== null) {
          var pass = Math.floor(lead.currentTime / dur);
          if (pass !== done && lead.currentTime - pass * dur >= at) freeze(pass);
        }
      }
      requestAnimationFrame(tick);
    }

    // once the script has played or paused an animation, CSS can no longer pause it, so the toggle is handled here
    if (toggle) toggle.addEventListener("change", function () {
      if (toggle.checked) run(false);
      else if (!frozen) run(true);
    });
    requestAnimationFrame(tick);
  }

  function start() { document.querySelectorAll("[data-freeze]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
