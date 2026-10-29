/*
 * pack-viewer.js: turns a .pack box by drag, flick and keys.
 *
 * The box's orientation is two angles: yaw (turn about the upright axis) and pitch (tip toward you).
 * Its matrix is Rx(pitch) * Ry(yaw), written straight into matrix3d so the same numbers drive the
 * shading. Each face's normal is turned by that matrix and dotted with one fixed light direction:
 * a face turned toward the light is bright, a face turned away goes dark. The contact shadow is sized
 * from the box's real footprint on the floor and fades and blurs with the gap under its lowest corner.
 *
 * Drag turns it 1:1. Let go and it keeps the speed of your flick, then a spring settles it square on
 * the face it was heading for (the flick is projected forward, the way a wheel coasts to a stop).
 * Arrow keys turn it a quarter, Home shows the front, End the back. el.pack.show("back") does the same
 * from code, and a "packface" event fires on the element when a new face comes to the front.
 */
(function () {
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  // light from above, left and in front, in screen space (y points down)
  var L = norm([-0.42, -0.55, 0.72]);
  var FACES = {
    front: [0, 0, 1], back: [0, 0, -1], right: [1, 0, 0],
    left: [-1, 0, 0], top: [0, -1, 0], bottom: [0, 1, 0]
  };
  // the yaw and pitch that bring each face square to the front
  var SHOW = {
    front: [0, 0], back: [180, 0], right: [-90, 0], left: [90, 0], top: [0, -90], bottom: [0, 90]
  };

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function matrix(yaw, pitch) {
    var cy = Math.cos(yaw * RAD), sy = Math.sin(yaw * RAD);
    var cx = Math.cos(pitch * RAD), sx = Math.sin(pitch * RAD);
    // Rx(pitch) * Ry(yaw), row-major
    return [
      cy, 0, sy,
      sx * sy, cx, -sx * cy,
      -cx * sy, sx, cx * cy
    ];
  }
  function turn(M, n) {
    return [M[0] * n[0] + M[1] * n[1] + M[2] * n[2], M[3] * n[0] + M[4] * n[1] + M[5] * n[2], M[6] * n[0] + M[7] * n[1] + M[8] * n[2]];
  }
  function css(M, ty) {
    var a = [M[0], M[3], M[6], 0, M[1], M[4], M[7], 0, M[2], M[5], M[8], 0, 0, ty, 0, 1];
    return "matrix3d(" + a.map(function (x) { return +x.toFixed(6); }).join(",") + ")";
  }
  function px(el, name, fallback) { return parseFloat(getComputedStyle(el).getPropertyValue(name)) || fallback; }
  function wrap(a) { a %= 360; return a < 0 ? a + 360 : a; }

  function setup(el) {
    if (el.pack) return;
    var box = el.querySelector(".pack-box");
    var lifter = el.querySelector(".pack-lift");
    var shadow = el.querySelector(".pack-shadow");
    if (!box) return;
    var faces = {};
    Object.keys(FACES).forEach(function (k) { faces[k] = el.querySelector(".pack-" + k); });
    var labels = {};
    Object.keys(FACES).forEach(function (k) { labels[k] = el.getAttribute("data-" + k) || k; });

    var W, H, D, FLOOR;
    function measure() { W = px(el, "--pack-w", 190); H = px(el, "--pack-h", 270); D = px(el, "--pack-d", 72); FLOOR = px(el, "--pack-floor", 190); }
    measure();

    // state: angle, velocity and spring target for each axis, plus the lift while held
    var s = { yaw: -32, pitch: -14, vy: 0, vp: 0, ty: null, tp: null, lift: 0, vl: 0, tl: 0 };
    var current = "front";
    var raf = 0, last = 0;

    function draw() {
      var M = matrix(s.yaw, s.pitch);
      box.style.transform = css(M, 0);
      lifter.style.transform = "translateY(" + (-s.lift).toFixed(2) + "px)";
      // shade every face from its turned normal
      var best = null, bestZ = -2;
      Object.keys(FACES).forEach(function (k) {
        var n = turn(M, FACES[k]);
        var lit = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
        if (faces[k]) faces[k].style.filter = "brightness(" + (0.48 + 0.72 * lit).toFixed(3) + ")";
        if (n[2] > bestZ) { bestZ = n[2]; best = k; }
      });
      // contact shadow: the footprint the box casts straight down, and the gap under its lowest corner
      if (shadow) {
        var wide = Math.abs(M[0]) * W + Math.abs(M[1]) * H + Math.abs(M[2]) * D;
        var deep = Math.abs(M[6]) * W + Math.abs(M[7]) * H + Math.abs(M[8]) * D;
        var low = (Math.abs(M[3]) * W + Math.abs(M[4]) * H + Math.abs(M[5]) * D) / 2 - s.lift;
        var gap = Math.max(0, FLOOR - low);
        var near = Math.max(0, 1 - gap / 150);
        shadow.style.transform = "scale(" + (wide * (0.9 + gap / 400) / 100).toFixed(3) + "," + (Math.max(18, deep * 0.32) * (0.9 + gap / 400) / 100).toFixed(3) + ")";
        shadow.style.opacity = (0.22 + 0.6 * near).toFixed(3);
        shadow.style.filter = "blur(" + (3 + gap * 0.09).toFixed(1) + "px)";
      }
      el.setAttribute("aria-valuenow", String(Math.round(wrap(-s.yaw))));
      if (best !== current) {
        current = best;
        el.setAttribute("aria-valuetext", labels[best]);
        el.dispatchEvent(new CustomEvent("packface", { detail: { face: best } }));
      }
    }

    function moving() {
      var still = Math.abs(s.vy) < 2 && Math.abs(s.vp) < 2 && Math.abs(s.vl) < 2;
      var there = (s.ty === null || Math.abs(s.yaw - s.ty) < 0.05) && (s.tp === null || Math.abs(s.pitch - s.tp) < 0.05) && Math.abs(s.lift - s.tl) < 0.05;
      return !(still && there);
    }
    function step(now) {
      var dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      if (!dragging) {
        // a spring a little under critical damping: one small overshoot, then square on the face
        var k = 150, c = 2 * Math.sqrt(k) * 0.72;
        if (s.ty !== null) { s.vy += (-k * (s.yaw - s.ty) - c * s.vy) * dt; s.yaw += s.vy * dt; }
        if (s.tp !== null) { s.vp += (-k * (s.pitch - s.tp) - c * s.vp) * dt; s.pitch += s.vp * dt; }
      }
      var kl = 260, cl = 2 * Math.sqrt(kl) * 0.6;
      s.vl += (-kl * (s.lift - s.tl) - cl * s.vl) * dt; s.lift += s.vl * dt;
      draw();
      if (dragging || moving()) raf = requestAnimationFrame(step);
      else {
        if (s.ty !== null) s.yaw = s.ty;
        if (s.tp !== null) s.pitch = s.tp;
        s.vy = s.vp = s.vl = 0; s.lift = s.tl;
        draw(); raf = 0;
      }
    }
    function run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } }

    function settleTo(yaw, pitch) {
      s.ty = yaw; s.tp = pitch;
      if (reduce.matches) { s.yaw = yaw; s.pitch = pitch; s.vy = s.vp = 0; draw(); return; }
      run();
    }
    // bring a face to the front by the shortest turn
    function show(name) {
      var t = SHOW[name];
      if (!t) return;
      var dy = ((t[0] - s.yaw) % 360 + 540) % 360 - 180;
      settleTo(s.yaw + dy, t[1]);
    }

    // drag
    var dragging = false, px0 = 0, py0 = 0, lt = 0;
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true; el.classList.add("is-dragging");
      px0 = e.clientX; py0 = e.clientY; lt = e.timeStamp;
      s.vy = s.vp = 0; s.ty = s.tp = null;
      s.tl = reduce.matches ? 0 : 14; // picked up: it rises off the floor a little
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      run();
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - px0, dy = e.clientY - py0, dt = Math.max(1, e.timeStamp - lt) / 1000;
      px0 = e.clientX; py0 = e.clientY; lt = e.timeStamp;
      var ry = dx * 0.55, rp = -dy * 0.55;
      s.yaw += ry;
      s.pitch = Math.max(-90, Math.min(90, s.pitch + rp));
      // smoothed speed of the hand, in degrees a second
      s.vy = s.vy * 0.6 + (ry / dt) * 0.4;
      s.vp = s.vp * 0.6 + (rp / dt) * 0.4;
    });
    function release(e) {
      if (!dragging) return;
      dragging = false; el.classList.remove("is-dragging");
      s.tl = 0;
      if (e && e.timeStamp - lt > 90) { s.vy = 0; s.vp = 0; } // held still before letting go: no flick
      if (reduce.matches) s.vy = s.vp = 0;
      // where the flick would carry it, then the nearest face from there
      var ay = s.yaw + s.vy * 0.28, ap = s.pitch + s.vp * 0.28;
      s.vy = Math.max(-1400, Math.min(1400, s.vy));
      s.vp = Math.max(-900, Math.min(900, s.vp));
      var tp = Math.max(-90, Math.min(90, Math.round(ap / 90) * 90));
      settleTo(Math.round(ay / 90) * 90, tp);
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    // keys
    el.addEventListener("keydown", function (e) {
      var base = s.ty !== null ? s.ty : Math.round(s.yaw / 90) * 90;
      var pbase = s.tp !== null ? s.tp : Math.round(s.pitch / 90) * 90;
      var k = e.key;
      if (k === "ArrowRight") settleTo(base + 90, 0);
      else if (k === "ArrowLeft") settleTo(base - 90, 0);
      else if (k === "ArrowUp") settleTo(base, Math.max(-90, pbase - 90));
      else if (k === "ArrowDown") settleTo(base, Math.min(90, pbase + 90));
      else if (k === "Home") show("front");
      else if (k === "End") show("back");
      else return;
      e.preventDefault();
    });

    el.pack = { show: show, face: function () { return current; } };
    current = null;
    draw(); // rests at the three-quarter view; nothing moves until someone turns it
    window.addEventListener("resize", function () { measure(); draw(); });
  }

  function init() { document.querySelectorAll(".pack").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
