/*
 * liquid.js: steps a [data-liquid] stack to its next view, flooding it in with liquid-transition.
 * Buttons with data-liquid-go and aria-controls="<stack id>" start it; data-liquid-go="drain" fills
 * from the top. Reduced motion swaps the views at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(stack) {
    var views = Array.prototype.slice.call(stack.children);
    var i = Math.max(0, views.findIndex(function (v) { return v.classList.contains("is-current"); }));
    var busy = false;
    views.forEach(function (v, n) { v.classList.toggle("is-current", n === i); v.inert = n !== i; });

    function go(kind) {
      if (busy) return;
      var from = views[i], next = (i + 1) % views.length, to = views[next];
      function done() {
        to.classList.remove("liquid-in", "liquid-drain");
        to.classList.add("is-current"); to.inert = false;
        from.classList.remove("is-current"); from.inert = true;
        i = next; busy = false;
        stack.dispatchEvent(new CustomEvent("liquidchange", { detail: { index: i } }));
      }
      if (reduce.matches) { done(); return; }
      busy = true;
      to.classList.add("liquid-in");
      if (kind === "drain") to.classList.add("liquid-drain");
      var runs = to.getAnimations();
      if (!runs.length) { done(); return; }
      Promise.all(runs.map(function (a) { return a.finished; })).then(done, done);
    }

    document.querySelectorAll('[data-liquid-go][aria-controls="' + stack.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-liquid-go")); });
    });
  }

  function start() { document.querySelectorAll("[data-liquid]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
