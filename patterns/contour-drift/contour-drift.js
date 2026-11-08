/*
 * contour-drift.js: in every .contour-drift, contour lines of a made-up hillside on its .cd-canvas,
 * drifting slowly as the hills shift. The height map is a few soft hills, each moving on a small loop
 * that comes round a whole number of times in one cycle (data-cycle seconds, default 120), so the drift
 * never jumps. Lines are traced with marching squares on a coarse grid, about 25 times a second, and
 * every fifth line is an index contour, drawn heavier, as on a survey map.
 * Time runs on a Web Animation ("contour drift"), so the gallery timeline can pause and scrub it.
 * A button[data-pause] inside the element pauses and plays it. Stops off screen and in a hidden tab.
 * Under reduced motion the lines are drawn once and stay put.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var CELL = 10, STEP = 40, LEVELS = 22, GAP = 0.055;
  // x, y, height, spread, loop size x, loop size y, loops per cycle, phase (x, y and spread are shares of the long side)
  var HILLS = [
    [0.72, 0.30, 1.00, 0.16, 0.05, 0.03, 1, 0.0],
    [0.30, 0.68, 0.72, 0.13, 0.04, 0.05, 2, 1.7],
    [0.95, 0.80, 0.55, 0.11, 0.03, 0.04, 1, 3.1],
    [0.18, 0.18, 0.48, 0.12, 0.05, 0.03, 3, 4.4],
    [0.52, 0.55, -0.35, 0.10, 0.06, 0.04, 2, 2.2]
  ];
  var SEGS = [[], [3, 2], [2, 1], [3, 1], [0, 1], [0, 1, 3, 2], [0, 2], [3, 0], [3, 0], [0, 2], [3, 0, 2, 1], [0, 1], [3, 1], [2, 1], [3, 2], []];

  function setup(root) {
    var canvas = root.querySelector(".cd-canvas");
    if (!canvas || canvas.contours) return;
    var ctx = canvas.getContext("2d");
    var btn = root.querySelector("button[data-pause]");
    var cycle = (+root.dataset.cycle || 120) * 1000;
    var W = 0, H = 0, cols = 0, rows = 0, val, lo, hi, hx = new Float32Array(5), hy = new Float32Array(5);
    var line = "#d9cfb8", index = "#b3a37c", clock = null, raf = 0, last = -1, onScreen = false, paused = false;

    function read() {
      var cs = getComputedStyle(root);
      line = cs.getPropertyValue("--cd-line").trim() || line;
      index = cs.getPropertyValue("--cd-index").trim() || index;
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      read();
      cols = Math.max(2, Math.ceil(W / CELL)); rows = Math.max(2, Math.ceil(H / CELL));
      val = new Float32Array((cols + 1) * (rows + 1)); lo = new Float32Array(cols * rows); hi = new Float32Array(cols * rows);
      render(clock ? (clock.currentTime || 0) : 0);
      wake();
    }

    function field(t) {
      var S = Math.max(W, H), ph = t / cycle * Math.PI * 2, k, i, j;
      for (k = 0; k < 5; k++) {
        var h = HILLS[k];
        hx[k] = (h[0] + h[4] * Math.cos(h[6] * ph + h[7])) * S;
        hy[k] = (h[1] + h[5] * Math.sin(h[6] * ph + h[7])) * S;
      }
      for (j = 0; j <= rows; j++) {
        var y = j * CELL;
        for (i = 0; i <= cols; i++) {
          // a gentle warp so the hills read as land, not targets
          var x = i * CELL, wx = x + 0.035 * S * Math.sin(y / S * 6.3 + ph), wy = y + 0.03 * S * Math.cos(x / S * 5.1 - ph);
          var v = 0.12 + 0.18 * y / S;
          for (k = 0; k < 5; k++) {
            var dx = wx - hx[k], dy = wy - hy[k], s = HILLS[k][3] * S;
            v += HILLS[k][2] * Math.exp(-(dx * dx + dy * dy) / (2 * s * s));
          }
          val[j * (cols + 1) + i] = v;
        }
      }
      for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
        var p = j * (cols + 1) + i, a = val[p], b = val[p + 1], c = val[p + cols + 2], d = val[p + cols + 1];
        lo[j * cols + i] = Math.min(a, b, c, d); hi[j * cols + i] = Math.max(a, b, c, d);
      }
    }

    function trace(heavy) {
      ctx.beginPath();
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var q = j * cols + i, first = Math.ceil(lo[q] / GAP), lastL = Math.floor(hi[q] / GAP);
        if (first > lastL) continue;
        var p = j * (cols + 1) + i, a = val[p], b = val[p + 1], c = val[p + cols + 2], d = val[p + cols + 1];
        var x0 = i * CELL, y0 = j * CELL;
        for (var n = Math.max(1, first); n <= Math.min(LEVELS, lastL); n++) {
          if ((n % 5 === 0) !== heavy) continue;
          var L = n * GAP;
          var code = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0), seg = SEGS[code];
          for (var s = 0; s < seg.length; s += 2) {
            for (var e = 0; e < 2; e++) {
              var edge = seg[s + e], x, y;
              if (edge === 0) { x = x0 + CELL * (L - a) / (b - a); y = y0; }
              else if (edge === 1) { x = x0 + CELL; y = y0 + CELL * (L - b) / (c - b); }
              else if (edge === 2) { x = x0 + CELL * (L - d) / (c - d); y = y0 + CELL; }
              else { x = x0; y = y0 + CELL * (L - a) / (d - a); }
              if (e) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            }
          }
        }
      }
      ctx.strokeStyle = heavy ? index : line;
      ctx.lineWidth = heavy ? 1.6 : 1;
      ctx.stroke();
    }

    function render(t) {
      if (!W || !H) return;
      field(t);
      ctx.clearRect(0, 0, W, H);
      trace(false);
      trace(true);
    }

    function live() { return onScreen && !document.hidden && !paused && !reduce.matches; }
    function wake() {
      if (!live()) { if (clock && clock.playState === "running") clock.pause(); return; }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: cycle, iterations: Infinity });
        clock.id = "contour drift";
      }
      if (clock && clock.playState === "paused") clock.play();
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function frame() {
      raf = 0;
      if (!clock || !live()) return;
      var t = clock.currentTime || 0;
      if (Math.abs(t - last) >= STEP) { last = t; render(t % cycle); }
      raf = requestAnimationFrame(frame);
    }
    function setPaused(p) {
      paused = p;
      if (btn) { btn.setAttribute("aria-pressed", p ? "true" : "false"); btn.textContent = p ? "Play map" : "Pause map"; }
      if (p) { if (clock) clock.pause(); } else wake();
    }

    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; wake(); }).observe(root);
    } else onScreen = true;
    document.addEventListener("visibilitychange", wake);
    reduce.addEventListener("change", function () { if (btn) btn.hidden = reduce.matches; if (reduce.matches && clock) clock.pause(); wake(); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { read(); last = -1; render(clock ? (clock.currentTime || 0) % cycle : 0); });

    if (btn) btn.hidden = reduce.matches;
    canvas.classList.add("is-live");
    canvas.contours = { pause: function () { setPaused(true); }, play: function () { setPaused(false); } };
    fit();
  }

  function init() { document.querySelectorAll(".contour-drift").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
