/*
 * gooey-nav.js: every .gn-list is a tablist of .gn-tab buttons, each aria-controls its .gn-panel.
 * Left and Right (Up and Down too) move to the next tab and show it, Home and End jump to the ends, a click picks one.
 * The .gn-blob stretches from the old tab to the new one and the .gn-drop elements run after it; the goo
 * filter on .gn-goo joins them. Under reduced motion the blob jumps.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function token(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function setup(list) {
    var tabs = [].slice.call(list.querySelectorAll(".gn-tab"));
    var blob = list.querySelector(".gn-blob");
    var drops = [].slice.call(list.querySelectorAll(".gn-drop"));
    if (!tabs.length || !blob) return;
    var current = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];

    function box(t) { return { l: t.offsetLeft, r: t.offsetLeft + t.offsetWidth }; }
    function rest(b) {
      var t = current.offsetTop, h = current.offsetHeight, dh = Math.round(h * .6);
      blob.style.top = t + "px";
      blob.style.height = h + "px";
      blob.style.transform = "translateX(" + b.l + "px)";
      blob.style.width = (b.r - b.l) + "px";
      drops.forEach(function (d) {
        d.style.top = (t + (h - dh) / 2) + "px";
        d.style.height = d.style.width = dh + "px";
        d.style.transform = "translateX(" + ((b.l + b.r - dh) / 2) + "px)";
      });
    }

    function move(from, to) {
      rest(to);
      if (still.matches) return;
      var dur = parseFloat(token("--dur-base", "600")) || 600, ease = token("--ease-out", "ease-out");
      var right = to.l > from.l;
      // the leading edge gets there first, the trailing edge catches up
      var mid = right ? { l: from.l + (to.l - from.l) * .2, r: to.r } : { l: to.l, r: from.r + (to.r - from.r) * .2 };
      function frame(b) { return { transform: "translateX(" + b.l + "px)", width: (b.r - b.l) + "px" }; }
      var k = [frame(from), frame(mid), frame(to)];
      k[0].easing = k[1].easing = ease;
      k[1].offset = .45;
      blob.animate(k, { duration: dur });
      drops.forEach(function (d, i) {
        var w = d.offsetWidth, a = (from.l + from.r - w) / 2, b = (to.l + to.r - w) / 2;
        d.animate([
          { transform: "translateX(" + a + "px) scale(1)", easing: ease },
          { transform: "translateX(" + (a + (b - a) * .55) + "px) scale(" + (.75 - i * .15) + ")", offset: .6, easing: ease },
          { transform: "translateX(" + b + "px) scale(1)" }
        ], { duration: dur * 1.15, delay: 50 + i * 70, fill: "backwards" });
      });
    }

    function select(tab, focus) {
      if (focus) tab.focus();
      if (tab === current) return;
      var from = box(current);
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute("aria-controls"));
        if (!p) return;
        p.hidden = !on;
        p.classList.toggle("is-in", on && !still.matches);
      });
      current = tab;
      move(from, box(tab));
    }

    list.setAttribute("role", "tablist");
    tabs.forEach(function (t) {
      t.setAttribute("role", "tab");
      t.tabIndex = t === current ? 0 : -1;
      t.addEventListener("click", function () { select(t, false); });
    });
    list.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(current), n = tabs.length, next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % n];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + n) % n];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[n - 1];
      else return;
      e.preventDefault();
      select(next, true);
    });
    rest(box(current));
    list.classList.add("is-ready");
    if ("ResizeObserver" in window) new ResizeObserver(function () { rest(box(current)); }).observe(list);
  }

  function start() { document.querySelectorAll(".gn-list").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
