/*
 * dropdown.js: menu buttons. Markup: .dropdown holding a button (aria-haspopup="menu",
 * aria-controls) and a .dropdown-menu (role="menu") of role="menuitem" or "menuitemradio" items.
 * Opens on click, Enter, Space or ArrowDown; arrows, Home and End move inside; Esc closes and
 * returns focus; Tab or a click outside closes. Before opening it checks the room around the
 * button and opens up instead of down, or right-aligned instead of left, when it would not fit,
 * so the unfold always grows out of the corner next to the button.
 * A menu with data-pick updates the button's [data-label] to the chosen item.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(root) {
    var btn = root.querySelector('[aria-haspopup]');
    var menu = root.querySelector(".dropdown-menu");
    var items = Array.prototype.slice.call(menu.querySelectorAll('[role^="menuitem"]'));
    items.forEach(function (it, n) {
      it.tabIndex = -1;
      it.style.setProperty("--i", n);
    });

    function place() {
      var b = btn.getBoundingClientRect();
      var h = menu.offsetHeight + 12, w = menu.offsetWidth + 12;
      var below = window.innerHeight - b.bottom, above = b.top;
      root.dataset.side = below < h && above > below ? "top" : "bottom";
      root.dataset.align = b.left + w > window.innerWidth && b.right - w >= 0 ? "end" : "start";
    }

    function open(focusAt) {
      if (root.classList.contains("is-open")) return;
      place();
      root.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      var i = focusAt === "last" ? items.length - 1 : Math.max(0, items.findIndex(function (it) { return it.getAttribute("aria-checked") === "true"; }));
      // the focus lands once the item is visible; under reduced motion that is now
      if (reduce.matches) items[i].focus();
      else requestAnimationFrame(function () { items[i].focus(); });
    }

    function close(back) {
      if (!root.classList.contains("is-open")) return;
      root.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      if (back) btn.focus();
    }

    function pick(it) {
      if (menu.hasAttribute("data-pick")) {
        items.forEach(function (x) { x.setAttribute("aria-checked", x === it ? "true" : "false"); });
        var label = btn.querySelector("[data-label]");
        if (label) label.textContent = it.textContent.trim();
      }
      close(true);
    }

    btn.addEventListener("click", function () {
      root.classList.contains("is-open") ? close(false) : open();
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open(); }
      if (e.key === "ArrowUp") { e.preventDefault(); open("last"); }
    });
    menu.addEventListener("click", function (e) {
      var it = e.target.closest('[role^="menuitem"]');
      if (it) pick(it);
    });
    menu.addEventListener("keydown", function (e) {
      var i = items.indexOf(document.activeElement);
      var n = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 }[e.key];
      if (n !== undefined) { e.preventDefault(); items[(n + items.length) % items.length].focus(); return; }
      if (e.key === "Escape") { e.preventDefault(); close(true); }
      if (e.key === "Tab") close(false);
      if ((e.key === "Enter" || e.key === " ") && i >= 0) { e.preventDefault(); pick(items[i]); }
    });
    document.addEventListener("pointerdown", function (e) {
      if (!root.contains(e.target)) close(false);
    });
    // pick a side now too, so a closed menu never hangs past the edge of the page
    place();
    window.addEventListener("resize", function () { if (!root.classList.contains("is-open")) place(); });
  }

  function start() { document.querySelectorAll(".dropdown").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
