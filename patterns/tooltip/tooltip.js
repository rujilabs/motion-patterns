/*
 * tooltip.js: optional. Esc hides any open label until the pointer leaves or focus moves on
 * (WCAG 1.4.13: dismissible without moving the pointer). And a warm group: once a label in a
 * .tip-group has shown, the next one shows without the hover wait, for a short while after.
 * The motion is all in style.css.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var cool = reduce.matches ? 300 : 500;

  function start() {
    document.querySelectorAll(".tip").forEach(function (tip) {
      var label = tip.querySelector(".tip-label");
      function leave() {
        tip.classList.remove("tip-off");
        var group = tip.closest(".tip-group");
        if (!group || !label || getComputedStyle(label).visibility !== "visible") return;
        group.dataset.tipWarm = "";
        clearTimeout(group._tipCool);
        group._tipCool = setTimeout(function () { delete group.dataset.tipWarm; }, cool);
      }
      tip.addEventListener("pointerleave", leave);
      tip.addEventListener("focusout", function () { tip.classList.remove("tip-off"); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".tip:hover, .tip:focus-within").forEach(function (tip) { tip.classList.add("tip-off"); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
