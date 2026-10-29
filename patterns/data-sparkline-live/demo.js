// Demo only: four servers, one CPU reading a second on a simulated clock that starts at 2:31:55 pm.
// Readings come from a seeded walk, so every run is the same: db-01 ran a backup snapshot at 2:31:05,
// and at 2:32:00 worker-01 starts the evening invoice batch and crosses the 85% line for about 25 s.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var START = 115; // seconds after 2:30:00 pm
  var HOSTS = [
    { base: 33, noise: 4.4, events: [[150, 175, 21]] },          // web-01: the 6 pm booking rush begins
    { base: 40, noise: 3.2, events: [[152, 177, 18]] },          // web-02
    { base: 23, noise: 2.4, events: [[65, 92, 39]] },            // db-01: backup snapshot
    { base: 27, noise: 3.4, events: [[120, 146, 63]] }           // worker-01: invoice batch
  ];
  var seed = 5281;
  function rnd() { seed = (seed + 0x6d2b79f5) >>> 0; var t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function gauss() { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function ramp(s, a, b) { var t = Math.min(1, Math.max(0, (s - a) / (b - a))); return t * t * (3 - 2 * t); }
  function reading(h, s) {
    h.x = 0.78 * (h.x || 0) + h.noise * gauss();
    var bump = 0;
    h.events.forEach(function (e) { bump += e[2] * ramp(s, e[0], e[0] + 4) * (1 - ramp(s, e[1] - 5, e[1])); });
    return Math.round(Math.min(99, Math.max(2, h.base + h.x + bump)) * 10) / 10;
  }

  var sparks = HOSTS.map(function (h, i) { return SparkLive(document.getElementById("s" + i)); });
  var nows = HOSTS.map(function (h, i) { return document.getElementById("n" + i); });
  var rows = document.querySelectorAll(".host");
  var s = START - 60;
  var hist = HOSTS.map(function () { return []; });
  for (; s <= START; s++) HOSTS.forEach(function (h, i) { hist[i].push(reading(h, s)); });
  s = START;
  HOSTS.forEach(function (h, i) { sparks[i].fill(hist[i]); });

  var clock = document.getElementById("clock");
  var summary = document.getElementById("summary");
  var lastOver = -1;
  function time(sec) {
    var m = 30 + Math.floor(sec / 60), ss = sec % 60;
    if (m >= 60) return "3:" + String(m - 60).padStart(2, "0") + ":" + String(ss).padStart(2, "0") + " pm";
    return "2:" + String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0") + " pm";
  }
  function show(vals) {
    var over = 0;
    vals.forEach(function (v, i) {
      nows[i].textContent = Math.round(v);
      var hot = v > 85;
      rows[i].classList.toggle("is-over", hot);
      if (hot) over++;
    });
    clock.textContent = time(s);
    if (over !== lastOver) {
      lastOver = over;
      summary.textContent = over ? over + " of 4 servers over 85%" : "All 4 servers under 85%";
      summary.classList.toggle("is-over", over > 0);
    }
  }
  show(hist.map(function (h) { return h[h.length - 1]; }));

  var timer = 0;
  function tick() {
    s++;
    var vals = HOSTS.map(function (h, i) { var v = reading(h, s); sparks[i].push(v); return v; });
    show(vals);
  }
  function start() { if (!timer) timer = setInterval(tick, 1000); }
  function stop() { clearInterval(timer); timer = 0; }
  var live = document.getElementById("live");
  live.addEventListener("change", function () { if (live.checked) start(); else stop(); });

  // reduced motion: the board holds at 2:31:55 pm until the reader turns Live on
  if (reduce.matches) live.checked = false;
  else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); if (live.checked) { tick(); start(); } } }, { threshold: 0.3 });
    io.observe(document.querySelector(".hosts"));
  } else start();
})();
