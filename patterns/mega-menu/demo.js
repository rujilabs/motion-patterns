/* Demo only: opens the first section once on load, so the panel is seen dropping. */
(function () {
  setTimeout(function () {
    var first = document.querySelector(".mega button[aria-controls]");
    if (first && first.getAttribute("aria-expanded") === "false") first.click();
  }, 500);
})();
