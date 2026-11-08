/*
 * radar-sweep.js: a radar on every canvas.rs-canvas. While searching, an arm sweeps round from north
 * (one turn every data-period ms, default 2200) and lights the points it passes; each glow fades over
 * 0.9 s and the point stays faintly marked once seen. found(i) lets the arm run on until it reaches
 * point i, then stops there: the other points fade, a line draws from the centre to it and it rings
 * twice. Then "found" fires. A "spot" event fires each time the arm sees a point for the first time.
 *   canvas.radar.set([{ x: 0.21, y: -0.24 }, ...]);  // x, y from -1 to 1, the edge of the disc is 1
 *   canvas.radar.search();
 *   canvas.radar.found(3);
 * Time runs on Web Animations ("radar sweep", "rider found"), so the gallery timeline can pause it.
 * A button[data-pause] in the closest .radar pauses and plays it. The loop stops off screen and in a
 * hidden tab. Under reduced motion nothing turns: every point shows faintly, then found() draws the end.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TAU = Math.PI * 2, START = -Math.PI / 2, GLOW = 900, FOUND = 1600, TRAIL = 1.2;

  function setup(canvas) {
    if (canvas.radar) return;
    var ctx = canvas.getContext("2d");
    var host = canvas.closest(".radar") || canvas.parentNode;
    var btn = host.querySelector("button[data-pause]");
    var base = document.createElement("canvas"), bx = base.getContext("2d");
    var period = +canvas.dataset.period || 2200;
    var rings = (canvas.dataset.rings || "").split(",");
    var W = 0, cx = 0, R = 0, dpr = 1, colors = {}, cone = null;
    var pts = [], seen = [], seenCount = 0, mode = "idle", target = -1, stopAt = -1;
    var sweep = null, ring = null, onScreen = false, raf = 0, paused = false;

    function read() {
      var cs = getComputedStyle(canvas);
      ["--rs-disc", "--rs-ring", "--rs-label", "--rs-sweep", "--rs-found", "--rs-you"].forEach(function (k) { colors[k] = cs.getPropertyValue(k).trim(); });
    }
    function fit() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.min(r.width, r.height); cx = W / 2; R = W / 2 - 2;
      canvas.width = base.width = Math.round(W * dpr); canvas.height = base.height = Math.round(W * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); bx.setTransform(dpr, 0, 0, dpr, 0, 0);
      read();
      // the still parts, drawn once: disc, rings with their distances, cross hairs
      bx.clearRect(0, 0, W, W);
      bx.fillStyle = colors["--rs-disc"];
      bx.beginPath(); bx.arc(cx, cx, R, 0, TAU); bx.fill();
      bx.strokeStyle = colors["--rs-ring"]; bx.lineWidth = 1;
      bx.beginPath();
      for (var k = 1; k <= 3; k++) { bx.moveTo(cx + R * k / 3, cx); bx.arc(cx, cx, R * k / 3, 0, TAU); }
      bx.moveTo(cx - R, cx); bx.lineTo(cx + R, cx); bx.moveTo(cx, cx - R); bx.lineTo(cx, cx + R);
      bx.stroke();
      bx.fillStyle = colors["--rs-label"]; bx.font = "500 " + Math.max(10, W * 0.032) + "px system-ui, sans-serif";
      bx.textBaseline = "bottom"; bx.textAlign = "right";
      for (k = 0; k < 3; k++) if (rings[k]) bx.fillText(rings[k].trim(), cx + R * (k + 1) / 3 - 4, cx - 3);
      // the trailing glow of the arm: a conic gradient made once at the origin, turned each frame
      cone = null;
      if (ctx.createConicGradient) {
        cone = ctx.createConicGradient(-TRAIL, 0, 0);
        cone.addColorStop(0, "rgba(0,0,0,0)");
        cone.addColorStop(TRAIL / TAU, colors["--rs-sweep"]);
        cone.addColorStop(TRAIL / TAU + 0.001, "rgba(0,0,0,0)");
      }
      draw();
    }

    function clock(ms, id, opts) {
      var a = canvas.animate([{ opacity: 1 }, { opacity: 1 }], Object.assign({ duration: ms, easing: "linear" }, opts || {}));
      a.id = id;
      return a;
    }
    function now(a) { return a && a.currentTime != null ? a.currentTime : 0; }
    function rel(p) { var a = Math.atan2(p.y, p.x) - START; return ((a % TAU) + TAU) % TAU; }

    function draw() {
      if (!W) return;
      ctx.clearRect(0, 0, W, W);
      ctx.drawImage(base, 0, 0, W, W);
      var t = mode === "search" ? now(sweep) : stopAt, swept = t / period * TAU;
      var f = mode === "found" ? Math.min(1, now(ring) / FOUND) : mode === "done" ? 1 : 0;
      if (reduce.matches) swept = -1;
      // the arm and its glow
      if ((mode === "search" || (mode === "found" && f < 0.5)) && swept >= 0) {
        ctx.save();
        ctx.translate(cx, cx); ctx.rotate(START + swept);
        ctx.globalAlpha = 0.32 * (1 - f * 2);
        if (cone) {
          ctx.fillStyle = cone;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -TRAIL, 0); ctx.closePath(); ctx.fill();
        } else {
          ctx.fillStyle = colors["--rs-sweep"];
          for (var s = 0; s < 6; s++) { ctx.globalAlpha = 0.06 * (6 - s) / 6 * (1 - f * 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -TRAIL * (s + 1) / 6, -TRAIL * s / 6); ctx.fill(); }
        }
        ctx.globalAlpha = 1 - f * 2;
        ctx.strokeStyle = colors["--rs-sweep"]; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, 0); ctx.stroke();
        ctx.restore();
      }
      // the points
      var dr = Math.max(3, W * 0.013);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], x = cx + p.x * R, y = cx + p.y * R, a = rel(p), glow = 0, mark = 0.3;
        if (reduce.matches) { mark = mode === "idle" ? 0 : 0.45; }
        else if (swept >= a) {
          if (!seen[i] && mode === "search") { seen[i] = true; seenCount++; canvas.dispatchEvent(new CustomEvent("spot", { detail: { count: seenCount, index: i } })); }
          glow = Math.exp(-(((swept - a) % TAU) / TAU * period) / GLOW);
        } else mark = 0;
        if (i === target && f > 0) continue;
        ctx.globalAlpha = Math.max(mark, glow) * (1 - f * 0.65);
        ctx.fillStyle = colors["--rs-sweep"];
        if (glow > 0.05) { ctx.globalAlpha *= 0.35; ctx.beginPath(); ctx.arc(x, y, dr * (1 + glow * 1.4), 0, TAU); ctx.fill(); ctx.globalAlpha = Math.max(mark, glow) * (1 - f * 0.65); }
        ctx.beginPath(); ctx.arc(x, y, dr, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // the one that was found: a line out to it, two rings, a larger mark
      if (target >= 0 && f > 0) {
        var q = pts[target], qx = cx + q.x * R, qy = cx + q.y * R, l = Math.min(1, f / 0.4);
        ctx.strokeStyle = colors["--rs-found"]; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(cx, cx); ctx.lineTo(cx + (qx - cx) * l, cx + (qy - cx) * l); ctx.stroke();
        ctx.setLineDash([]);
        for (var k = 0; k < 2; k++) {
          var g = (f - k * 0.3) / 0.6;
          if (g > 0 && g < 1) { ctx.globalAlpha = 1 - g; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(qx, qy, dr * (1.5 + g * 5), 0, TAU); ctx.stroke(); }
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors["--rs-found"];
        ctx.beginPath(); ctx.arc(qx, qy, dr * (1 + 0.7 * Math.min(1, f * 3)), 0, TAU); ctx.fill();
      }
      // you, in the middle
      ctx.fillStyle = colors["--rs-you"];
      ctx.beginPath(); ctx.arc(cx, cx, dr * 1.3, 0, TAU); ctx.fill();
      ctx.strokeStyle = colors["--rs-disc"]; ctx.lineWidth = 2; ctx.stroke();
    }

    function live() { return onScreen && !document.hidden && !paused && !reduce.matches; }
    function each(fn) { [sweep, ring].forEach(function (a) { if (a) fn(a); }); }
    function wake() {
      if (!live()) { each(function (a) { if (a.playState === "running") a.pause(); }); return; }
      each(function (a) { if (a.playState === "paused") a.play(); });
      if (!raf && (mode === "search" || mode === "found")) raf = requestAnimationFrame(frame);
    }
    function frame() {
      raf = 0;
      if (!live()) return;
      if (mode === "search" && target >= 0 && now(sweep) >= stopAt) {
        sweep.cancel(); sweep = null;
        mode = "found";
        ring = clock(FOUND, "rider found", { fill: "forwards" });
      }
      if (mode === "found" && ring && now(ring) >= FOUND) { finish(); return; }
      draw();
      raf = requestAnimationFrame(frame);
    }
    function finish() {
      mode = "done"; if (ring) ring.cancel(); ring = null;
      if (btn) btn.hidden = true;
      draw();
      canvas.dispatchEvent(new CustomEvent("found", { detail: { index: target } }));
    }

    function search() {
      each(function (a) { a.cancel(); }); sweep = ring = null;
      seen = pts.map(function () { return false; }); seenCount = 0; target = -1; stopAt = -1;
      mode = "search";
      if (btn) { btn.hidden = reduce.matches; setPaused(false); }
      if (!reduce.matches && canvas.animate) sweep = clock(period, "radar sweep", { iterations: Infinity });
      draw(); wake();
    }
    function found(i) {
      if (mode !== "search" || !pts[i]) return;
      target = i;
      if (reduce.matches || !sweep) { mode = "done"; stopAt = 0; setTimeout(finish, 0); return; }
      // run on to the next time the arm points at it
      var t = now(sweep), a = rel(pts[i]) / TAU * period;
      stopAt = a + Math.ceil(Math.max(0, t - a) / period) * period;
    }
    function setPaused(p) {
      paused = p;
      if (btn) { btn.setAttribute("aria-pressed", p ? "true" : "false"); btn.textContent = p ? "Play" : "Pause"; }
      if (p) each(function (a) { a.pause(); }); else wake();
    }

    if (btn) { btn.hidden = true; btn.addEventListener("click", function () { setPaused(!paused); }); }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; wake(); }).observe(canvas);
    } else onScreen = true;
    document.addEventListener("visibilitychange", wake);
    reduce.addEventListener("change", function () { if (reduce.matches) { each(function (a) { a.pause(); }); if (btn) btn.hidden = true; } draw(); wake(); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fit);

    canvas.classList.add("is-live");
    canvas.radar = {
      set: function (list) { pts = list.slice(); seen = pts.map(function () { return false; }); draw(); },
      search: search,
      found: found,
      pause: function () { setPaused(true); },
      play: function () { setPaused(false); }
    };
    fit();
  }

  function init() { document.querySelectorAll("canvas.rs-canvas").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
