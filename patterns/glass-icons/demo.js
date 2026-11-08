// Demo only: adds up the power of what is switched on and says what changed.
(function () {
  var grid = document.getElementById("gl-grid");
  var total = document.getElementById("gl-total");
  var count = document.getElementById("gl-count");
  var say = document.getElementById("gl-say");
  function sum() {
    var kw = 0, n = 0;
    grid.querySelectorAll(".glass-icon").forEach(function (b) {
      var on = b.getAttribute("aria-pressed") === "true";
      b.querySelector(".gl-state").textContent = on ? b.dataset.onText : "Off";
      if (on) { kw += +b.dataset.kw; n++; }
    });
    total.textContent = kw.toFixed(2) + " kW";
    count.textContent = n + " of 6 on";
    return [n, kw];
  }
  grid.addEventListener("change", function (e) {
    var r = sum(), b = e.target;
    say.textContent = b.querySelector(".gl-name").textContent + (b.getAttribute("aria-pressed") === "true" ? " on. " : " off. ") +
      r[0] + " of 6 on, " + r[1].toFixed(2) + " kW.";
  });
  sum();
})();
