/*
 * ribbon-cursor.js: soft ribbons tied to the pointer. Each ribbon is a short rope of 20 points
 * (Verlet, with gravity and damping) pinned to the pointer at the top, so it trails behind a move,
 * swings, twists to show its darker back, and settles hanging down.
 *   <section class="rb" data-rb-hook="0.8 0.14">
 *     <canvas class="rb-canvas" aria-hidden="true"></canvas> ...your content...
 *   </section>
 * When the pointer leaves, the ribbons glide back to the hook (data-rb-hook, x and y as parts of the
 * area) and come to rest there. Tab to a link or button inside and they swing over to hang from it.
 * On first view they drop in from the top right once, timed by a Web Animations clock the gallery
 * timeline can scrub. The loop stops as soon as the ribbons are still, off screen, or the tab is hidden.
 * Under reduced motion they hang still from the hook and ignore the pointer.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var N = 20, STEP = 1000 / 60, G = 1200, DAMP = 0.965, ITER = 10;
  var SPREAD = [-27, -9, 9, 27], SEG = [11, 12.5, 10, 13], PHASE = [0, 1.7, 3.1, 4.6];

  function setup(area) {
    var canvas = area.querySelector(".rb-canvas");
    var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx) return;
    var R = SPREAD.length, M = R * N;
    var x = new Float32Array(M), y = new Float32Array(M), ox = new Float32Array(M), oy = new Float32Array(M);
    var lx = new Float32Array(N), ly = new Float32Array(N), rx = new Float32Array(N), ry = new Float32Array(N), tw = new Float32Array(N);
    var spin = new Float32Array(R), dash = [0.01, 6];
    var hook = (area.getAttribute("data-rb-hook") || "0.8 0.14").split(/\s+/).map(Number);
    var w = 0, h = 0, scale = 1, colors = [], width = 20;
    var ax = 0, ay = 0, tx = 0, ty = 0, lag = 220, pointerIn = false, focusEl = null;
    var drop = null, seen = !("IntersectionObserver" in window), introDone = false;
    var raf = 0, last = 0, acc = 0, calm = 0;

    function readStyle() {
      var cs = getComputedStyle(area);
      colors = (cs.getPropertyValue("--rb-colors").trim() || "#25358a #9a5426 #b3312b #d6a12a").split(/\s+/);
      width = parseFloat(cs.getPropertyValue("--rb-width")) || 20;
    }
    function hookX() { return hook[0] * w; }
    function hookY() { return hook[1] * h; }
    // every ribbon hanging straight down from (px, py), with a slight drape
    function hang(px, py) {
      for (var r = 0; r < R; r++) for (var i = 0; i < N; i++) {
        var k = r * N + i, u = i / (N - 1);
        x[k] = ox[k] = px + SPREAD[r] * scale + Math.sin(u * 2.4 + PHASE[r]) * 14 * u * scale;
        y[k] = oy[k] = py + i * SEG[r] * scale;
      }
      ax = tx = px; ay = ty = py;
    }

    function step() {
      var g = G * (STEP / 1000) * (STEP / 1000), vx = 0;
      for (var r = 0; r < R; r++) {
        var b = r * N, seg = SEG[r] * scale;
        x[b] = ox[b] = ax + SPREAD[r] * scale; y[b] = oy[b] = ay;
        for (var i = 1; i < N; i++) {
          var k = b + i, dx = (x[k] - ox[k]) * DAMP, dy = (y[k] - oy[k]) * DAMP;
          ox[k] = x[k]; oy[k] = y[k];
          x[k] += dx; y[k] += dy + g;
        }
        for (var it = 0; it < ITER; it++) {
          for (i = 1; i < N; i++) {
            var a = b + i - 1, c = b + i, ex = x[c] - x[a], ey = y[c] - y[a], d = Math.sqrt(ex * ex + ey * ey) || 0.001;
            var f = (d - seg) / d;
            if (i === 1) { x[c] -= ex * f; y[c] -= ey * f; }
            else { x[a] += ex * f * 0.5; y[a] += ey * f * 0.5; x[c] -= ex * f * 0.5; y[c] -= ey * f * 0.5; }
          }
        }
        vx = x[b + N - 1] - ox[b + N - 1];
        spin[r] += vx * 0.012;   // a sideways swing twists the ribbon
      }
    }

    function drawRibbon(r) {
      var b = r * N, hw = width * 0.5 * scale, i, k;
      for (i = 0; i < N; i++) {
        k = b + i;
        var p = i > 0 ? k - 1 : k, q = i < N - 1 ? k + 1 : k;
        var dx = x[q] - x[p], dy = y[q] - y[p], d = Math.sqrt(dx * dx + dy * dy) || 1;
        var u = i / (N - 1), shape = Math.sin(Math.PI * (0.12 + 0.8 * u));
        tw[i] = Math.cos(u * 3 + PHASE[r] + spin[r]);
        var s = hw * shape * Math.max(0.1, Math.abs(tw[i]));
        lx[i] = x[k] - dy / d * s; ly[i] = y[k] + dx / d * s;
        rx[i] = x[k] + dy / d * s; ry[i] = y[k] - dx / d * s;
      }
      // two passes: the face of the cloth, then the back, which shows where the ribbon has turned over
      for (var side = 0; side < 2; side++) {
        ctx.beginPath();
        for (i = 0; i < N - 1; i++) {
          if ((tw[i] + tw[i + 1] >= 0) !== (side === 0)) continue;
          ctx.moveTo(lx[i], ly[i]); ctx.lineTo(lx[i + 1], ly[i + 1]); ctx.lineTo(rx[i + 1], ry[i + 1]); ctx.lineTo(rx[i], ry[i]); ctx.closePath();
        }
        ctx.fillStyle = colors[r % colors.length];
        ctx.fill();
        if (side === 1) { ctx.fillStyle = "rgba(20, 10, 0, .32)"; ctx.fill(); }
      }
      // a dotted line down the middle, like the fine dots drawn between batik motifs
      ctx.beginPath();
      ctx.moveTo(x[b], y[b]);
      for (i = 1; i < N; i++) ctx.lineTo(x[b + i], y[b + i]);
      ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      ctx.lineCap = "round"; ctx.lineWidth = 1.6 * scale; ctx.strokeStyle = "rgba(255, 248, 232, .7)";
      ctx.setLineDash(dash);
      for (var r = 0; r < R; r++) drawRibbon(r);
      ctx.setLineDash([]);
      // the little wooden bar the ribbons are tied to
      ctx.strokeStyle = "#3b2a1e"; ctx.lineWidth = 3.5 * scale;
      ctx.beginPath(); ctx.moveTo(ax + (SPREAD[0] - 8) * scale, ay); ctx.lineTo(ax + (SPREAD[R - 1] + 8) * scale, ay); ctx.stroke();
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(50, now - last) : STEP;
      last = now;
      if (drop) {
        var p = drop.effect.getComputedTiming().progress;
        if (drop.playState === "finished" || p == null) { drop = null; tx = hookX(); ty = hookY(); }
        else { tx = w * (1.08 - (1.08 - hook[0]) * p); ty = h * (-0.25 + (hook[1] + 0.25) * p) - Math.sin(Math.PI * p) * h * 0.08; }
      }
      var k = 1 - Math.exp(-dt / (drop ? 30 : lag));
      ax += (tx - ax) * k; ay += (ty - ay) * k;
      acc += dt;
      for (var n = 0; acc >= STEP && n < 3; n++) { step(); acc -= STEP; }
      if (acc > STEP) acc = 0;
      draw();
      // stop when nothing moves any more
      var e = Math.abs(tx - ax) + Math.abs(ty - ay);
      for (var i = 0; i < R * N; i++) e += Math.abs(x[i] - ox[i]) + Math.abs(y[i] - oy[i]);
      calm = e < 0.6 ? calm + 1 : 0;
      if ((calm < 20 || drop) && seen && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() { calm = 0; if (!raf && seen && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame); }

    function rest() {
      if (focusEl) return aimAt(focusEl);
      tx = hookX(); ty = hookY(); lag = 220; kick();
    }
    function aimAt(el) {
      var b = area.getBoundingClientRect(), t = el.getBoundingClientRect();
      tx = t.left - b.left + t.width * 0.5; ty = t.top - b.top + 2; lag = 120; kick();
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      var first = !w;
      w = r.width; h = r.height;
      scale = Math.max(0.55, Math.min(1, h / 480));
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (first || reduce.matches) hang(hookX(), hookY());
      if (reduce.matches || !raf) draw();
      if (!reduce.matches && !first && !pointerIn) rest();
    }
    function intro() {
      introDone = true;
      if (reduce.matches || !canvas.animate) return;
      hang(w * 1.08, -h * 0.25);
      drop = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1100, easing: "ease-out" });
      drop.id = "ribbons drop in";
      kick();
    }

    function point(e) {
      if (reduce.matches) return;
      var b = area.getBoundingClientRect();
      if (drop) { drop.cancel(); drop = null; }
      pointerIn = true;
      tx = e.clientX - b.left; ty = e.clientY - b.top; lag = 45;
      kick();
    }
    area.addEventListener("pointermove", point);
    area.addEventListener("pointerdown", point);
    area.addEventListener("pointerleave", function () { pointerIn = false; if (!reduce.matches) rest(); });
    area.addEventListener("pointercancel", function () { pointerIn = false; if (!reduce.matches) rest(); });
    area.addEventListener("focusin", function (e) {
      if (e.target === area) return;
      focusEl = e.target;
      if (!reduce.matches && !pointerIn) { if (drop) { drop.cancel(); drop = null; } aimAt(focusEl); }
    });
    area.addEventListener("focusout", function () {
      focusEl = null;
      setTimeout(function () { if (!focusEl && !pointerIn && !reduce.matches) rest(); }, 0);
    });

    readStyle();
    fit();
    area.classList.add("rb-live");
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", function () {
      if (drop) { drop.cancel(); drop = null; }
      hang(hookX(), hookY()); draw();
    });
    if (!seen) {
      new IntersectionObserver(function (es) {
        seen = es[0].isIntersecting;
        if (seen && !introDone) intro();
        kick();
      }, { threshold: 0.2 }).observe(area);
    } else intro();
  }

  function start() { document.querySelectorAll(".rb").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
