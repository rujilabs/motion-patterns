// Demo only: the lamp starts parked over "Panel claims", so the light shows before anyone points at it.
// The pattern itself is light-pointer-spotlight.js.
(function () {
  var grid = document.getElementById("grid");
  var card = document.getElementById("panel");
  function park() {
    var g = grid.getBoundingClientRect(), c = card.getBoundingClientRect();
    grid.spotlight.aim(c.left - g.left + c.width * 0.42, c.top - g.top + c.height * 0.38, true);
  }
  if (grid.spotlight) park();
})();
