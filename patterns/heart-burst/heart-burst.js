/*
 * heart-burst.js: every .hb button toggles aria-pressed on click and plays one burst (save) or one
 * quiet shrink (unsave). It fires a "change" event on the button so the page can save the state.
 */
(function () {
  function setup(btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.remove("is-burst", "is-unsave");
      void btn.offsetWidth;
      btn.classList.add(on ? "is-burst" : "is-unsave");
      btn.dispatchEvent(new Event("change", { bubbles: true }));
    });
    btn.addEventListener("animationend", function (e) {
      if (e.target.classList.contains("hb-heart")) btn.classList.remove("is-unsave");
    });
  }
  function start() { document.querySelectorAll(".hb").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
