/*
 * zoom.js: a button with data-zoom-toggle and aria-controls="<.zoom-through id>" moves the camera
 * in and out. It sets aria-pressed, swaps its label between data-label-in and data-label-out, and
 * keeps the hidden view out of the tab order. The motion itself is all CSS transitions, so reduced
 * motion needs nothing here.
 */
(function () {
  function setup(btn) {
    var scene = document.getElementById(btn.getAttribute("aria-controls"));
    if (!scene) return;
    var front = scene.querySelector(".zoom-front"), back = scene.querySelector(".zoom-back");
    function set(inside) {
      scene.classList.toggle("is-inside", inside);
      btn.setAttribute("aria-pressed", inside);
      var label = btn.getAttribute(inside ? "data-label-out" : "data-label-in");
      if (label) btn.textContent = label;
      if (front) front.inert = inside;
      if (back) back.inert = !inside;
    }
    set(scene.classList.contains("is-inside"));
    btn.addEventListener("click", function () { set(!scene.classList.contains("is-inside")); });
  }
  function start() { document.querySelectorAll("[data-zoom-toggle]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
