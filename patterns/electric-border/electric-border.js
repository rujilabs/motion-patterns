/*
 * electric-border.js: draws a crackling line of current round every .eb card on its canvas.eb-canvas.
 * The line follows the card's rounded edge, pushed in and out along it by noise that wraps seamlessly
 * round the loop and drifts over time: two strands, each a wide faint glow, a mid glow and a bright
 * core. Only the shape moves; brightness stays the same, so it never flashes.
 * On hover or focus inside the card the current runs a little stronger.
 * Time runs on a Web Animations clock on the canvas (the gallery timeline can pause it). A button with
 * data-pause-for="<id of the .eb>" pauses it. Nothing is drawn off screen or in a hidden tab.
 * Under reduced motion one still frame is drawn.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var STEP = 5; // px between points on the edge

  function setup(card) {
    var canvas = card.querySelector(".eb-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var px, py, nx, ny, dx, dy, M = 0, P = 1, pad = 18, w = 0, h = 0, color = "#7cf3ff", core = "#f2feff";
    var k1 = 3, k2 = 7, k3 = 17, k4 = 40, amp = 1, boost = 0, hot = false;
    var clock = null, raf = 0, onScreen = true, paused = false;
    var btn = card.id ? document.querySelector('[data-pause-for="' + card.id + '"]') : null;

    function fit() {
      var cs = getComputedStyle(card);
      pad = parseFloat(cs.getPropertyValue("--eb-pad")) || 18;
      color = cs.getPropertyValue("--eb-color").trim() || color;
      core = cs.getPropertyValue("--eb-core").trim() || core;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var cw = card.offsetWidth, ch = card.offsetHeight;
      w = cw + pad * 2; h = ch + pad * 2;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var r = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, cw / 2, ch / 2);
      // walk the rounded rectangle once, a point every STEP px, with its outward normal
      var straightW = cw - 2 * r, straightH = ch - 2 * r, arc = Math.PI * r / 2;
      P = 2 * straightW + 2 * straightH + 4 * arc;
      M = Math.max(16, Math.round(P / STEP));
      px = new Float32Array(M); py = new Float32Array(M); nx = new Float32Array(M); ny = new Float32Array(M);
      dx = new Float32Array(M); dy = new Float32Array(M);
      var segs = [
        [straightW, function (s) { return [pad + r + s, pad, 0, -1]; }],
        [arc, function (s) { var a = -Math.PI / 2 + s / r; return [pad + cw - r + Math.cos(a) * r, pad + r + Math.sin(a) * r, Math.cos(a), Math.sin(a)]; }],
        [straightH, function (s) { return [pad + cw, pad + r + s, 1, 0]; }],
        [arc, function (s) { var a = s / r; return [pad + cw - r + Math.cos(a) * r, pad + ch - r + Math.sin(a) * r, Math.cos(a), Math.sin(a)]; }],
        [straightW, function (s) { return [pad + cw - r - s, pad + ch, 0, 1]; }],
        [arc, function (s) { var a = Math.PI / 2 + s / r; return [pad + r + Math.cos(a) * r, pad + ch - r + Math.sin(a) * r, Math.cos(a), Math.sin(a)]; }],
        [straightH, function (s) { return [pad, pad + ch - r - s, -1, 0]; }],
        [arc, function (s) { var a = Math.PI + s / r; return [pad + r + Math.cos(a) * r, pad + r + Math.sin(a) * r, Math.cos(a), Math.sin(a)]; }]
      ];
      for (var i = 0; i < M; i++) {
        var s = i / M * P, j = 0;
        while (j < segs.length - 1 && s > segs[j][0]) { s -= segs[j][0]; j++; }
        var q = segs[j][1](Math.min(s, segs[j][0]));
        px[i] = q[0]; py[i] = q[1]; nx[i] = q[2]; ny[i] = q[3];
      }
      // whole numbers of waves round the loop, so the noise meets itself with no seam
      k1 = Math.max(2, Math.round(P / 260)); k2 = Math.max(5, Math.round(P / 95)); k3 = Math.max(11, Math.round(P / 38)); k4 = Math.max(26, Math.round(P / 15));
      draw(clock && clock.currentTime != null ? clock.currentTime : 2400);
    }

    function strand(t, seed, a) {
      var T = Math.PI * 2;
      for (var i = 0; i < M; i++) {
        var u = i / M * T;
        var n = 0.5 * Math.sin(k1 * u + t * 1.3 + seed) + 0.32 * Math.sin(k2 * u - t * 2.9 + seed * 2.1) +
          0.18 * Math.sin(k3 * u + t * 4.7 + seed * 3.7) + 0.14 * Math.sin(k4 * u - t * 8.3 + seed * 5.3);
        dx[i] = px[i] + nx[i] * n * a; dy[i] = py[i] + ny[i] * n * a;
      }
    }
    function stroke(width, alpha, col) {
      ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(dx[0], dy[0]);
      for (var i = 1; i < M; i++) ctx.lineTo(dx[i], dy[i]);
      ctx.closePath(); ctx.stroke();
    }
    function draw(ms) {
      if (!M) return;
      var t = ms / 1000, a = (5 + boost * 2.5) * amp;
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "lighter";
      strand(t, 0, a);
      stroke(10, 0.07, color); stroke(4, 0.22, color); stroke(1.6, 0.9, core);
      strand(t * 1.17, 2.4, a * 0.8);
      stroke(5, 0.12, color); stroke(1.1, 0.7, color);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
    function frame() {
      raf = 0;
      boost += ((hot ? 1 : 0) - boost) * 0.08;
      if (clock && clock.currentTime != null) draw(clock.currentTime);
      if (onScreen && !document.hidden && (!paused || Math.abs((hot ? 1 : 0) - boost) > 0.01)) raf = requestAnimationFrame(frame);
    }
    function kick() { if (clock && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame); }

    function sync() {
      if (still.matches) {
        if (clock) { clock.cancel(); clock = null; }
        fit();          // one still frame
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 60000, iterations: Infinity });
        clock.id = "current along the border";
        if (paused) clock.pause();
      }
      fit();
      kick();
    }

    card.classList.add("eb-live");
    card.addEventListener("pointerenter", function () { hot = true; kick(); });
    card.addEventListener("pointerleave", function () { hot = false; kick(); });
    card.addEventListener("focusin", function () { hot = true; kick(); });
    card.addEventListener("focusout", function () { hot = false; kick(); });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(card); else window.addEventListener("resize", fit);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; kick(); }).observe(card);
    document.addEventListener("visibilitychange", function () {
      if (clock) { if (document.hidden) clock.pause(); else if (!paused) clock.play(); }
      kick();
    });
    if (btn) btn.addEventListener("click", function () {
      paused = !paused;
      btn.setAttribute("aria-pressed", paused ? "true" : "false");
      if (clock) { if (paused) clock.pause(); else clock.play(); }
      kick();
    });
    still.addEventListener("change", sync);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fit);
    sync();
  }

  function init() { document.querySelectorAll(".eb").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
