/*
 * comet-dial.js: a kitchen timer dial for every .comet-dial (role="slider", data-value minutes, data-max).
 * The time left is an arc from 0 round to a comet head; the head's tail trails the way it moves and
 * stretches with its speed, and sparks peel off it while it counts down. Turn it by dragging round the
 * centre (relative, like a real knob, no jump to the finger) or with the arrow keys, Page Up and Down,
 * Home and End. The countdown clock is a Web Animation on the canvas, so a page timeline can pause it.
 *   el.dial.start(), el.dial.pause(), el.dial.running(), el.dial.speed(30)   events: "state", "done"
 * Canvas rules: sized to the element and devicePixelRatio (max 2), redrawn on resize, the loop stops off
 * screen, in a hidden tab and when nothing moves; fixed pools, no allocation per frame.
 * Reduced motion: no tail motion or sparks; the dial redraws twice a second while it counts.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TAU = Math.PI * 2, NT = 26, NS = 48;

  function setup(el) {
    if (el.dial) return;
    var canvas = el.querySelector("canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var timeEl = el.querySelector(".cd-time");
    var MAX = +el.dataset.max || 60;
    var rem = Math.max(0, Math.min(MAX, +el.dataset.value || 0)) * 60;   // seconds left while no clock runs
    var clock = null, clockFrom = 0, rate = 1;
    var shown = rem / 60, tail = 0.2, dir = 1, emit = 0;
    var dragging = false, dragM = 0, lastP = 0, pid = null;
    var W = 0, H = 0, dpr = 1, col = {}, face = document.createElement("canvas"), glow = document.createElement("canvas");
    var raf = 0, lastT = 0, inView = true, slow = 0, lastText = "";
    var sparks = [];
    for (var i = 0; i < NS; i++) sparks.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0 });

    function left() { return clock && clock.currentTime != null ? Math.max(0, clockFrom - clock.currentTime * rate / 1000) : rem; }
    function running() { return !!clock && clock.playState === "running"; }
    function startClock() {
      clockFrom = rem;
      clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: rem * 1000 / rate, easing: "linear" });
      clock.id = "comet-dial";
      clock.onfinish = done;
    }
    function drop() { if (clock) { clock.onfinish = null; clock.cancel(); clock = null; } }
    function setLeft(s) { var go = running(); rem = left(); drop(); rem = Math.max(0, Math.min(MAX * 60, s)); if (go && rem > 0) startClock(); state(); }
    function start() { if (running()) return; rem = left(); if (rem <= 0) return; if (clock) clock.play(); else startClock(); state(); }
    function pause() { if (clock && running()) clock.pause(); state(); }
    function speed(s) { var go = running(); rem = left(); drop(); rate = s || 1; if (go) startClock(); state(); }
    function done() {
      clock = null; rem = 0;
      if (!reduce.matches) burst();
      state();
      el.dispatchEvent(new Event("done"));
    }
    function state() {
      aria();
      el.classList.toggle("is-running", running());
      el.classList.toggle("is-done", left() <= 0);
      el.dispatchEvent(new Event("state"));
      kick();
    }
    function aria() {
      var s = Math.ceil(left()), m = Math.floor(s / 60), r = s % 60;
      el.setAttribute("aria-valuenow", Math.ceil(s / 60));
      el.setAttribute("aria-valuetext", s ? m + " minutes" + (r ? " " + r + " seconds" : "") + " left" : "Done");
    }

    function readColors() {
      var cs = getComputedStyle(el);
      ["--cd-ink", "--cd-face", "--cd-track", "--cd-tick", "--cd-text"].forEach(function (k) { col[k] = cs.getPropertyValue(k).trim(); });
    }
    // the still parts (track, minute ticks, numbers) are drawn once per size into a cache
    function fit() {
      var r = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = face.width = Math.round(W * dpr); canvas.height = face.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      var f = face.getContext("2d"), R = rad();
      f.setTransform(dpr, 0, 0, dpr, 0, 0);
      f.clearRect(0, 0, W, H);
      f.strokeStyle = col["--cd-track"]; f.lineWidth = 5;
      f.beginPath(); f.arc(W / 2, H / 2, R, 0, TAU); f.stroke();
      f.strokeStyle = col["--cd-tick"]; f.lineCap = "round";
      f.beginPath();
      for (var k = 0; k < MAX; k++) {
        var a = ang(k), big = k % 5 === 0, r1 = R - 9, r2 = R - (big ? 17 : 12);
        f.moveTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1);
        f.lineTo(W / 2 + Math.cos(a) * r2, H / 2 + Math.sin(a) * r2);
      }
      f.lineWidth = 1.5; f.stroke();
      f.fillStyle = col["--cd-tick"]; f.textAlign = "center"; f.textBaseline = "middle";
      f.font = "600 " + Math.max(10, Math.round(R * 0.09)) + "px " + getComputedStyle(el).fontFamily;
      if (R >= 100) for (k = 0; k < MAX; k += 10) { var b = ang(k); f.fillText(String(k), W / 2 + Math.cos(b) * (R - 30), H / 2 + Math.sin(b) * (R - 30)); }
      var g = Math.round(44 * dpr), gx = glow.getContext("2d");
      glow.width = glow.height = g;
      var grd = gx.createRadialGradient(g / 2, g / 2, 0, g / 2, g / 2, g / 2);
      grd.addColorStop(0, col["--cd-ink"]); grd.addColorStop(1, "rgba(0,0,0,0)");
      gx.fillStyle = grd; gx.fillRect(0, 0, g, g);
      draw();
    }
    function rad() { return Math.min(W, H) / 2 - 20; }
    function ang(m) { return -Math.PI / 2 + m / MAX * TAU; }

    function draw() {
      if (!W) return;
      var cx = W / 2, cy = H / 2, R = rad(), a = ang(shown), hx = cx + Math.cos(a) * R, hy = cy + Math.sin(a) * R;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.drawImage(face, 0, 0, W, H);
      if (shown > 0.001) {
        ctx.strokeStyle = col["--cd-ink"]; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(cx, cy, R, ang(0), a); ctx.stroke();
      }
      // the tail: shrinking, fading beads along the ring behind the head
      ctx.fillStyle = col["--cd-ink"];
      for (var i = NT; i >= 1; i--) {
        var f = 1 - i / NT, b = a + dir * tail * (i / NT);
        ctx.globalAlpha = Math.pow(f, 1.6) * 0.85;
        ctx.beginPath(); ctx.arc(cx + Math.cos(b) * R, cy + Math.sin(b) * R, 1 + 4.5 * f, 0, TAU); ctx.fill();
      }
      for (i = 0; i < NS; i++) {
        var s = sparks[i];
        if (s.life <= 0) continue;
        ctx.globalAlpha = Math.min(1, s.life * 1.4);
        ctx.beginPath(); ctx.arc(s.x, s.y, 0.6 + 1.6 * s.life, 0, TAU); ctx.fill();
      }
      var gs = 44;
      ctx.globalAlpha = 0.9; ctx.drawImage(glow, hx - gs / 2, hy - gs / 2, gs, gs);
      ctx.globalAlpha = 1; ctx.fillStyle = col["--cd-text"];
      ctx.beginPath(); ctx.arc(hx, hy, 4, 0, TAU); ctx.fill();
      readout();
    }
    function readout() {
      var s = Math.ceil(dragging ? Math.round(dragM) * 60 : left());
      var t = s ? Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2) : "Done";
      if (t !== lastText && timeEl) { timeEl.textContent = t; lastText = t; }
    }
    function spark(x, y, vx, vy, life) {
      for (var i = 0; i < NS; i++) if (sparks[i].life <= 0) { var s = sparks[i]; s.x = x; s.y = y; s.vx = vx; s.vy = vy; s.life = life; return; }
    }
    function burst() {
      var R = rad(), x = W / 2, y = H / 2 - R;
      for (var i = 0; i < 30; i++) { var q = i / 30 * TAU, v = 40 + (i % 5) * 18; spark(x, y, Math.cos(q) * v, Math.sin(q) * v, 1); }
    }

    function frame(t) {
      raf = 0;
      var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 1 / 60;
      lastT = t;
      var go = running(), target = dragging ? dragM : left() / 60, prev = shown;
      shown += (target - shown) * (1 - Math.exp(-dt * 16));
      if (Math.abs(target - shown) < 0.0005) shown = target;
      var v = (shown - prev) / dt;                                      // minutes a second
      if (go) dir = 1; else if (Math.abs(v) > 0.3) dir = v > 0 ? -1 : 1;  // the tail trails the motion
      var want = (go ? 0.55 : 0.16) + Math.min(1.5, Math.abs(v) * 0.05 + (go ? rate * 0.004 : 0));
      tail += (want - tail) * (1 - Math.exp(-dt * 6));
      var R = rad(), a = ang(shown), hx = W / 2 + Math.cos(a) * R, hy = H / 2 + Math.sin(a) * R;
      emit += dt * (go ? 12 : 0) + dt * Math.min(40, Math.abs(v) * 0.6);
      while (emit >= 1) {
        emit -= 1;
        var tx = -Math.sin(a) * dir, ty = Math.cos(a) * dir, sp = 18 + Math.random() * 26, out = (Math.random() - 0.3) * 16;
        spark(hx, hy, tx * sp + Math.cos(a) * out, ty * sp + Math.sin(a) * out, 0.6 + Math.random() * 0.4);
      }
      var alive = 0;
      for (var i = 0; i < NS; i++) {
        var s = sparks[i];
        if (s.life <= 0) continue;
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.97; s.vy *= 0.97; s.life -= dt * 1.25;
        if (s.life > 0) alive++;
      }
      draw();
      if (go || dragging || shown !== target || Math.abs(want - tail) > 0.01 || alive) kick();
      else lastT = 0;
    }
    function kick() {
      if (reduce.matches) {
        shown = dragging ? Math.round(dragM) : left() / 60; tail = 0.16;
        draw();
        if (running() && !slow) slow = setInterval(function () { if (!running()) { clearInterval(slow); slow = 0; } kick(); }, 500);
        return;
      }
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(frame);
    }

    // turning: the dial follows the change in the pointer's angle, not its absolute position
    function pointerM(e) {
      var r = el.getBoundingClientRect();
      var q = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2);
      return ((q + Math.PI / 2 + TAU) % TAU) / TAU * MAX;
    }
    el.addEventListener("pointerdown", function (e) {
      if (pid !== null) return;
      pid = e.pointerId; el.setPointerCapture(pid);
      dragging = true; dragM = left() / 60; lastP = pointerM(e);
      el.classList.add("is-dragging");
      el.focus({ preventScroll: true });
      kick();
    });
    el.addEventListener("pointermove", function (e) {
      if (e.pointerId !== pid) return;
      var p = pointerM(e), d = p - lastP;
      if (d > MAX / 2) d -= MAX; else if (d < -MAX / 2) d += MAX;
      lastP = p;
      dragM = Math.max(0, Math.min(MAX, dragM + d));
      var whole = Math.round(dragM) * 60;
      if (Math.abs(whole - left()) >= 1) setLeft(whole);
      kick();
    });
    function up(e) {
      if (e.pointerId !== pid) return;
      pid = null; dragging = false;
      el.classList.remove("is-dragging");
      setLeft(Math.round(dragM) * 60);
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", function (e) {
      var m = Math.ceil(left() / 60), to = null;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") to = Math.floor(left() / 60) + 1;
      else if (e.key === "ArrowDown" || e.key === "ArrowLeft") to = Math.ceil(left() / 60 - 1e-6) - 1;
      else if (e.key === "PageUp") to = m + 5;
      else if (e.key === "PageDown") to = m - 5;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = MAX;
      if (to === null) return;
      e.preventDefault();
      setLeft(Math.max(0, Math.min(MAX, to)) * 60);
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });

    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(el);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (inView) kick(); }).observe(el);
    document.addEventListener("visibilitychange", function () { lastT = 0; if (!document.hidden) kick(); });
    reduce.addEventListener && reduce.addEventListener("change", kick);
    el.dial = { start: start, pause: pause, running: running, speed: speed, left: left };
    fit();
    aria();
  }

  function init() { document.querySelectorAll(".comet-dial").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
