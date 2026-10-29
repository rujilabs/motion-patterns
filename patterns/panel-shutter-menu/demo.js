// Demo only: drops the menu once after the page loads, so the gallery shows it. The menu is shutter.js.
(function () {
  var btn = document.querySelector(".shutter-toggle");
  setTimeout(function () { if (btn.shutter && !btn.shutter.open) btn.shutter.set(true); }, 500);
})();
