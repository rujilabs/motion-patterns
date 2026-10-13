/*
 * skeleton.js: numbers the bones in each [data-skeleton] in reading order (top to bottom, then
 * left to right) as --bone-i, so the handover runs down the card the way the eye does.
 * It renumbers each time aria-busy turns false. Your code sets aria-busy; this file only orders.
 */
(function () {
  document.documentElement.classList.add("js");
  function order(root) {
    var bones = Array.prototype.slice.call(root.querySelectorAll(".bone, .bone-lines, .bone-block"));
    var rows = bones.map(function (el) { var r = el.getBoundingClientRect(); return { el: el, top: Math.round(r.top / 8), left: r.left }; });
    rows.sort(function (a, b) { return a.top - b.top || a.left - b.left; });
    var i = -1, last = null;
    rows.forEach(function (r) {
      if (r.top !== last) { i++; last = r.top; }
      r.el.style.setProperty("--bone-i", i);
    });
  }
  function start() {
    document.querySelectorAll("[data-skeleton]").forEach(function (root) {
      order(root);
      new MutationObserver(function () {
        if (root.getAttribute("aria-busy") === "false") order(root);
      }).observe(root, { attributes: true, attributeFilter: ["aria-busy"] });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
