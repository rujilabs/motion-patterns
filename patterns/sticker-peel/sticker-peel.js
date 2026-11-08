/*
 * sticker-peel.js: a click (or Enter, Space, a tap) on .sp-sticker peels it fully and keeps it
 * peeled; another click lays it back. aria-expanded follows. Hover and focus peeks are CSS only.
 */
(function () {
  function start() {
    document.querySelectorAll(".sp-sticker").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var open = btn.closest(".sp").classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
