/*
 * steps.js: drives an <ol class="steps"> of .step items. Call steps.go(list, i) to make step i
 * current (0 based). Steps before it become done; steps after it wait. Pass i equal to the number
 * of steps to mark every step done. The current step gets aria-current="step".
 */
(function () {
  function go(list, i) {
    var items = Array.prototype.slice.call(list.querySelectorAll(".step"));
    var n = items.length;
    i = Math.max(0, Math.min(i, n));
    list.style.setProperty("--steps-n", n);
    list.style.setProperty("--steps-p", n > 1 ? Math.min(i, n - 1) / (n - 1) : 1);
    items.forEach(function (li, k) {
      var state = k < i ? "done" : k === i ? "current" : "todo";
      li.dataset.state = state;
      if (state === "current") li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    list.dataset.at = i;
  }

  window.steps = { go: go };

  function start() {
    document.querySelectorAll("ol.steps").forEach(function (list) {
      var at = list.querySelector('.step[aria-current="step"]');
      var items = Array.prototype.slice.call(list.querySelectorAll(".step"));
      go(list, at ? items.indexOf(at) : 0);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
