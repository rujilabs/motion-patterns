/*
 * hamburger.js: a menu button. Markup: a button.burger with aria-expanded="false" and
 * aria-controls pointing at the menu (.burger-menu). Click toggles it; Esc or a click outside
 * closes it and Esc returns focus to the button. The closed menu is inert, so Tab skips it.
 */
(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(btn) {
    var menu = document.getElementById(btn.getAttribute("aria-controls"));
    if (!menu) return;
    Array.prototype.forEach.call(menu.children, function (el, n) { el.style.setProperty("--i", n); });

    function set(open, back) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.classList.toggle("is-open", open);
      menu.inert = !open;
      if (open) {
        var first = menu.querySelector("a, button");
        // focus lands once the blind has started to open; under reduced motion that is now
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, reduce.matches ? 0 : 120);
      } else if (back) btn.focus();
    }

    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true", false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") set(false, true);
    });
    document.addEventListener("click", function (e) {
      if (btn.getAttribute("aria-expanded") === "true" && !btn.contains(e.target) && !menu.contains(e.target)) set(false, false);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) set(false, true);
    });
    set(false, false);
  }

  function start() { document.querySelectorAll(".burger[aria-controls]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
