// Demo only: the pause button stops and starts the turn.
(function () {
  var globe = document.getElementById("globe");
  var btn = document.getElementById("pause");
  btn.addEventListener("click", function () {
    var g = globe.globe;
    if (!g) return;
    var paused = btn.getAttribute("aria-pressed") === "true";
    if (paused) g.play(); else g.pause();
    btn.setAttribute("aria-pressed", String(!paused));
    btn.textContent = paused ? "Pause" : "Play";
  });
})();
