document.querySelectorAll("[data-pause]").forEach(function (b) {
  b.addEventListener("click", function () {
    var on = document.documentElement.classList.toggle("motion-paused");
    b.textContent = on ? "Play" : "Pause";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    document.getAnimations().forEach(function (a) { on ? a.pause() : a.play(); });
  });
});
