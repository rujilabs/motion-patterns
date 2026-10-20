/*
 * morph.js: turns each [data-morph] button into a toggle. A click flips aria-pressed, and the CSS
 * morphs the icon to match. The label stays the same ("Play"); the pressed state is what changes,
 * which is how screen readers expect a toggle button to work.
 * No motion runs from here: under reduced motion the CSS swaps the icon at once.
 */
(function () {
  function setup(btn) {
    if (!btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
    });
  }
  function start() { document.querySelectorAll("[data-morph]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
