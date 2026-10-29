/*
 * wave-pendulum-loader.js: a pendulum wave that swings while results load, and is stilled when they land.
 *   <canvas class="pendulum-wave" data-count="12" data-cycle="24" data-first="20" aria-hidden="true"></canvas>
 *   el.pendulum.start();   // pulls every bob back together and lets go
 *   el.pendulum.land();    // results are in: the swings die away and "settled" fires
 * Real periods, as on the lab machine: in one cycle of data-cycle seconds, pendulum n swings
 * data-first + n times, so its period is cycle / (first + n) and its string is as long as that period
 * squared asks (L = g T^2 / 4 pi^2). Released together, they drift into a travelling wave, then two
 * groups, then back into line at the end of the cycle. We look down on them at 57 degrees, so each
 * swing shows as a rise and fall, and their shadows on the floor draw the same wave.
 * Time comes from Web Animations on the canvas, so the gallery timeline can pause and scrub it;
 * .pause() and .play() do the same from your page.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PITCH = 1.0;          // camera looks down 57 degrees
  var LIFT = 320;           // ms to pull the bobs back before letting go
  var SETTLE = 1000;        // ms for the swings to die away after the results land
  var TAU = 0.22;           // s for a swing to lose 63% of its size once stilled
  var AMP = 0.42;           // release angle, radians (about 24 degrees)

  function setup(canvas) {
    if (canvas.pendulum) return;
    var ctx = canvas.getContext("2d");
    var N = Math.max(3, +canvas.dataset.count || 12);
    var cycle = +canvas.dataset.cycle || 24;
    var first = +canvas.dataset.first || 20;
    var T = [], L = [];
    for (var n = 0; n < N; n++) { T[n] = cycle / (first + n); L[n] = T[n] * T[n] / (T[0] * T[0]); }
    var dims = { w: 0, h: 0 }, colors = {}, lift = null, swing = null, settle = null, landAt = 0, sig = "";
    var cosP = Math.cos(PITCH), sinP = Math.sin(PITCH);

    function readColors() {
      var cs = getComputedStyle(canvas);
      ["--pw-bob", "--pw-bob-light", "--pw-bob-dark", "--pw-string", "--pw-rail", "--pw-shadow"].forEach(function (k) { colors[k] = cs.getPropertyValue(k).trim(); });
      sig = "";
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      dims = { w: r.width, h: r.height };
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sig = "";
    }
    function clock(ms, id, opts) {
      var a = canvas.animate([{ opacity: 1 }, { opacity: 1 }], Object.assign({ duration: ms, fill: "both", easing: "linear" }, opts || {}));
      a.id = id;
      return a;
    }
    function ms(a) { return a && a.currentTime != null ? a.currentTime : null; }

    // the angle of every pendulum now, from the clocks
    function angles() {
      var out = [], lt = ms(lift), st = ms(swing), dt = ms(settle);
      for (var n = 0; n < N; n++) {
        if (st == null || (lift && lt < LIFT)) {
          var k = lt == null ? 0 : Math.min(1, lt / LIFT);
          out.push(AMP * (1 - Math.pow(1 - k, 3)));        // pulled back together, easing into the hold
          continue;
        }
        var t = Math.max(0, st - LIFT) / 1000, env = 1;    // the swing clock starts after the lift
        if (dt != null) env = Math.exp(-(dt / 1000) / TAU) * Math.max(0, 1 - dt / SETTLE);
        out.push(AMP * env * Math.cos(2 * Math.PI * t / T[n]));
      }
      return out;
    }

    function draw(th) {
      var w = dims.w, h = dims.h;
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      var pad = Math.max(18, w * 0.07), gap = (w - 2 * pad) / (N - 1);
      var top = 12;
      var Lpx = (h - 2 * top - 6) / (1.14 * cosP + Math.sin(AMP) * sinP);   // the longest string, fitted so its shadow stays on the canvas
      var floor = Lpx * 1.14;                                // floor depth under the rail
      var f = Lpx * 7;                                        // perspective, used for size only: from this far off the strings stay upright
      var R = Math.min(gap * 0.34, h * 0.06, 13);
      // the rail
      ctx.strokeStyle = colors["--pw-rail"]; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(pad - gap * 0.4, top); ctx.lineTo(w - pad + gap * 0.4, top); ctx.stroke();
      var bobs = [];
      for (var n = 0; n < N; n++) {
        var len = Lpx * L[n], x = pad + gap * n, a = th[n];
        var z = len * Math.sin(a), y = -len * Math.cos(a);     // y up, z toward us
        var down = -y * cosP + z * sinP, toward = z * cosP + y * sinP;
        var sc = f / (f - toward);
        var sDown = floor * cosP + z * sinP, sTow = z * cosP - floor * sinP, ss = f / (f - sTow);
        bobs.push({ x: x, X: x, Y: top + down * sc, r: R * sc, tow: toward,
          SX: x, SY: top + sDown * ss, sr: R * ss, lift: (floor - len * Math.cos(a)) / floor });
      }
      // shadows on the floor: smaller and darker the closer the bob hangs to it
      bobs.forEach(function (b) {
        ctx.globalAlpha = Math.max(0.05, 0.5 - b.lift * 0.9);
        ctx.fillStyle = colors["--pw-shadow"];
        ctx.beginPath(); ctx.ellipse(b.SX, b.SY, b.sr * (1 + b.lift * 0.6), b.sr * (0.42 + b.lift * 0.2), 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      // strings and bobs, the farthest first
      bobs.slice().sort(function (p, q) { return p.tow - q.tow; }).forEach(function (b) {
        ctx.strokeStyle = colors["--pw-string"]; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(b.x, top); ctx.lineTo(b.X, b.Y - b.r * 0.9); ctx.stroke();
        var g = ctx.createRadialGradient(b.X - b.r * 0.38, b.Y - b.r * 0.42, b.r * 0.08, b.X, b.Y, b.r);
        g.addColorStop(0, colors["--pw-bob-light"]); g.addColorStop(0.55, colors["--pw-bob"]); g.addColorStop(1, colors["--pw-bob-dark"]);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.X, b.Y, b.r, 0, Math.PI * 2); ctx.fill();
      });
      // pivots on the rail
      ctx.fillStyle = colors["--pw-rail"];
      for (n = 0; n < N; n++) ctx.fillRect(pad + gap * n - 2.5, top - 1, 5, 5);
    }

    function frame() {
      var th = angles();
      var s = dims.w + "," + th.map(function (a) { return a.toFixed(4); }).join(",");
      if (s !== sig) { sig = s; draw(th); }
      var dt = ms(settle);
      if (settle && dt >= SETTLE && settle.playState === "finished") finish();
      requestAnimationFrame(frame);
    }
    function finish() {
      if (swing) swing.cancel();
      if (lift) lift.cancel();
      if (settle) settle.cancel();
      swing = lift = settle = null;
      canvas.classList.remove("is-swinging");
      sig = "";
      canvas.dispatchEvent(new CustomEvent("settled", { bubbles: true }));
    }

    function start() {
      if (swing) { swing.cancel(); }
      if (settle) { settle.cancel(); settle = null; }
      if (lift) lift.cancel();
      lift = swing = null;
      if (reduce.matches || !canvas.animate) { sig = ""; return; }
      canvas.classList.add("is-swinging");
      lift = clock(LIFT, "bobs pulled back", {});
      swing = clock(cycle * 1000, "pendulum wave", { delay: LIFT, iterations: Infinity, fill: "none" });
    }
    function land() {
      if (!swing || settle) { if (!swing) canvas.dispatchEvent(new CustomEvent("settled", { bubbles: true })); return; }
      if (lift && ms(lift) < LIFT) { finish(); return; }
      settle = clock(SETTLE, "swings die away", {});
    }

    readColors();
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
    canvas.pendulum = {
      start: start,
      land: land,
      pause: function () { [lift, swing, settle].forEach(function (a) { if (a) a.pause(); }); },
      play: function () { [lift, swing, settle].forEach(function (a) { if (a && a.playState === "paused") a.play(); }); }
    };
    canvas.classList.add("is-ready");
    requestAnimationFrame(frame);
  }

  function init() { document.querySelectorAll("canvas.pendulum-wave").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
