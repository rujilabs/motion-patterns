// Demo only: the button replays every flight.
(function () {
  document.getElementById("again").addEventListener("click", function () {
    var g = document.getElementById("globe").globe;
    if (g) g.play();
  });
})();
