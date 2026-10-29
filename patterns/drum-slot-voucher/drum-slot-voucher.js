/*
 * drum-slot-voucher.js: three (or more) reels on real 3D cylinders that spin and stop on a voucher code.
 * Each reel's values are faces on a closed ring (360 / n degrees apart). Pull the lever (drag the knob
 * down and let go, or press it with Enter or Space): every reel kicks back a little, runs up to speed,
 * then the reels brake one after another, left to right, and each lands past its row and settles back,
 * like a reel against its stopper. The spin is worked out in advance and played with element.animate().
 *
 *   <div class="slot" data-results="MILO 20 A7K; TEH 15 Q3R">
 *     <div class="reel"><ol class="reel-list"><li>KOPI</li><li>TEH</li>...</ol></div>
 *     ... more .reel
 *     <button class="slot-lever" type="button" aria-label="Pull the lever"><span class="lever-arm"><span class="lever-knob"></span></span></button>
 *   </div>
 *
 * data-results  the outcomes in order, one per spin, values separated by spaces; without it, random.
 * Events: "spinstart", then "spinend" with detail.values. slot.spin(strength 0..1) spins from script.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var css = getComputedStyle(document.documentElement);
  var SPRING = css.getPropertyValue("--ease-spring").trim() || "ease-out";
  var FPS = 60;
  function mod(a, n) { return ((a % n) + n) % n; }

  function Reel(el) {
    var lis = Array.prototype.slice.call(el.querySelectorAll(".reel-list > li"));
    var values = lis.map(function (li) { return li.textContent.trim(); });
    var n = values.length, step = 360 / n;
    var start = Math.max(0, lis.findIndex(function (li) { return li.classList.contains("is-on"); }));
    var cyl = document.createElement("div");
    cyl.className = "reel-cyl";
    cyl.setAttribute("aria-hidden", "true");
    var faces = values.map(function (v, i) {
      var f = document.createElement("span");
      f.className = "reel-face";
      f.textContent = v;
      cyl.appendChild(f);
      return f;
    });
    el.appendChild(cyl);
    var R = 0, pos = start, anim = null;
    function tf(p) { return "translateZ(" + (-R).toFixed(2) + "px) rotateX(" + (p * step).toFixed(3) + "deg)"; }
    function measure() {
      var h = faces[0].offsetHeight || 56;
      R = h / (2 * Math.tan(Math.PI / n));
      faces.forEach(function (f, i) { f.style.transform = "rotateX(" + (-i * step) + "deg) translateZ(" + R.toFixed(2) + "px)"; });
      cyl.style.transform = tf(pos);
    }
    measure();
    el.classList.add("is-ready");
    window.addEventListener("resize", measure);

    return {
      values: values,
      get value() { return values[mod(Math.round(pos), n)]; },
      // Plan the whole spin as position samples, then play them. Returns the duration in ms.
      spin: function (want, speed, stopAt) {
        var idx = values.indexOf(want);
        if (idx < 0) idx = Math.floor(Math.random() * n);
        if (anim) { anim.commitStyles && anim.commitStyles(); anim.cancel(); }
        if (reduce.matches) { pos = idx; cyl.style.transform = tf(pos); return 0; }
        var pts = [], p = pos, v = 0, t = 0, dt = 1 / FPS;
        // 1. a small kick back, then up to speed (rows per second)
        var p0 = pos;
        for (; t < 0.12; t += dt) pts.push(p0 - 0.22 * Math.sin(Math.PI / 2 * t / 0.12));
        p = p0 - 0.22;
        var ramp = 0.28;
        for (var u = 0; u < ramp; u += dt) { v = speed * (u / ramp); p += v * dt; pts.push(p); t += dt; }
        // 2. cruise until this reel's brake time
        v = speed;
        for (; t < stopAt; t += dt) { p += v * dt; pts.push(p); }
        // 3. brake onto the row: a cubic from (p, v) to (p1, v1), where v1 > 0 carries it a hair past the row
        var v1 = 3.2, p1 = p + speed * 0.32;
        p1 = Math.ceil(p1) + mod(idx - mod(Math.ceil(p1), n), n);
        var D = 2 * (p1 - p) / (speed + v1);
        for (var s = dt; s <= D + 1e-9; s += dt) {
          var x = s / D, x2 = x * x, x3 = x2 * x;
          pts.push((2 * x3 - 3 * x2 + 1) * p + (x3 - 2 * x2 + x) * D * speed + (-2 * x3 + 3 * x2) * p1 + (x3 - x2) * D * v1);
        }
        // 4. the stopper: an underdamped spring pulls it back onto the row
        var e = 0, w = 30, z = 0.42; v = v1;
        for (var k = 0; k < 0.5 * FPS; k++) {
          for (var q = 0; q < 4; q++) { v += (-2 * z * w * v - w * w * e) * dt / 4; e += v * dt / 4; }
          pts.push(p1 + e);
        }
        pts.push(p1);
        var frames = pts.map(function (pp) { return { transform: tf(pp) }; });
        pos = idx;
        anim = cyl.animate(frames, { duration: (pts.length - 1) * 1000 / FPS, easing: "linear", fill: "forwards" });
        anim.onfinish = function () { cyl.style.transform = tf(pos); anim.cancel(); anim = null; };
        return (pts.length - 1) * 1000 / FPS;
      }
    };
  }

  function Lever(btn, onPull) {
    var arm = btn.querySelector(".lever-arm"), knob = btn.querySelector(".lever-knob");
    var MAX = 150, angle = 0, dragging = false, moved = false, back = [];
    function set(a) {
      angle = a;
      arm.style.transform = "rotateX(" + a.toFixed(2) + "deg)";
      knob.style.transform = "rotateX(" + (-a).toFixed(2) + "deg) translateZ(16px)"; // the ball keeps facing you, in front of the rod
    }
    function springBack(from) {
      back.forEach(function (x) { x.cancel(); });
      set(0);
      if (reduce.matches || !arm.animate) return;
      var o = { duration: 760, easing: SPRING };
      back = [
        arm.animate([{ transform: "rotateX(" + from + "deg)" }, { transform: "rotateX(0deg)" }], o),
        knob.animate([{ transform: "rotateX(" + (-from) + "deg) translateZ(16px)" }, { transform: "rotateX(0deg) translateZ(16px)" }], o)
      ];
    }
    function geom() {
      var r = arm.getBoundingClientRect();
      return { pivot: r.bottom, L: arm.offsetHeight };
    }
    var g;
    function off() { return btn.getAttribute("aria-disabled") === "true"; } // stays focusable while the reels run
    btn.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || off()) return;
      back.forEach(function (x) { x.cancel(); });
      set(0);
      g = geom();
      dragging = true; moved = false;
      btn.setPointerCapture(e.pointerId);
      btn.classList.add("is-grabbed");
    });
    btn.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      // the knob sits on a circle round the pivot: its height on screen is L cos(angle)
      var c = Math.max(-1, Math.min(1, (g.pivot - e.clientY) / g.L));
      var a = Math.min(MAX, Math.acos(c) * 180 / Math.PI);
      if (a > 4) moved = true;
      set(a);
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      btn.classList.remove("is-grabbed");
      var a = angle;
      if (moved) {
        springBack(a);
        if (a > 70) onPull(a / MAX);
      }
    }
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", release);
    // Enter, Space or a plain click: a full pull, played
    btn.addEventListener("click", function (e) {
      if (moved) { moved = false; return; }
      if (off()) return;
      if (!reduce.matches && arm.animate) {
        var o = { duration: 900, easing: "linear" }, k = [0, 0.32, 1];
        back = [
          arm.animate([{ transform: "rotateX(0deg)", easing: css.getPropertyValue("--ease-in").trim() || "ease-in" }, { transform: "rotateX(140deg)", offset: k[1], easing: SPRING }, { transform: "rotateX(0deg)" }], o),
          knob.animate([{ transform: "rotateX(0deg) translateZ(16px)", easing: css.getPropertyValue("--ease-in").trim() || "ease-in" }, { transform: "rotateX(-140deg) translateZ(16px)", offset: k[1], easing: SPRING }, { transform: "rotateX(0deg) translateZ(16px)" }], o)
        ];
        setTimeout(function () { onPull(0.9); }, 290);
      } else onPull(0.9);
    });
  }

  function Slot(el) {
    var reels = Array.prototype.slice.call(el.querySelectorAll(".reel")).map(Reel);
    var results = (el.getAttribute("data-results") || "").split(";").map(function (s) { return s.trim().split(/\s+/); }).filter(function (r) { return r[0]; });
    var turn = 0, busy = false;
    var lever = el.querySelector(".slot-lever");
    function spin(strength) {
      if (busy) return;
      busy = true;
      if (lever) lever.setAttribute("aria-disabled", "true");
      var want = results.length ? results[turn++ % results.length] : [];
      var speed = 12 + 8 * Math.max(0, Math.min(1, strength == null ? 0.8 : strength));
      el.dispatchEvent(new CustomEvent("spinstart"));
      var longest = 0;
      reels.forEach(function (r, i) { longest = Math.max(longest, r.spin(want[i], speed, 0.95 + i * 0.5)); });
      setTimeout(function () {
        busy = false;
        if (lever) lever.removeAttribute("aria-disabled");
        el.dispatchEvent(new CustomEvent("spinend", { detail: { values: reels.map(function (r) { return r.value; }) } }));
      }, longest);
    }
    if (lever) Lever(lever, spin);
    el.spin = spin;
  }

  function init() { document.querySelectorAll(".slot").forEach(Slot); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
