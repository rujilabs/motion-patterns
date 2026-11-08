/*
 * magnet-needles.js: in every .needle-field, a grid of compass needles on its .mn-canvas turns to point
 * at the pointer (mouse, pen or a dragging finger) anywhere over the field, and swings back to north
 * when it leaves. A focused link or button inside the field pulls the needles the same way, so the
 * keyboard gets it too. Each needle is a damped rotary spring (damping ratio .32: it overshoots and
 * settles in two or three wobbles, like a real compass), stiffer the closer it is to the pointer, so
 * the near needles snap round first and the far ones follow.
 * On first view a short pass of the magnet runs on a Web Animation, so the timeline shows it.
 * The loop sleeps when every needle is still, when the field is off screen and when the tab is hidden.
 * Under reduced motion the needles are drawn once, pointing at [data-mn-rest] (or north).
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var NORTH = -Math.PI / 2, ZETA = 0.32;

  function setup(root) {
    var canvas = root.querySelector(".mn-canvas");
    if (!canvas || canvas.needles) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, gap = 34, tip = "#d2452f", tail = "#a3abb6", pin = "#2b3038";
    var n = 0, nx, ny, th, om;
    var mag = { on: false, x: 0, y: 0 };
    var onScreen = false, raf = 0, last = 0, pass = null, passed = false, pointerIn = false;

    function read() {
      var cs = getComputedStyle(root);
      gap = Math.max(16, parseFloat(cs.getPropertyValue("--mn-gap")) || 34);
      tip = cs.getPropertyValue("--mn-tip").trim() || tip;
      tail = cs.getPropertyValue("--mn-tail").trim() || tail;
      pin = cs.getPropertyValue("--mn-pin").trim() || pin;
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      read();
      // centred, with at least half a needle of margin so none is cut at the edge
      var cols = Math.max(1, Math.floor(W / gap)), rows = Math.max(1, Math.floor(H / gap));
      var x0 = (W - (cols - 1) * gap) / 2, y0 = (H - (rows - 1) * gap) / 2;
      var keep = th, kept = n;
      n = cols * rows;
      nx = new Float32Array(n); ny = new Float32Array(n); th = new Float32Array(n); om = new Float32Array(n);
      for (var j = 0, i = 0; j < rows; j++) for (var c = 0; c < cols; c++, i++) {
        nx[i] = x0 + c * gap; ny[i] = y0 + j * gap; th[i] = i < kept ? keep[i] : NORTH;
      }
      if (reduce.matches) still(); else { draw(); wake(); }
    }

    function wrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

    function step(dt) {
      var moving = 0;
      for (var i = 0; i < n; i++) {
        var target = NORTH, k = 38;
        if (mag.on) {
          var dx = mag.x - nx[i], dy = mag.y - ny[i], d = Math.sqrt(dx * dx + dy * dy);
          if (d > 2) { target = Math.atan2(dy, dx); k = 38 + 190 * Math.exp(-d / 210); }
        }
        var err = wrap(target - th[i]);
        om[i] += (err * k - om[i] * 2 * ZETA * Math.sqrt(k)) * dt;
        th[i] += om[i] * dt;
        var m = Math.abs(om[i]) + Math.abs(err);
        if (m > moving) moving = m;
      }
      return moving;
    }

    function half(color, sign) {
      // one half of every needle in one path: the north halves (sign 1) or the south halves (sign -1)
      var L = gap * 0.36 * sign, w = gap * 0.075;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var c = Math.cos(th[i]), s = Math.sin(th[i]), x = nx[i], y = ny[i];
        ctx.moveTo(x + c * L, y + s * L);
        ctx.lineTo(x - s * w, y + c * w);
        ctx.lineTo(x + s * w, y - c * w);
        ctx.closePath();
      }
      ctx.fill();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      half(tail, -1);
      half(tip, 1);
      var r = Math.max(1.2, gap * 0.04);
      ctx.fillStyle = pin;
      ctx.beginPath();
      for (var i = 0; i < n; i++) { ctx.moveTo(nx[i] + r, ny[i]); ctx.arc(nx[i], ny[i], r, 0, 6.2832); }
      ctx.fill();
    }

    function live() { return onScreen && !document.hidden && !reduce.matches; }
    function wake() { if (!raf && live()) { last = 0; raf = requestAnimationFrame(frame); } }
    function frame(t) {
      raf = 0;
      var dt = last ? Math.min(0.033, (t - last) / 1000) : 0.016;
      last = t;
      if (pass && pass.currentTime != null && !pointerIn) {
        // the first-view pass: the magnet sweeps from lower left to upper right
        var p = Math.min(1, pass.currentTime / 2000);
        mag.x = W * (-0.1 + 1.2 * p); mag.y = H * (0.85 - 0.6 * p); mag.on = p < 1;
      }
      var moving = step(dt / 2) + step(dt / 2);
      draw();
      if (moving > 0.004 || pass) wake();
    }

    function at(el) {
      var a = canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
      mag.x = (r.left + r.right) / 2 - a.left; mag.y = (r.top + r.bottom) / 2 - a.top; mag.on = true;
    }
    function still() {
      var rest = root.querySelector("[data-mn-rest]");
      if (rest) at(rest); else mag.on = false;
      for (var i = 0; i < n; i++) {
        th[i] = mag.on ? Math.atan2(mag.y - ny[i], mag.x - nx[i]) : NORTH;
        om[i] = 0;
      }
      mag.on = false;
      draw();
    }
    function point(e) {
      if (reduce.matches) return;
      var a = canvas.getBoundingClientRect();
      mag.x = e.clientX - a.left; mag.y = e.clientY - a.top; mag.on = true; pointerIn = true;
      wake();
    }
    function leave() {
      pointerIn = false; mag.on = false;
      var f = root.querySelector(":focus-visible");
      if (f) at(f);
      wake();
    }

    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", point);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    root.addEventListener("focusin", function (e) {
      if (reduce.matches || pointerIn || !e.target.matches(":focus-visible")) return;
      at(e.target); wake();
    });
    root.addEventListener("focusout", function () { if (!pointerIn) { mag.on = false; wake(); } });

    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        onScreen = es[es.length - 1].isIntersecting;
        if (onScreen && !passed && !reduce.matches && canvas.animate) {
          passed = true;
          pass = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 2000, easing: "linear" });
          pass.id = "magnet pass";
          pass.onfinish = function () { pass = null; if (!pointerIn) mag.on = false; wake(); };
        }
        wake();
      }).observe(root);
    } else onScreen = true;
    document.addEventListener("visibilitychange", wake);
    reduce.addEventListener("change", function () { if (reduce.matches) still(); else { draw(); wake(); } });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { read(); draw(); });

    canvas.classList.add("is-live");
    canvas.needles = { still: still };
    fit();
  }

  function init() { document.querySelectorAll(".needle-field").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
