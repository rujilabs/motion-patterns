/*
 * glass-icons.js: every button.glass-icon toggles aria-pressed on click (Enter and Space come free with a
 * button) and fires a "change" event so the page can act on it. The look is all in style.css.
 */
(function () {
  function setup(btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  function start() { document.querySelectorAll("button.glass-icon").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
