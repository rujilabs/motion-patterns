/*
 * curl.js: turns the top page of a [data-curl] stack over to show the next one, or lays the
 * previous page back down. Buttons with data-curl-go="next|prev" and aria-controls="<stack id>".
 * The stack holds the pages plus one .curl-flap (with one empty child). It fires "curlchange"
 * with the new index. Reduced motion swaps the pages at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function finished(el) {
    var runs = el.getAnimations({ subtree: true });
    return Promise.all(runs.map(function (a) { return a.finished; })).catch(function () {});
  }

  function setup(stack) {
    var flap = stack.querySelector(".curl-flap");
    var pages = Array.prototype.filter.call(stack.children, function (c) { return c !== flap; });
    var i = Math.max(0, pages.findIndex(function (p) { return p.classList.contains("is-current"); }));
    var busy = false;
    pages.forEach(function (p, n) { p.classList.toggle("is-current", n === i); p.inert = n !== i; });

    function go(step) {
      if (busy) return;
      var next = (i + step + pages.length) % pages.length;
      var from = pages[i], to = pages[next];
      function done() {
        stack.classList.remove("is-turning", "curl-back");
        from.classList.remove("is-current", "is-top", "is-under");
        to.classList.remove("is-top", "is-under");
        to.classList.add("is-current");
        from.inert = true;
        to.inert = false;
        i = next;
        busy = false;
        stack.dispatchEvent(new CustomEvent("curlchange", { detail: { index: i } }));
      }
      if (reduce.matches || !flap) { done(); return; }
      busy = true;
      // forward: the current page turns away over the next; back: the previous page lays down over the current
      var top = step > 0 ? from : to, under = step > 0 ? to : from;
      top.classList.add("is-top");
      under.classList.add("is-under");
      stack.classList.toggle("curl-back", step < 0);
      stack.classList.add("is-turning");
      finished(stack).then(done);
    }

    document.querySelectorAll('[data-curl-go][aria-controls="' + stack.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-curl-go") === "prev" ? -1 : 1); });
    });
  }

  function start() { document.querySelectorAll("[data-curl]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
