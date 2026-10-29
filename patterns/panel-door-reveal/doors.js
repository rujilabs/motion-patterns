/*
 * doors.js: a pair of hinged doors in front of something you reveal. Each door turns about its
 * outer edge, toward you, on its own damped spring, so the second door follows the first a beat
 * late and both swing a little past their stop and settle, like heavy wood.
 *
 *   <div class="doorway">
 *     <div class="doorway-inside" id="code">What is revealed</div>
 *     <button class="doors" type="button" aria-expanded="false" aria-controls="code">
 *       <span class="doors-label">Open the doors</span>
 *       <span class="door door-l" aria-hidden="true">...faces...</span>
 *       <span class="door door-r" aria-hidden="true">...faces...</span>
 *     </button>
 *   </div>
 *
 * A click, Enter or Space opens or closes them. Drag a door sideways to swing it by hand; a
 * flick carries on. Sets --door-l and --door-r (0deg shut, data-open-angle open, default 104) on
 * the doorway, and fires "doorsopen" or "doorsclose" when they come to rest. While shut, the inside
 * is inert, so a screen reader only reaches it once the doors are open. Reduced motion: no swing.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var SWING = { w: 7.5, z: 0.5 };   // heavy: about 15 percent past, then settles
  var HAND = { w: 28, z: 1 };       // the door in your hand follows your hand
  var LAG = 90;                     // ms before the second door moves

  function Doorway(way) {
    var btn = way.querySelector(".doors");
    var inside = document.getElementById(btn.getAttribute("aria-controls"));
    var label = btn.querySelector(".doors-label");
    var OPEN = parseFloat(way.getAttribute("data-open-angle")) || 104;
    var open = btn.getAttribute("aria-expanded") === "true";
    var doors = {
      l: { a: open ? OPEN : 0, v: 0, target: open ? OPEN : 0, sp: SWING, at: 0 },
      r: { a: open ? OPEN : 0, v: 0, target: open ? OPEN : 0, sp: SWING, at: 0 }
    };
    var raf = 0, last = 0, drag = null, suppressClick = false;

    function paint() {
      way.style.setProperty("--door-l", doors.l.a.toFixed(2) + "deg");
      way.style.setProperty("--door-r", doors.r.a.toFixed(2) + "deg");
    }
    function sync() {
      btn.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Close the doors" : "Open the doors";
      if (inside) inside.inert = !open;
    }
    function frame(t) {
      var dt = Math.min(0.032, last ? (t - last) / 1000 : 1 / 60);
      last = t;
      var moving = false;
      ["l", "r"].forEach(function (k) {
        var d = doors[k];
        if (t < d.at) { moving = true; return; }
        var kk = d.sp.w * d.sp.w, c = 2 * d.sp.z * d.sp.w, q = dt / 4;
        for (var i = 0; i < 4; i++) { d.v += (-kk * (d.a - d.target) - c * d.v) * q; d.a += d.v * q; }
        if (Math.abs(d.a - d.target) > 0.05 || Math.abs(d.v) > 0.5) moving = true;
        else { d.a = d.target; d.v = 0; }
      });
      paint();
      if (moving || drag) { raf = requestAnimationFrame(frame); return; }
      raf = 0; last = 0;
      way.dispatchEvent(new CustomEvent(open ? "doorsopen" : "doorsclose"));
    }
    function run() { if (!raf) raf = requestAnimationFrame(frame); }
    // first: the door that moves first ("l" or "r"); v: a starting speed for each, in deg/s
    function set(next, first, vel) {
      open = next;
      sync();
      var to = open ? OPEN : 0;
      if (reduce.matches) {
        cancelAnimationFrame(raf); raf = 0;
        doors.l.a = doors.r.a = doors.l.target = doors.r.target = to;
        doors.l.v = doors.r.v = 0;
        paint();
        way.dispatchEvent(new CustomEvent(open ? "doorsopen" : "doorsclose"));
        return;
      }
      var now = performance.now(), lead = first || "l", other = lead === "l" ? "r" : "l";
      doors[lead].target = doors[other].target = to;
      doors[lead].sp = doors[other].sp = SWING;
      doors[lead].at = 0;
      doors[other].at = drag || vel ? 0 : now + LAG;
      if (vel) { doors[lead].v = vel[lead]; doors[other].v = vel[other]; }
      run();
    }

    btn.addEventListener("click", function () {
      if (suppressClick) { suppressClick = false; return; }
      set(!open);
    });

    // drag: the door you hold follows your hand, the other one is pulled along a beat behind
    btn.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      var r = btn.getBoundingClientRect();
      var side = e.clientX < r.left + r.width / 2 ? "l" : "r";
      drag = { side: side, x: e.clientX, a0: doors[side].a, moved: false, px: e.clientX, pt: e.timeStamp, v: 0, w: r.width / 2 };
      btn.setPointerCapture(e.pointerId);
    });
    btn.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 5) return;
      drag.moved = true;
      // pulling a door outward opens it: left door to the left, right door to the right
      var dir = drag.side === "l" ? -1 : 1, perDeg = drag.w / 90;
      var a = Math.max(-4, Math.min(OPEN + 8, drag.a0 + dir * dx / perDeg));
      var dt = (e.timeStamp - drag.pt) / 1000;
      if (dt > 0) drag.v = 0.6 * (dir * (e.clientX - drag.px) / perDeg / dt) + 0.4 * drag.v;
      drag.px = e.clientX; drag.pt = e.timeStamp;
      var held = doors[drag.side], other = doors[drag.side === "l" ? "r" : "l"];
      held.target = a; held.sp = HAND;
      other.target = a; other.sp = SWING; other.at = 0;
      run();
    });
    function release() {
      if (!drag) return;
      var d = drag;
      drag = null;
      if (!d.moved) return;
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 0);
      var held = doors[d.side], v = Math.max(-600, Math.min(600, d.v));
      var vel = {}; vel[d.side] = v; vel[d.side === "l" ? "r" : "l"] = doors[d.side === "l" ? "r" : "l"].v;
      set(held.a + v * 0.18 > OPEN / 2, d.side, vel);
    }
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", release);

    sync();
    paint();
    way.doors = { set: set, get open() { return open; } };
  }

  function init() { document.querySelectorAll(".doorway").forEach(function (w) { if (!w.doors) Doorway(w); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
