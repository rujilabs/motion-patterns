/*
 * breadcrumbs.js: grow and fold a trail of crumbs. Markup: an <ol class="crumbs"> of
 * <li class="crumb"> items. Two calls:
 *   breadcrumbs.push(list, li)  appends li and opens it in
 *   breadcrumbs.trim(list, n)   keeps the first n crumbs and folds the rest away, last first
 * The current crumb is the last one; push and trim move aria-current="page" for you.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function live(list) {
    return Array.prototype.filter.call(list.children, function (li) { return !li.classList.contains("crumb-out"); });
  }

  function mark(list) {
    var all = live(list);
    all.forEach(function (li, i) {
      var target = li.querySelector("a, button") || li.firstElementChild;
      if (!target) return;
      if (i === all.length - 1) target.setAttribute("aria-current", "page");
      else target.removeAttribute("aria-current");
    });
  }

  function scrollEnd(list) {
    if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: list.scrollWidth, behavior: reduce.matches ? "auto" : "smooth" });
  }

  function push(list, li) {
    li.classList.add("crumb");
    list.appendChild(li);
    mark(list);
    if (!reduce.matches) {
      li.classList.add("crumb-in");
      // the label ends last (it starts a beat late), so wait for it
      li.addEventListener("animationend", function done(e) {
        if (e.target !== li.firstElementChild) return;
        li.classList.remove("crumb-in");
        li.removeEventListener("animationend", done);
      });
    }
    scrollEnd(list);
  }

  function trim(list, keep) {
    var gone = live(list).slice(keep);
    gone.forEach(function (li, i) {
      if (reduce.matches) { li.remove(); return; }
      li.style.setProperty("--crumb-o", gone.length - 1 - i);
      li.classList.remove("crumb-in");
      li.classList.add("crumb-out");
      li.inert = true;
      li.addEventListener("animationend", function (e) { if (e.target === li) li.remove(); });
    });
    mark(list);
  }

  window.breadcrumbs = { push: push, trim: trim };
})();
