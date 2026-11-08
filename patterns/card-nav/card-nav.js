/*
 * card-nav.js: every .cn opens and closes from its .cn-toggle button (aria-expanded, aria-controls the panel).
 * Opening from the button moves focus to the first link in the cards. Escape closes and, when focus was in the nav,
 * puts it back on the button; a click outside or Tab out of the nav closes too.
 *   CardNav.open(nav) / CardNav.close(nav)   for a script; these do not move focus
 */
(function () {
  function parts(nav) {
    var btn = nav.querySelector(".cn-toggle");
    return { btn: btn, panel: document.getElementById(btn.getAttribute("aria-controls")) };
  }
  function open(nav, focus) {
    var p = parts(nav);
    nav.classList.add("is-open");
    p.btn.setAttribute("aria-expanded", "true");
    if (focus) {
      var first = p.panel.querySelector("a, button, [tabindex]");
      if (first) first.focus({ preventScroll: true });
    }
  }
  function close(nav, focus) {
    var p = parts(nav);
    if (!nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    p.btn.setAttribute("aria-expanded", "false");
    if (focus) p.btn.focus({ preventScroll: true });
  }

  function setup(nav) {
    var p = parts(nav);
    if (!p.btn || !p.panel) return;
    p.btn.setAttribute("aria-expanded", "false");
    p.panel.querySelectorAll(".cn-card").forEach(function (c, i) { c.style.setProperty("--cn-i", i); });
    p.btn.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) close(nav, false);
      else open(nav, true);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) close(nav, nav.contains(document.activeElement));
    });
    nav.addEventListener("focusout", function (e) {
      if (e.relatedTarget && !nav.contains(e.relatedTarget)) close(nav, false);
    });
    document.addEventListener("pointerdown", function (e) {
      if (!nav.contains(e.target)) close(nav, false);
    });
  }

  window.CardNav = { open: function (nav) { open(nav, false); }, close: function (nav) { close(nav, false); } };

  function start() { document.querySelectorAll(".cn").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
