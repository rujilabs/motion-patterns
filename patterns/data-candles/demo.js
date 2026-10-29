// Demo only: a simulated trading day for a gold savings app. Prices come from a seeded random walk, one
// tick every 5 simulated seconds, so every run shows the same day. Candles are one minute each:
// open = the last minute's close, high and low = the extremes of its ticks, close = its last tick.
(function () {
  var chart = DataCandles(document.getElementById("chart"));
  var slider = document.getElementById("time");
  var clock = document.getElementById("clock");
  var live = document.getElementById("live");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PER_MIN = 12, DAY_MIN = 480, REAL_MS = 250; // a 5 second tick every 250 ms: a candle closes every 3 s

  // the day's prices, 9:00 am to 5:00 pm, from a seeded walk with a little momentum and a pull to 540.20
  var seed = 20261029;
  function rnd() { seed = (seed + 0x6d2b79f5) >>> 0; var t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function gauss() { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var P = [538.40], drift = 0;
  for (var k = 1; k <= DAY_MIN * PER_MIN; k++) {
    drift = 0.3 * drift + 0.052 * gauss() + (540.2 - P[k - 1]) * 0.0012;
    P.push(Math.round((P[k - 1] + drift) * 100) / 100);
  }
  var OPEN = P[30 * PER_MIN]; // the session opens at 9:30 am: RM 537.34

  function hm(min, sec) {
    var h = 9 + Math.floor(min / 60), m = min % 60;
    var s = (h % 12 || 12) + ":" + String(m).padStart(2, "0");
    if (sec !== undefined) s += ":" + String(sec).padStart(2, "0");
    return s + (h < 12 ? " am" : " pm");
  }
  function candleAt(m, upto) {
    var c = { t: hm(m).replace(/ [ap]m$/, ""), o: P[m * PER_MIN], h: -Infinity, l: Infinity, c: 0 };
    if (m % 10 === 0) c.label = c.t;
    for (var k = m * PER_MIN; k <= upto; k++) { c.h = Math.max(c.h, P[k]); c.l = Math.min(c.l, P[k]); }
    c.c = P[upto];
    return c;
  }
  // every candle up to tick k; the last one is still forming
  function candlesAt(k) {
    var m = Math.floor(k / PER_MIN), out = [];
    for (var i = Math.max(0, m - 31); i < m; i++) out.push(candleAt(i, (i + 1) * PER_MIN));
    out.push(candleAt(m, k));
    return out;
  }

  var tick = 90 * PER_MIN; // 10:30:00 am
  var timer = 0;
  var f2 = function (v) { return v.toFixed(2); };
  function show(instant) {
    var cs = candlesAt(tick);
    chart.update(cs, { instant: instant });
    var now = cs[cs.length - 1], diff = now.c - OPEN;
    document.getElementById("price").textContent = f2(now.c);
    var chg = document.getElementById("chg");
    var pct = Math.abs(diff / OPEN * 100).toFixed(2);
    var sign = diff > 0.004 ? "+" : diff < -0.004 ? "\u2212" : "";
    chg.textContent = sign ? sign + f2(Math.abs(diff)) + " (" + sign + pct + "%) since the 9:30 am open" : "Unchanged since the 9:30 am open";
    chg.className = "chg num " + (diff >= 0 ? "up" : "down");
    // the readout shows the forming candle once it has two ticks, before that the candle that just closed
    var forming = tick % PER_MIN >= 1 || cs.length < 2;
    var r = forming ? now : cs[cs.length - 2];
    document.getElementById("o").textContent = f2(r.o);
    document.getElementById("h").textContent = f2(r.h);
    document.getElementById("l").textContent = f2(r.l);
    document.getElementById("c").textContent = f2(r.c);
    document.getElementById("at").textContent = forming ? r.t + " candle, forming" : r.t + " candle, closed";
    var m = Math.floor(tick / PER_MIN), s = (tick % PER_MIN) * 5;
    clock.textContent = hm(m, s);
    slider.setAttribute("aria-valuetext", hm(m));
  }
  function step() {
    if (tick >= DAY_MIN * PER_MIN) { stop(); live.checked = false; return; }
    tick++;
    if (tick % (5 * PER_MIN) === 0) slider.value = tick / PER_MIN;
    show(false);
  }
  function start() { if (!timer) timer = setInterval(step, REAL_MS); }
  function stop() { clearInterval(timer); timer = 0; }

  slider.addEventListener("input", function () {
    tick = +slider.value * PER_MIN;
    show(true);
  });
  live.addEventListener("change", function () {
    if (live.checked) { if (tick >= DAY_MIN * PER_MIN) tick = 30 * PER_MIN; start(); } else stop();
  });

  show(true);
  // reduced motion: the day holds at 10:30 am until the reader turns Live on
  if (reduce.matches) live.checked = false;
  else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); if (live.checked) start(); } }, { threshold: 0.3 });
    io.observe(document.getElementById("chart"));
  } else start();
})();
