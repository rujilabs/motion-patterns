/*
 * dot-field-push.js: in every .dot-field, a grid of dots on its .df-canvas parts around the pointer
 * (mouse, pen or a dragging finger) and springs back when it leaves. A focused link or button inside
 * the field parts the dots around itself the same way, so the keyboard gets the effect too.
 * Each dot sits on a damped spring (damping ratio .6: one small overshoot) pulled toward a target
 * offset: away from the pointer, strongest at the pointer and gone at --df-reach.
 * On first view a short walk across the field runs on a Web Animation, so the timeline shows it.
 * The loop sleeps when every dot is at rest, when the field is off screen and when the tab is hidden.
 * Under reduced motion the field is drawn once, parted around the point in data-df-rest.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var K = 170, C = 16;          // spring stiffness and damping (ratio C / 2 sqrt K = .6)
  var PUSH = 0.42;              // push at the centre, as a share of the reach

  function px(v, fallback) { var n = parseFloat(v); return isNaN(n) ? fallback : n; }

  function setup(root) {
    var canvas = root.querySelector(".df-canvas");
    if (!canvas || canvas.dotField) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, gap = 22, reach = 120, dot = "#9aa6b8", near = "#c08a1e";
    var n = 0, hx, hy, ox, oy, vx, vy;
    // the obstacle: a rectangle (zero size for the pointer), and how strongly it pushes now
    var ob = { on: false, x0: 0, y0: 0, x1: 0, y1: 0, s: 0 };
    var onScreen = false, raf = 0, last = 0, walk = null, walked = false, pointerIn = false;

    function read() {
      var cs = getComputedStyle(root);
      gap = Math.max(8, px(cs.getPropertyValue("--df-gap"), 22));
      reach = Math.max(30, px(cs.getPropertyValue("--df-reach"), 120));
      dot = cs.getPropertyValue("--df-dot").trim() || dot;
      near = cs.getPropertyValue("--df-near").trim() || near;
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      read();
      var cols = Math.max(1, Math.floor((W - gap / 2) / gap) + 1), rows = Math.max(1, Math.floor((H - gap / 2) / gap) + 1);
      n = cols * rows;
      hx = new Float32Array(n); hy = new Float32Array(n);
      ox = new Float32Array(n); oy = new Float32Array(n);
      vx = new Float32Array(n); vy = new Float32Array(n);
      for (var j = 0, i = 0; j < rows; j++) for (var c = 0; c < cols; c++, i++) { hx[i] = gap / 2 + c * gap; hy[i] = gap / 2 + j * gap; }
      if (reduce.matches) still(); else { draw(); wake(); }
    }

    function step(dt) {
      var R = reach, R2 = R * R, moving = 0, s = ob.s;
      for (var i = 0; i < n; i++) {
        var tx = 0, ty = 0;
        if (s > 0.001) {
          // nearest point of the obstacle rectangle, then away from it
          var cx = hx[i] < ob.x0 ? ob.x0 : hx[i] > ob.x1 ? ob.x1 : hx[i];
          var cy = hy[i] < ob.y0 ? ob.y0 : hy[i] > ob.y1 ? ob.y1 : hy[i];
          var dx = hx[i] - cx, dy = hy[i] - cy, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            var d = Math.sqrt(d2);
            if (d < 0.5) { dx = hx[i] - (ob.x0 + ob.x1) / 2; dy = hy[i] - (ob.y0 + ob.y1) / 2; d = Math.sqrt(dx * dx + dy * dy) || 1; }
            var k = 1 - Math.min(1, Math.sqrt(d2) / R);
            var push = k * k * R * PUSH * s;
            tx = dx / d * push; ty = dy / d * push;
          }
        }
        vx[i] += ((tx - ox[i]) * K - vx[i] * C) * dt;
        vy[i] += ((ty - oy[i]) * K - vy[i] * C) * dt;
        ox[i] += vx[i] * dt; oy[i] += vy[i] * dt;
        var m = Math.abs(vx[i]) + Math.abs(vy[i]) + Math.abs(tx - ox[i]) + Math.abs(ty - oy[i]);
        if (m > moving) moving = m;
      }
      return moving;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = Math.max(1.1, gap * 0.065), i;
      ctx.fillStyle = dot;
      ctx.beginPath();
      for (i = 0; i < n; i++) if (ox[i] * ox[i] + oy[i] * oy[i] < 9) { ctx.moveTo(hx[i] + ox[i] + r, hy[i] + oy[i]); ctx.arc(hx[i] + ox[i], hy[i] + oy[i], r, 0, 6.2832); }
      ctx.fill();
      ctx.fillStyle = near;
      ctx.beginPath();
      for (i = 0; i < n; i++) if (ox[i] * ox[i] + oy[i] * oy[i] >= 9) { var rr = r * 1.35; ctx.moveTo(hx[i] + ox[i] + rr, hy[i] + oy[i]); ctx.arc(hx[i] + ox[i], hy[i] + oy[i], rr, 0, 6.2832); }
      ctx.fill();
    }

    function live() { return onScreen && !document.hidden && !reduce.matches; }
    function wake() { if (!raf && live()) { last = 0; raf = requestAnimationFrame(frame); } }
    function frame(t) {
      raf = 0;
      var dt = last ? Math.min(0.033, (t - last) / 1000) : 0.016;
      last = t;
      if (walk && walk.currentTime != null && !pointerIn) {
        // the first-view walk: a point crossing the field on a gentle curve
        var p = Math.min(1, walk.currentTime / 1800);
        var x = W * (-0.05 + 1.1 * p), y = H * (0.62 - 0.3 * Math.sin(Math.PI * p));
        ob.x0 = ob.x1 = x; ob.y0 = ob.y1 = y; ob.on = p < 1;
      }
      ob.s += ((ob.on ? 1 : 0) - ob.s) * Math.min(1, dt * 9);
      var moving = step(dt / 2) + step(dt / 2);
      draw();
      if (moving > 0.05 || ob.on || ob.s > 0.002) wake();
    }

    function still() {
      // one meaningful frame: parted around a point (data-df-rest="x y", shares of the field), at rest
      var at = (root.getAttribute("data-df-rest") || "0.75 0.35").split(" ");
      for (var i = 0; i < n; i++) { ox[i] = oy[i] = vx[i] = vy[i] = 0; }
      ob.x0 = ob.x1 = W * (+at[0] || 0.75); ob.y0 = ob.y1 = H * (+at[1] || 0.35);
      ob.s = 1;
      for (var k = 0; k < 300; k++) step(0.016);
      ob.s = 0; ob.on = false;
      draw();
    }

    function aim(el) {
      var a = canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
      ob.x0 = r.left - a.left; ob.x1 = r.right - a.left; ob.y0 = r.top - a.top; ob.y1 = r.bottom - a.top;
      ob.on = true;
    }
    function point(e) {
      if (reduce.matches) return;
      var a = canvas.getBoundingClientRect();
      ob.x0 = ob.x1 = e.clientX - a.left; ob.y0 = ob.y1 = e.clientY - a.top;
      ob.on = true; pointerIn = true;
      wake();
    }
    function leave() { pointerIn = false; ob.on = false; var f = root.querySelector(":focus-visible"); if (f) aim(f); wake(); }

    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", point);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    root.addEventListener("focusin", function (e) {
      if (reduce.matches || pointerIn || !e.target.matches(":focus-visible")) return;
      aim(e.target); wake();
    });
    root.addEventListener("focusout", function () { if (!pointerIn) { ob.on = false; wake(); } });

    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        onScreen = es[es.length - 1].isIntersecting;
        if (onScreen && !walked && !reduce.matches && canvas.animate) {
          walked = true;
          walk = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1800, easing: "linear" });
          walk.id = "walk across the field";
          walk.onfinish = function () { walk = null; if (!pointerIn) ob.on = false; wake(); };
        }
        wake();
      }).observe(root);
    } else onScreen = true;
    document.addEventListener("visibilitychange", wake);
    reduce.addEventListener("change", function () { if (reduce.matches) still(); else { draw(); wake(); } });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { read(); draw(); });

    canvas.classList.add("is-live");
    canvas.dotField = { still: still };
    fit();
  }

  function init() { document.querySelectorAll(".dot-field").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
