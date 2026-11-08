/*
 * text-cursor-trail.js: in every .ctr, the items of .ctr-set follow the pointer in a line.
 * The first item eases toward the pointer (mouse, pen or a dragging finger). Each next item is held on
 * a string of data-trail-gap px (default 30) behind the one ahead: it only moves when pulled, so the
 * line keeps its shape when the hand stops, and each icon turns to face where it is going.
 * After 2 s with no pointer the leader walks a slow figure of eight (a Web Animations clock, so the
 * gallery timeline can pause it). A button with data-pause-for="<id of the .ctr>" pauses that walk.
 * Draws nothing while off screen or in a hidden tab. Off under reduced motion: the row stays still.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var IDLE_AFTER = 2000, LOOP = 11000;

  function setup(area) {
    var set = area.querySelector(".ctr-set");
    var items = set ? [].slice.call(set.children) : [];
    if (items.length < 2 || !Element.prototype.animate) return;
    var gap = parseFloat(area.getAttribute("data-trail-gap")) || 30;
    var spring = getComputedStyle(document.documentElement).getPropertyValue("--ease-spring").trim() || "ease-out";
    var N = items.length;
    var x = new Float32Array(N), y = new Float32Array(N), a = new Float32Array(N), size = new Float32Array(N);
    var w = 0, h = 0, tx = 0, ty = 0, lastMove = -1e9, raf = 0, seen = true, onScreen = true, paused = false, live = false;
    var clock = null;
    var btn = area.id ? document.querySelector('[data-pause-for="' + area.id + '"]') : null;

    function measure() {
      var b = area.getBoundingClientRect();
      w = b.width; h = b.height;
      for (var i = 0; i < N; i++) size[i] = items[i].offsetWidth || 30;
    }
    // the idle walk: a figure of eight across the middle of the area
    function idlePoint(ms) {
      var t = (ms % LOOP) / LOOP * Math.PI * 2;
      tx = w * (0.5 + 0.36 * Math.sin(t));
      ty = h * (0.52 + 0.26 * Math.sin(2 * t + 0.6));
    }
    function place() {
      for (var i = 0; i < N; i++) {
        var s = 1 - i * 0.035;
        items[i].style.transform = "translate(" + (x[i] - size[i] / 2).toFixed(1) + "px," + (y[i] - size[i] / 2).toFixed(1) +
          "px) rotate(" + a[i].toFixed(1) + "deg) scale(" + s.toFixed(3) + ")";
      }
    }
    var last = 0;
    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      var pointerOn = now - lastMove < IDLE_AFTER;
      if (!pointerOn && clock && clock.currentTime != null) idlePoint(clock.currentTime);
      var k = 1 - Math.pow(0.8, dt / 16.7);
      var moved = 0, dx = tx - x[0], dy = ty - y[0];
      x[0] += dx * k; y[0] += dy * k;
      moved = Math.abs(dx) + Math.abs(dy);
      if (moved > 0.4) a[0] += (wrap(Math.atan2(dy, dx) * 57.3 + 90 - a[0])) * 0.15;
      for (var i = 1; i < N; i++) {
        var ex = x[i] - x[i - 1], ey = y[i] - y[i - 1], d = Math.sqrt(ex * ex + ey * ey);
        if (d > gap) {
          x[i] = x[i - 1] + ex / d * gap; y[i] = y[i - 1] + ey / d * gap;
          a[i] += wrap(Math.atan2(-ey, -ex) * 57.3 + 90 - a[i]) * 0.2;
        }
      }
      place();
      // keep drawing while the walk runs or the line is still catching up
      var walking = !pointerOn && !paused;
      if (seen && (walking || pointerOn || moved > 0.3)) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function wrap(d) { return ((d + 540) % 360) - 180; }
    function kick() { if (live && seen && !raf) raf = requestAnimationFrame(frame); }

    function move(e) {
      if (!live) return;
      var b = area.getBoundingClientRect();
      tx = e.clientX - b.left; ty = e.clientY - b.top;
      lastMove = performance.now();
      kick();
    }

    function start() {
      measure();
      idlePoint(0);
      for (var i = 0; i < N; i++) { x[i] = tx - i * gap * 0.7; y[i] = ty + i * 2; a[i] = 90; }
      area.classList.add("ctr-live");
      clock = set.animate([{ opacity: 1 }, { opacity: 1 }], { duration: LOOP, iterations: Infinity });
      clock.id = "trail idle walk";
      if (paused) clock.pause();
      items.forEach(function (el, i) {
        el.firstElementChild.animate([{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
          { duration: 520, delay: 120 + i * 70, easing: spring, fill: "backwards" });
      });
      place();
      kick();
    }
    function stop() {
      if (clock) { clock.cancel(); clock = null; }
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      area.classList.remove("ctr-live");
      items.forEach(function (el) { el.style.transform = ""; });
    }
    function sync() {
      var want = !still.matches;
      if (want === live) return;
      live = want;
      if (live) start(); else stop();
    }

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerdown", move);
    if (window.ResizeObserver) new ResizeObserver(function () { measure(); kick(); }).observe(area);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; seen = onScreen && !document.hidden; kick(); }).observe(area);
    }
    document.addEventListener("visibilitychange", function () {
      seen = onScreen && !document.hidden;
      if (clock) { if (document.hidden) clock.pause(); else if (!paused) clock.play(); }
      kick();
    });
    if (btn) {
      btn.addEventListener("click", function () {
        paused = !paused;
        btn.setAttribute("aria-pressed", paused ? "true" : "false");
        if (clock) { if (paused) clock.pause(); else clock.play(); }
        kick();
      });
    }
    still.addEventListener("change", sync);
    sync();
  }

  function init() { document.querySelectorAll(".ctr").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
