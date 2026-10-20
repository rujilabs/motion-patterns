/*
 * mask.js: steps a [data-mask] stack to its next view through a growing mask.
 * Buttons with data-mask-go="circle|diagonal|letter" and aria-controls="<stack id>" start it.
 * A pointer click grows the circle from the pointer; a keyboard press grows it from the centre.
 * Reduced motion swaps the views at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(stack) {
    var views = Array.prototype.slice.call(stack.children);
    var i = Math.max(0, views.findIndex(function (v) { return v.classList.contains("is-current"); }));
    var busy = false;
    views.forEach(function (v, n) { v.classList.toggle("is-current", n === i); v.inert = n !== i; });

    function go(shape, e) {
      if (busy) return;
      var from = views[i], next = (i + 1) % views.length, to = views[next];
      var r = stack.getBoundingClientRect();
      var x = r.width / 2, y = r.height / 2;
      if (e && e.detail > 0) { // a pointer click, not Enter or Space
        x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
        y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
      }
      // the radius that reaches the farthest corner
      var far = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
      to.style.setProperty("--mask-x", x + "px");
      to.style.setProperty("--mask-y", y + "px");
      to.style.setProperty("--mask-r", Math.ceil(far) + "px");

      function done() {
        to.classList.remove("mask-in", "mask-" + shape);
        to.classList.add("is-current");
        from.classList.remove("is-current");
        from.inert = true;
        to.inert = false;
        i = next;
        busy = false;
        stack.dispatchEvent(new CustomEvent("maskchange", { detail: { index: i } }));
      }
      if (reduce.matches) { done(); return; }
      busy = true;
      to.classList.add("mask-in", "mask-" + shape);
      var runs = to.getAnimations();
      if (!runs.length) { done(); return; }
      Promise.all(runs.map(function (a) { return a.finished; })).then(done, done);
    }

    document.querySelectorAll('[data-mask-go][aria-controls="' + stack.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function (e) { go(btn.getAttribute("data-mask-go"), e); });
    });
  }

  function start() { document.querySelectorAll("[data-mask]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
