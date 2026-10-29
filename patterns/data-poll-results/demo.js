// Demo only: the hall votes on a simulated clock, 3:41:20 pm to 3:43:00 pm, at four simulated seconds
// for every real one. Votes come in bursts from a seeded stream, so every run is the same poll.
// PollResults does the bars, the rounding and your own vote.
(function () {
  var form = document.getElementById("poll");
  var poll = PollResults(form);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var START = [26, 17, 13, 9, 4];
  var WEIGHTS = [0.36, 0.26, 0.18, 0.14, 0.06];
  var OPEN = 41 * 60 + 20, CLOSE = 43 * 60; // seconds after 3:00 pm
  var NAMES = [].map.call(form.querySelectorAll(".pl-name"), function (n) { return n.textContent; });
  var seed, t, timer = 0;
  function rnd() { seed = (seed + 0x6d2b79f5) >>> 0; var x = seed; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }
  function pick() { var r = rnd(), a = 0; for (var i = 0; i < WEIGHTS.length; i++) { a += WEIGHTS[i]; if (r < a) return i; } return 0; }

  var clock = document.getElementById("clock"), left = document.getElementById("left");
  var live = document.getElementById("live"), again = document.getElementById("again");
  var said = document.getElementById("said");
  function hms(s) { return "3:" + String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0") + " pm"; }
  function showTime() {
    clock.textContent = hms(t);
    var r = Math.max(0, CLOSE - t);
    left.textContent = r ? "Closes 3:43 pm, " + Math.floor(r / 60) + ":" + String(r % 60).padStart(2, "0") + " left" : "Closed at 3:43 pm";
  }
  form.addEventListener("poll:change", function (e) { document.getElementById("total").textContent = e.detail.total; });
  form.addEventListener("change", function () {
    var c = poll.counts(), p = PollResults.percents(c), lead = c.indexOf(Math.max.apply(null, c));
    said.textContent = "Your vote is in. " + NAMES[lead] + " leads with " + p[lead] + "%.";
  });

  function step() {
    t = Math.min(CLOSE, t + 3);
    // a burst of 0 to 4 votes every 3 simulated seconds, thinning out as the poll nears its close
    var n = Math.floor(rnd() * (t < CLOSE - 30 ? 5 : 3));
    var add = [0, 0, 0, 0, 0];
    for (var k = 0; k < n; k++) add[pick()]++;
    var c = poll.counts();
    if (n) poll.set(c.map(function (v, i) { return v + add[i]; }));
    showTime();
    if (t >= CLOSE) close();
  }
  function close() {
    stop();
    live.checked = false;
    live.disabled = true;
    form.querySelectorAll("input").forEach(function (i) { i.disabled = true; });
    form.classList.add("is-closed");
    var c = poll.counts(), p = PollResults.percents(c), lead = c.indexOf(Math.max.apply(null, c));
    document.getElementById("state").textContent = "Poll closed";
    said.textContent = "Poll closed. " + NAMES[lead] + " won with " + p[lead] + "%.";
    again.hidden = false;
  }
  function start() { if (!timer && t < CLOSE) timer = setInterval(step, 750); }
  function stop() { clearInterval(timer); timer = 0; }
  function reset() {
    seed = 7340; t = OPEN;
    poll.clear();
    poll.set(START);
    form.classList.remove("is-closed");
    form.querySelectorAll("input").forEach(function (i) { i.disabled = false; });
    live.disabled = false;
    document.getElementById("state").textContent = "Poll open";
    said.textContent = "";
    again.hidden = true;
    showTime();
  }
  live.addEventListener("change", function () { if (live.checked) start(); else stop(); });
  again.addEventListener("click", function () { reset(); live.checked = true; start(); form.querySelector("input").focus(); });

  reset();
  // reduced motion: the votes hold until the reader turns Live votes on
  if (reduce.matches) live.checked = false;
  else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); if (live.checked) start(); } }, { threshold: 0.3 });
    io.observe(form);
  } else start();
})();
