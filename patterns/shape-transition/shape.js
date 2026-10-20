/*
 * shape.js: steps a [data-shape] stack to its next view behind a covering shape.
 * The stack holds the views plus one .shape-cover. Buttons with data-shape-go="sweep|stripes|circle"
 * and aria-controls="<stack id>" start it. Reduced motion swaps the views at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function finished(el) {
    var runs = el.getAnimations({ subtree: true });
    return Promise.all(runs.map(function (a) { return a.finished; })).catch(function () {});
  }

  function setup(stack) {
    var cover = stack.querySelector(".shape-cover");
    var views = Array.prototype.filter.call(stack.children, function (c) { return c !== cover; });
    var i = Math.max(0, views.findIndex(function (v) { return v.classList.contains("is-current"); }));
    var busy = false;
    views.forEach(function (v, n) { v.classList.toggle("is-current", n === i); v.inert = n !== i; });

    function swap() {
      var next = (i + 1) % views.length;
      views[i].classList.remove("is-current"); views[i].inert = true;
      views[next].classList.add("is-current"); views[next].inert = false;
      i = next;
      stack.dispatchEvent(new CustomEvent("shapechange", { detail: { index: i } }));
    }

    function go(shape) {
      if (busy) return;
      if (reduce.matches || !cover) { swap(); return; }
      busy = true;
      cover.className = "shape-cover shape-" + shape + " is-covering";
      finished(cover).then(function () {
        swap();
        cover.classList.replace("is-covering", "is-uncovering");
        return finished(cover);
      }).then(function () {
        cover.className = "shape-cover";
        busy = false;
      });
    }

    document.querySelectorAll('[data-shape-go][aria-controls="' + stack.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-shape-go")); });
    });
  }

  function start() { document.querySelectorAll("[data-shape]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
