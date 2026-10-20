/*
 * pager.js: [data-pager] holding an optional .pager-prev and .pager-next and a .pager-list of
 * .pager-page buttons plus one .pager-mark. The current button carries aria-current="page".
 * A change fires "pager:change" on [data-pager] with detail.page (1-based).
 */
(function () {
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");

  function setup(root) {
    var list = root.querySelector(".pager-list");
    var pages = Array.prototype.slice.call(list.querySelectorAll(".pager-page"));
    var prev = root.querySelector(".pager-prev");
    var next = root.querySelector(".pager-next");
    var current = Math.max(0, pages.findIndex(function (p) { return p.getAttribute("aria-current") === "page"; }));

    function place(i, moving) {
      var b = pages[i];
      list.dataset.dir = moving && !(still && still.matches) ? (i > current ? "right" : "left") : "none";
      // offsets relative to the list, which is the marker's containing block
      var l = b.offsetLeft, r = list.clientWidth - b.offsetLeft - b.offsetWidth;
      list.style.setProperty("--pager-l", l + "px");
      list.style.setProperty("--pager-r", r + "px");
    }

    function go(i) {
      i = Math.max(0, Math.min(pages.length - 1, i));
      if (i === current) return;
      place(i, true);
      pages.forEach(function (p, n) {
        if (n === i) p.setAttribute("aria-current", "page"); else p.removeAttribute("aria-current");
      });
      current = i;
      sync();
      root.dispatchEvent(new CustomEvent("pager:change", { bubbles: true, detail: { page: i + 1 } }));
    }

    function sync() {
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current === pages.length - 1;
    }

    pages.forEach(function (p, n) { p.addEventListener("click", function () { go(n); }); });
    if (prev) prev.addEventListener("click", function () { go(current - 1); });
    if (next) next.addEventListener("click", function () { go(current + 1); });
    place(current, false);
    sync();
    if ("ResizeObserver" in window) new ResizeObserver(function () { place(current, false); }).observe(list);
    if (document.fonts) document.fonts.ready.then(function () { place(current, false); });
  }

  function start() { document.querySelectorAll("[data-pager]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
