/* Starts flat, lifts after a beat, then the button toggles it. */
(function () {
  var card = document.querySelector(".fb-card"), b = document.querySelector("[data-toggle]");
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function set(out) { card.classList.toggle("is-out", out); b.textContent = out ? "Put back" : "Lift out"; b.setAttribute("aria-pressed", out ? "true" : "false"); }
  b.addEventListener("click", function () { set(!card.classList.contains("is-out")); });
  if (!calm) { set(false); setTimeout(function () { set(true); }, 700); }
})();
