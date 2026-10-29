// Demo only: an hourly forecast. The hour strip is a slider; each step sets the big icon's condition.
(function () {
  var hours = [
    ["7 am", "sun", 26, "Sunny", 0, "6 km/h W", 28],
    ["9 am", "sun", 29, "Sunny", 5, "9 km/h NE", 33],
    ["11 am", "partly", 31, "Partly cloudy", 10, "14 km/h NE", 37],
    ["1 pm", "cloud", 31, "Cloudy", 35, "18 km/h NE", 36],
    ["3 pm", "rain", 27, "Heavy showers, 6 mm", 80, "22 km/h NE", 30],
    ["5 pm", "rain", 26, "Light rain", 60, "17 km/h NE", 29],
    ["7 pm", "cloud", 25, "Cloudy", 20, "11 km/h E", 27],
    ["9 pm", "moon", 25, "Clear", 5, "8 km/h E", 27]
  ];
  var strip = document.getElementById("strip"), icon = document.getElementById("icon"), now = document.getElementById("now");
  var items = strip.querySelectorAll(".hours li"), $ = function (id) { return document.getElementById(id); };
  var at = -1;

  function show(i) {
    i = Math.max(0, Math.min(hours.length - 1, i));
    if (i === at) return;
    at = i;
    var h = hours[i];
    icon.setAttribute("data-condition", h[1]);
    icon.setAttribute("aria-label", h[3]);
    now.setAttribute("data-condition", h[1]);
    $("n-time").textContent = h[0];
    $("n-temp").textContent = h[2] + "°";
    $("n-cond").textContent = h[3];
    $("n-rain").textContent = h[4] + "%";
    $("n-wind").textContent = h[5];
    $("n-feel").textContent = h[6] + "°";
    strip.style.setProperty("--i", i);
    items.forEach(function (li, j) { li.classList.toggle("on", j === i); });
    strip.setAttribute("aria-valuenow", i);
    strip.setAttribute("aria-valuetext", h[0] + ", " + h[3].toLowerCase() + ", " + h[2] + " degrees, " + h[4] + "% chance of rain");
  }
  function fromX(x) {
    var r = strip.getBoundingClientRect();
    return Math.floor((x - r.left) / r.width * hours.length);
  }
  strip.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    strip.setPointerCapture(e.pointerId);
    show(fromX(e.clientX));
  });
  strip.addEventListener("pointermove", function (e) {
    if (strip.hasPointerCapture(e.pointerId)) show(fromX(e.clientX));
  });
  strip.addEventListener("keydown", function (e) {
    var k = e.key, n = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[k];
    if (n) show(at + n);
    else if (k === "Home") show(0);
    else if (k === "End") show(hours.length - 1);
    else return;
    e.preventDefault();
  });
  show(0);
})();
