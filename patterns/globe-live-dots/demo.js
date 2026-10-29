// Demo only: a simulated evening of visitors. People browse at lunch and most in the evening, local time,
// so each place's count follows its own clock. Moving the hour calls globe.set() with the new counts.
(function () {
  var globe = document.getElementById("globe");
  var slider = document.getElementById("hour");
  var out = document.getElementById("hour-out");
  var live = document.getElementById("live");
  var MYT = 8;
  // [label, lon, lat, UTC offset, how many readers live there]
  var PLACES = [
    ["Kuala Lumpur", 101.69, 3.14, 8, 64], ["Singapore", 103.82, 1.35, 8, 38], ["Manila", 120.98, 14.6, 8, 26],
    ["Jakarta", 106.85, -6.2, 7, 22], ["Sydney", 151.21, -33.87, 11, 21], ["Melbourne", 144.96, -37.81, 11, 18],
    ["Hong Kong", 114.17, 22.32, 8, 17], ["Mumbai", 72.88, 19.08, 5.5, 15], ["Bangkok", 100.5, 13.76, 7, 14],
    ["Delhi", 77.21, 28.61, 5.5, 12], ["Tokyo", 139.69, 35.68, 9, 11], ["Ho Chi Minh City", 106.66, 10.76, 7, 9],
    ["Perth", 115.86, -31.95, 8, 9], ["Taipei", 121.56, 25.03, 8, 8], ["Dubai", 55.27, 25.2, 4, 8],
    ["Seoul", 126.98, 37.57, 9, 7], ["Auckland", 174.76, -36.85, 13, 6], ["London", -0.13, 51.5, 0, 10],
    ["Los Angeles", -118.24, 34.05, -7, 7]
  ];
  function gauss(x, m, s) { return Math.exp(-((x - m) * (x - m)) / (2 * s * s)); }
  function busy(h) {
    // a small lunch bump, a big evening peak, almost nobody before dawn
    var d = Math.min(Math.abs(h - 21.5), 24 - Math.abs(h - 21.5));
    var l = Math.min(Math.abs(h - 13), 24 - Math.abs(h - 13));
    return 0.06 + 0.42 * gauss(l, 0, 1.8) + 0.94 * gauss(d, 0, 2.1);
  }
  function label(h) { return (h % 12 || 12) + ":00 " + (h < 12 ? "am" : "pm"); }

  function update() {
    var myt = +slider.value, utc = (myt - MYT + 24) % 24;
    var data = PLACES.map(function (p) {
      var local = (utc + p[3] + 24) % 24;
      return { label: p[0], lon: p[1], lat: p[2], count: Math.round(p[4] * busy(local)) };
    });
    globe.globe.set(data);
    var total = data.reduce(function (s, d) { return s + d.count; }, 0);
    var top = data.slice().sort(function (a, b) { return b.count - a.count; });
    out.textContent = label(myt);
    slider.setAttribute("aria-valuetext", label(myt) + " in Kuala Lumpur");
    document.getElementById("total").textContent = total;
    var rows = document.querySelectorAll("#top li");
    rows.forEach(function (li, i) {
      li.querySelector(".where").textContent = top[i].label;
      li.querySelector(".n").textContent = top[i].count;
      li.querySelector(".bar").style.setProperty("--share", (top[i].count / top[0].count).toFixed(3));
    });
    var far = data.filter(function (d) { return d.label === "London" || d.label === "Los Angeles"; }).reduce(function (s, d) { return s + d.count; }, 0);
    document.getElementById("far").textContent = far;
  }
  slider.addEventListener("input", update);
  live.addEventListener("change", function () { if (live.checked) globe.globe.play(); else globe.globe.pause(); });
  update();
})();
