/*
 * range.js: keeps a .range in step with its input. Sets --range-p (0 to 1) on the .range and writes
 * the value into the .range-bubble, using data-prefix and data-suffix from the input. Adds .is-held
 * while a pointer holds the thumb, so the bubble pops. Fires nothing of its own: listen for "input".
 */
(function () {
  function setup(root) {
    var input = root.querySelector('input[type="range"]');
    var bubble = root.querySelector(".range-bubble");
    if (!input) return;
    var pre = input.dataset.prefix || "";
    var suf = input.dataset.suffix || "";

    function update() {
      var min = parseFloat(input.min || 0), max = parseFloat(input.max || 100);
      var v = parseFloat(input.value);
      root.style.setProperty("--range-p", max > min ? (v - min) / (max - min) : 0);
      if (bubble) bubble.textContent = pre + Number(v).toLocaleString("en") + suf;
    }
    // reduced motion: no pop and no swell; the bubble just tracks the value
    var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
    function hold() { if (!(still && still.matches)) root.classList.add("is-held"); }
    function release() { root.classList.remove("is-held"); }

    input.addEventListener("input", update);
    input.addEventListener("pointerdown", hold);
    input.addEventListener("pointerup", release);
    input.addEventListener("pointercancel", release);
    input.addEventListener("blur", release);
    window.addEventListener("pointerup", release);
    update();
  }

  function start() { document.querySelectorAll(".range").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
