// Demo only: the slider sets data-utc on the globe; the globe's "globe:time" event keeps the slider and the desks in step.
(function () {
  var globe = document.getElementById("globe");
  var slider = document.getElementById("hour");
  var out = document.getElementById("hour-out");
  var btn = document.getElementById("sweep");
  var rows = Array.prototype.slice.call(document.querySelectorAll("#cities li"));
  var KL = 8;

  function clock(h) {
    h = ((h % 24) + 24) % 24;
    var mins = Math.round(h * 60) % 1440, hh = Math.floor(mins / 60), mm = mins % 60;
    return (hh % 12 || 12) + ":" + (mm < 10 ? "0" : "") + mm + (hh < 12 ? " am" : " pm");
  }
  function show(utc) {
    var kl = (utc + KL) % 24;
    out.textContent = clock(kl);
    slider.value = Math.round(kl * 4) % 96;
    var u = Math.round(utc * 60) % 1440;
    slider.setAttribute("aria-valuetext", clock(kl) + " in Kuala Lumpur, " + String(Math.floor(u / 60)).padStart(2, "0") + ":" + String(u % 60).padStart(2, "0") + " UTC");
    rows.forEach(function (li) {
      var local = (((utc + +li.dataset.tz) % 24) + 24) % 24;
      li.querySelector(".local").textContent = clock(local);
      var open = local >= 8 && local < 22;
      li.classList.toggle("is-open", open);
      li.querySelector(".state").textContent = open ? "Open" : "Closed";
    });
  }

  slider.addEventListener("input", function () {
    var utc = ((slider.value / 4 - KL) % 24 + 24) % 24;
    globe.globe.setUtc(utc);
    show(utc);
  });
  globe.addEventListener("globe:time", function (e) { show(e.detail.utc); });
  globe.addEventListener("globe:sweepend", function () { btn.setAttribute("aria-pressed", "false"); btn.textContent = "Play the day"; });
  btn.addEventListener("click", function () {
    if (globe.globe.playing()) { globe.globe.pause(); return; }
    globe.globe.play();
    btn.setAttribute("aria-pressed", "true");
    btn.textContent = "Pause";
  });
  show(+globe.dataset.utc);
})();
