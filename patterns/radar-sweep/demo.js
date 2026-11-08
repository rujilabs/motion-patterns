/* Demo only: riders around KL Sentral, a search, and the nearest one accepting 3.6 s in. */
(function () {
  var canvas = document.getElementById("radar");
  var state = document.getElementById("state"), seen = document.getElementById("seen");
  var status = document.getElementById("status"), again = document.getElementById("again");
  var title = document.getElementById("ride-h"), seenLine = document.getElementById("seen-line");
  var riders = [
    { x: 0.62, y: -0.48 }, { x: -0.71, y: -0.22 }, { x: 0.26, y: 0.19 }, { x: -0.18, y: 0.77 },
    { x: 0.81, y: 0.31 }, { x: -0.44, y: -0.69 }, { x: 0.08, y: -0.83 }, { x: -0.86, y: 0.38 },
    { x: 0.47, y: 0.71 }, { x: -0.34, y: 0.09 }, { x: 0.91, y: -0.12 }
  ];
  var timer = 0, started = false;

  function go() {
    clearTimeout(timer);
    state.dataset.state = "search"; seen.textContent = "0"; seenLine.hidden = false; again.hidden = true;
    title.textContent = "Finding a rider near you";
    status.textContent = "Finding a rider near you.";
    canvas.radar.search();
    // under reduced motion the arm does not turn, so every rider shows at once
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) seen.textContent = riders.length;
    timer = setTimeout(function () { canvas.radar.found(2); }, 3600);
  }
  function ready() {
    if (!canvas.radar) return setTimeout(ready, 30);
    canvas.radar.set(riders);
    canvas.addEventListener("spot", function (e) { seen.textContent = e.detail.count; });
    canvas.addEventListener("found", function () {
      state.dataset.state = "found";
      title.textContent = "Rider found";
      status.textContent = "Rider found. Faizal is on the way on a blue scooter, WXK 4721, 3 minutes away.";
      again.hidden = false;
    });
    again.addEventListener("click", go);
    if (!("IntersectionObserver" in window)) return go();
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !started) { started = true; io.disconnect(); go(); }
    }, { threshold: 0.4 });
    io.observe(canvas);
  }
  ready();
})();
