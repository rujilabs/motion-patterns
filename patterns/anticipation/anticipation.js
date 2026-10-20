/*
 * anticipation.js (demo only): the Send button winds the plane back, throws it, and marks the
 * message sent when the throw ends. A second click resets the composer.
 * Under reduced motion the plane is already gone, so the message is marked sent at once.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  function setup(card) {
    var btn = card.querySelector("[data-send]");
    var plane = card.querySelector(".antic");
    var label = btn.querySelector("span");
    function sent() {
      card.classList.add("is-sent");
      label.textContent = "Write another";
      btn.disabled = false;
      btn.focus();
    }
    plane.addEventListener("animationend", function (e) {
      if (e.animationName === "antic-go") sent();
    });
    btn.addEventListener("click", function () {
      if (card.classList.contains("is-sent")) {
        card.classList.remove("is-sent");
        plane.classList.remove("is-going");
        label.textContent = "Send";
        return;
      }
      btn.disabled = true;
      plane.classList.add("is-going");
      if (still.matches || getComputedStyle(plane).animationName === "none") sent();
    });
  }
  function start() { document.querySelectorAll("[data-composer]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
