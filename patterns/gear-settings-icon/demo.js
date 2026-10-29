// Demo only: opens and closes the settings panel. The cog follows aria-expanded on its own.
(function () {
  var cog = document.getElementById("cog");
  var panel = document.getElementById("settings");
  var close = document.getElementById("close");
  panel.inert = true;
  function set(open) {
    cog.setAttribute("aria-expanded", open ? "true" : "false");
    panel.classList.toggle("open", open);
    panel.inert = !open;
    if (open) close.focus({ preventScroll: true });
  }
  cog.addEventListener("click", function () { set(cog.getAttribute("aria-expanded") !== "true"); });
  close.addEventListener("click", function () { set(false); cog.focus({ preventScroll: true }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && cog.getAttribute("aria-expanded") === "true") { set(false); cog.focus(); }
  });
})();
