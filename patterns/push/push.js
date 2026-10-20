/*
 * push.js: steps a [data-push] stack to the next or previous view with a push.
 * Buttons with data-push-go="next|prev" and aria-controls="<stack id>" start it. Next pushes
 * left and prev pushes right; a [data-push-axis] checkbox with the same aria-controls turns
 * them into up and down. The stack fires "pushchange" with the new index.
 * Reduced motion swaps the views at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var DIRS = ["push-left", "push-right", "push-up", "push-down"];

  function setup(stack) {
    var views = Array.prototype.slice.call(stack.children);
    var i = Math.max(0, views.findIndex(function (v) { return v.classList.contains("is-current"); }));
    var busy = false;
    var axis = document.querySelector('[data-push-axis][aria-controls="' + stack.id + '"]');
    views.forEach(function (v, n) { v.classList.toggle("is-current", n === i); v.inert = n !== i; });

    function go(step) {
      if (busy) return;
      var from = views[i], next = (i + step + views.length) % views.length, to = views[next];
      var vertical = axis && axis.checked;
      var dir = step > 0 ? (vertical ? "push-up" : "push-left") : (vertical ? "push-down" : "push-right");

      function done() {
        from.classList.remove("push-out", "is-current");
        to.classList.remove("push-in");
        to.classList.add("is-current");
        stack.classList.remove.apply(stack.classList, DIRS);
        from.inert = true;
        to.inert = false;
        i = next;
        busy = false;
        stack.dispatchEvent(new CustomEvent("pushchange", { detail: { index: i } }));
      }
      if (reduce.matches) { done(); return; }
      busy = true;
      stack.classList.remove.apply(stack.classList, DIRS);
      stack.classList.add(dir);
      from.classList.add("push-out");
      to.classList.add("push-in");
      var runs = from.getAnimations().concat(to.getAnimations());
      if (!runs.length) { done(); return; }
      Promise.all(runs.map(function (a) { return a.finished; })).then(done, done);
    }

    document.querySelectorAll('[data-push-go][aria-controls="' + stack.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-push-go") === "prev" ? -1 : 1); });
    });
  }

  function start() { document.querySelectorAll("[data-push]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
