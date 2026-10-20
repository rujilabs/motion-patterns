/*
 * flip.js: a button with data-flip and aria-controls="<.flip id>" turns that card over.
 * It sets aria-pressed and makes the face turned away inert, so it is skipped by keyboard and
 * screen readers. The turn itself is a CSS transition, so reduced motion needs nothing here.
 */
(function () {
  function setup(btn) {
    var card = document.getElementById(btn.getAttribute("aria-controls"));
    if (!card) return;
    var front = card.querySelector(".flip-front"), back = card.querySelector(".flip-back");
    function set(on) {
      card.classList.toggle("is-flipped", on);
      btn.setAttribute("aria-pressed", on);
      var label = btn.getAttribute(on ? "data-label-on" : "data-label-off");
      if (label) btn.textContent = label;
      if (front) front.inert = on;
      if (back) back.inert = !on;
    }
    set(card.classList.contains("is-flipped"));
    btn.addEventListener("click", function () { set(!card.classList.contains("is-flipped")); });
  }
  function start() { document.querySelectorAll("[data-flip]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
