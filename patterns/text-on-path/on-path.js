/*
 * on-path.js: moves text along an SVG path. SVG has no CSS property for a textPath's start
 * offset, so style.css animates a registered custom property (--tp-shift) and this script copies
 * it into the startOffset attribute every frame. The motion is a real CSS animation: pause it,
 * scrub it or slow it like any other, and the text follows.
 *
 * Markup: <textPath class="path-travel" href="#curve">One phrase · </textPath>. The script
 * repeats the phrase until it covers the path, and sets --tp-unit to the length of one phrase,
 * so one cycle moves the text by exactly one phrase and the loop has no seam.
 */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = [];

  function setup(tp) {
    var path = document.querySelector(tp.getAttribute("href"));
    if (!path || !tp.getComputedTextLength) return;
    var phrase = tp.textContent;
    var unit = tp.getComputedTextLength();
    if (!unit) return;
    var need = Math.ceil(path.getTotalLength() / unit) + 1;
    tp.textContent = new Array(need + 1).join(phrase);
    tp.style.setProperty("--tp-unit", unit + "px");
    items.push({ tp: tp, last: null });
  }

  function frame() {
    items.forEach(function (it) {
      var v = parseFloat(getComputedStyle(it.tp).getPropertyValue("--tp-shift")) || 0;
      if (v !== it.last) { it.last = v; it.tp.setAttribute("startOffset", v.toFixed(2)); }
    });
    requestAnimationFrame(frame);
  }

  function start() {
    if (reduce) return;
    document.querySelectorAll("textPath.path-travel").forEach(setup);
    if (items.length) requestAnimationFrame(frame);
  }
  function ready() {
    // measure with the real font, not a fallback
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
