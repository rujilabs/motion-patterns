/*
 * compare.js: for every .ba frame, copies the range input's value into --ba-pos as a percentage.
 * The first touch stops the hint nudge (adds .is-used), so the divider never fights the hand.
 */
(function () {
  function setup(ba) {
    var range = ba.querySelector(".ba-range");
    if (!range) return;
    function set() {
      ba.style.setProperty("--ba-pos", range.value + "%");
      var v = Math.round(range.value);
      range.setAttribute("aria-valuetext", "Before " + v + "%, after " + (100 - v) + "%");
    }
    function used() { ba.classList.add("is-used"); }
    range.addEventListener("input", function () { used(); set(); });
    range.addEventListener("pointerdown", used);
    range.addEventListener("keydown", used);
    set();
  }
  function start() { document.querySelectorAll(".ba").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
