/*
 * pixelate.js: steps a [data-pixelate] stack to its next view through pixels.
 * Buttons with data-pixelate-go and aria-controls="<stack id>" start it. The current view
 * coarsens, the next one takes its place at the coarsest step and sharpens.
 * The stack fires "pixelatechange" with the new index. Reduced motion swaps the views at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function finished(el) {
    var runs = el.getAnimations();
    return Promise.all(runs.map(function (a) { return a.finished; })).catch(function () {});
  }

  function setup(stack) {
    var views = Array.prototype.slice.call(stack.children);
    var i = Math.max(0, views.findIndex(function (v) { return v.classList.contains("is-current"); }));
    var busy = false;
    views.forEach(function (v, n) { v.classList.toggle("is-current", n === i); v.inert = n !== i; });

    function swap() {
      var next = (i + 1) % views.length;
      views[i].classList.remove("is-current"); views[i].inert = true;
      views[next].classList.add("is-current"); views[next].inert = false;
      i = next;
      stack.dispatchEvent(new CustomEvent("pixelatechange", { detail: { index: i } }));
      return views[i];
    }

    function go() {
      if (busy) return;
      if (reduce.matches) { swap(); return; }
      busy = true;
      var from = views[i];
      from.classList.add("pixelate-out");
      finished(from).then(function () {
        var to = views[(i + 1) % views.length];
        to.classList.add("pixelate-in");
        swap();
        from.classList.remove("pixelate-out");
        return finished(to).then(function () { to.classList.remove("pixelate-in"); });
      }).then(function () { busy = false; });
    }

    document.querySelectorAll('[data-pixelate-go][aria-controls="' + stack.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", go);
    });
  }

  function start() { document.querySelectorAll("[data-pixelate]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
