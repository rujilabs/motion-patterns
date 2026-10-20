/*
 * page-transition.js: window.pageTransition(update, options) swaps one view for another.
 *   update: a function that changes the DOM (hide one page, show the other).
 *   options.shared: [{ name, from, to }] pairs that morph. "from" is the element before the swap,
 *     "to" the element after it (or a function that returns it). Only one element may carry a
 *     name at a time, so the names are set just for the swap and cleared afterwards.
 *   options.page: the element that appears, for the fallback rise-in.
 * Returns a promise that settles when the motion is over. Under reduced motion, or without the
 * API, the update runs at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function pick(x) { return typeof x === "function" ? x() : x; }
  function name(el, n) { if (el) el.style.viewTransitionName = n; }

  window.pageTransition = function (update, options) {
    var o = options || {};
    var shared = o.shared || [];

    if (!document.startViewTransition || reduce.matches) {
      update();
      var page = pick(o.page);
      if (page && !reduce.matches) {
        page.classList.remove("pt-in");
        void page.offsetWidth;
        page.classList.add("pt-in");
      }
      return Promise.resolve();
    }

    shared.forEach(function (s) { name(pick(s.from), s.name); });
    var t = document.startViewTransition(function () {
      shared.forEach(function (s) { name(pick(s.from), ""); });
      update();
      shared.forEach(function (s) { name(pick(s.to), s.name); });
    });
    return t.finished.catch(function () {}).then(function () {
      shared.forEach(function (s) { name(pick(s.to), ""); });
    });
  };
})();
