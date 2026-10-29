// Demo only: plays the assembly again. The figure is tile-image-assemble.js plus style.css.
(function () {
  var hero = document.getElementById("hero");
  var again = document.getElementById("again");
  again.addEventListener("click", function () { if (hero.assemble) hero.assemble(); });
})();
