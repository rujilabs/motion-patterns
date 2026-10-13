/*
 * tabs.js: ARIA tabs with the inchworm ink. Markup: [data-tabs] holding a .tabs-list
 * (role="tablist", buttons with role="tab" and aria-controls, plus one .tabs-ink span) and a
 * .tabs-panels holding the role="tabpanel" elements. Arrow keys, Home and End move between tabs.
 */
(function () {
  document.documentElement.classList.add("js");

  function setup(root) {
    var list = root.querySelector('[role="tablist"]');
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var ink = list.querySelector(".tabs-ink");
    var panels = root.querySelector(".tabs-panels");
    var current = Math.max(0, tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; }));

    function place(i, moving) {
      var t = tabs[i];
      list.dataset.ink = moving ? (i > current ? "right" : "left") : "none";
      list.style.setProperty("--ink-l", t.offsetLeft + "px");
      list.style.setProperty("--ink-r", (list.clientWidth - t.offsetLeft - t.offsetWidth) + "px");
    }

    function panelOf(t) { return document.getElementById(t.getAttribute("aria-controls")); }

    function select(i, focus) {
      if (i === current) { if (focus) tabs[i].focus(); return; }
      var from = current;
      place(i, true);
      panels.style.setProperty("--tabs-dir", i > from ? 1 : -1);
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        var p = panelOf(t);
        p.classList.remove("is-in", "is-out");
        if (on) { p.classList.remove("is-off"); p.inert = false; p.classList.add("is-in"); }
        else if (n === from) { p.inert = true; p.classList.add("is-out"); }
        else { p.inert = true; p.classList.add("is-off"); }
      });
      current = i;
      if (focus) tabs[i].focus();
      // no animation (reduced motion, or the CSS is missing): settle the panels now
      Array.prototype.forEach.call(panels.children, function (p) {
        if (getComputedStyle(p).animationName === "none") settle(p);
      });
    }

    function settle(p) {
      if (p.classList.contains("is-out")) { p.classList.remove("is-out"); p.classList.add("is-off"); }
      else p.classList.remove("is-in");
    }

    panels.addEventListener("animationend", function (e) {
      if (e.target.parentNode === panels) settle(e.target);
    });

    tabs.forEach(function (t, n) {
      var on = n === current;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      panelOf(t).inert = !on;
      panelOf(t).classList.toggle("is-off", !on);
      t.addEventListener("click", function () { select(n, false); });
    });

    list.addEventListener("keydown", function (e) {
      var n = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      select((n + tabs.length) % tabs.length, true);
    });

    place(current, false);
    if ("ResizeObserver" in window) new ResizeObserver(function () { place(current, false); }).observe(list);
    if (document.fonts) document.fonts.ready.then(function () { place(current, false); });
  }

  function start() { document.querySelectorAll("[data-tabs]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
