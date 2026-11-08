/*
 * bubble-menu.js: every .bm opens and closes from its .bm-toggle (aria-expanded, aria-controls the .bm-list).
 * It measures where each .bm-bubble sits when open and writes the way back to the button as --bm-x / --bm-y,
 * so the bubbles grow out of the button wherever it is. Opening from the button focuses the first bubble;
 * Escape closes and puts focus back on the button; a tap on the wash or Tab out of the menu closes it too.
 *   BubbleMenu.open(menu) / BubbleMenu.close(menu)   for a script; these do not move focus
 */
(function () {
  function parts(menu) {
    var btn = menu.querySelector(".bm-toggle");
    return { btn: btn, list: document.getElementById(btn.getAttribute("aria-controls")) };
  }

  // offsets ignore transforms, so this reads the open layout even while the bubbles sit on the button
  function measure(menu) {
    var p = parts(menu), lr = p.list.getBoundingClientRect(), br = p.btn.getBoundingClientRect();
    var ox = br.left + br.width / 2 - lr.left, oy = br.top + br.height / 2 - lr.top;
    p.list.style.setProperty("--bm-ox", ox.toFixed(1) + "px");
    p.list.style.setProperty("--bm-oy", oy.toFixed(1) + "px");
    p.list.querySelectorAll(".bm-bubble").forEach(function (b, i) {
      var x = 0, y = 0, el = b;
      while (el && el !== p.list) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
      b.style.setProperty("--bm-x", (ox - x - b.offsetWidth / 2).toFixed(1) + "px");
      b.style.setProperty("--bm-y", (oy - y - b.offsetHeight / 2).toFixed(1) + "px");
      b.style.setProperty("--bm-i", i);
    });
  }

  function open(menu, focus) {
    var p = parts(menu);
    measure(menu);
    menu.classList.add("is-open");
    p.btn.setAttribute("aria-expanded", "true");
    if (focus) {
      var first = p.list.querySelector(".bm-bubble");
      if (first) first.focus({ preventScroll: true });
    }
  }
  function close(menu, focus) {
    var p = parts(menu);
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    p.btn.setAttribute("aria-expanded", "false");
    if (focus) p.btn.focus({ preventScroll: true });
  }

  function setup(menu) {
    var p = parts(menu);
    if (!p.btn || !p.list) return;
    p.btn.setAttribute("aria-expanded", "false");
    measure(menu);
    if ("ResizeObserver" in window) new ResizeObserver(function () { measure(menu); }).observe(p.list);
    p.btn.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) close(menu, false);
      else open(menu, true);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) close(menu, menu.contains(document.activeElement));
    });
    menu.addEventListener("focusout", function (e) {
      if (e.relatedTarget && !menu.contains(e.relatedTarget)) close(menu, false);
    });
    document.addEventListener("pointerdown", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (!menu.contains(e.target) || (!e.target.closest(".bm-bubble") && !e.target.closest(".bm-toggle"))) close(menu, false);
    });
  }

  window.BubbleMenu = { open: function (m) { open(m, false); }, close: function (m) { close(m, false); } };

  function start() { document.querySelectorAll(".bm").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
