// Demo only: the face buttons turn the box, and the button for the face in front stays pressed.
(function () {
  var pack = document.getElementById("pack");
  var buttons = document.querySelectorAll(".faces button");
  buttons.forEach(function (b) {
    b.addEventListener("click", function () { if (pack.pack) pack.pack.show(b.dataset.face); });
  });
  pack.addEventListener("packface", function (e) {
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.face === e.detail.face)); });
  });
})();
