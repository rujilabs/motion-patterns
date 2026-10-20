/*
 * blinds.js: steps a [data-blinds] stack to its next view through blinds.
 * Buttons with data-blinds-go="open|turn" and aria-controls="<stack id>" start it. For "turn" the
 * stack holds an empty .blinds-cover, which this script fills with --blinds-n slats. A [data-blinds-v]
 * checkbox with the same aria-controls puts the slats upright (.blinds-v on the stack).
 * The stack fires "blindschange" with the new index. Reduced motion swaps the views at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function finished(el) {
    var runs = el.getAnimations({ subtree: true });
    return Promise.all(runs.map(function (a) { return a.finished; })).catch(function () {});
  }

  function setup(stack) {
    var cover = stack.querySelector(".blinds-cover");
    var views = Array.prototype.filter.call(stack.children, function (c) { return c !== cover; });
    var i = Math.max(0, views.findIndex(function (v) { return v.classList.contains("is-current"); }));
    var busy = false;
    views.forEach(function (v, n) { v.classList.toggle("is-current", n === i); v.inert = n !== i; });

    if (cover && !cover.children.length) {
      var n = parseInt(getComputedStyle(stack).getPropertyValue("--blinds-n"), 10) || 8;
      for (var k = 0; k < n; k++) {
        var slat = document.createElement("span");
        slat.style.setProperty("--blinds-i", k);
        cover.appendChild(slat);
      }
    }

    var upright = document.querySelector('[data-blinds-v][aria-controls="' + stack.id + '"]');
    if (upright) {
      stack.classList.toggle("blinds-v", upright.checked);
      upright.addEventListener("change", function () { stack.classList.toggle("blinds-v", upright.checked); });
    }

    function swap() {
      var next = (i + 1) % views.length;
      views[i].classList.remove("is-current"); views[i].inert = true;
      views[next].classList.add("is-current"); views[next].inert = false;
      i = next;
      stack.dispatchEvent(new CustomEvent("blindschange", { detail: { index: i } }));
    }

    function go(kind) {
      if (busy) return;
      if (reduce.matches) { swap(); return; }
      busy = true;
      if (kind === "turn" && cover) {
        cover.classList.add("is-closing");
        finished(cover).then(function () {
          swap();
          cover.classList.replace("is-closing", "is-opening");
          return finished(cover);
        }).then(function () {
          cover.classList.remove("is-opening");
          busy = false;
        });
        return;
      }
      var to = views[(i + 1) % views.length];
      to.classList.add("blinds-in", "blinds-open");
      finished(to).then(function () {
        swap();
        to.classList.remove("blinds-in", "blinds-open");
        busy = false;
      });
    }

    document.querySelectorAll('[data-blinds-go][aria-controls="' + stack.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-blinds-go")); });
    });
  }

  function start() { document.querySelectorAll("[data-blinds]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
