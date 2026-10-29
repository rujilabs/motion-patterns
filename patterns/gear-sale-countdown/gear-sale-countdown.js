/*
 * gear-sale-countdown.js: a countdown ticked by a clock escapement, one beat per second.
 *
 *   <div class="gear-sale-countdown" data-left="909">
 *     <svg class="gsc-works" aria-hidden="true"></svg>
 *     <p class="gsc-time" data-gsc-time>00:15:09</p>
 *   </div>
 *
 * The script draws a 30-tooth escape wheel and an anchor with a pendulum. Each second the pendulum
 * swings across, one pallet lifts off a tooth, the wheel drops half a tooth (6 degrees, so it turns
 * once a minute, like the seconds wheel of a real clock) and lands on the other pallet with a small
 * recoil. The digits change on that drop. At zero the anchor stops and the wheel stays locked.
 *
 *   el.gscPause() / el.gscPlay()   stop and restart the beat (anything ticking past 5 s needs a pause)
 *   el.gscSet(seconds)             jump to a new time left
 * Events on the element: "gsctick" (detail.left) every beat, "gscend" at zero.
 * Reduced motion: the digits and the wheel still step once a second, with no swing and no recoil.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var Z = 30, RA = 60, RF = 47, PIVOT = -98, SWING = 4.2, PALLET = 45; // pallets 45 deg either side of the top

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function P(R, deg) { var a = deg * Math.PI / 180; return (R * Math.cos(a)).toFixed(2) + " " + (R * Math.sin(a)).toFixed(2); }

  // Escape wheel: club-less ratchet teeth leaning the way it turns (clockwise), with four spokes.
  function wheelPath() {
    var pitch = 360 / Z, d = "";
    for (var j = 0; j < Z; j++) {
      var c = j * pitch;
      d += (j ? "L" : "M") + P(RF, c) + "L" + P(RA, c + 2) + "L" + P(RA - 0.6, c + 4.2) + "L" + P(RF + 2, c + pitch * 0.86) + "L" + P(RF, c + pitch * 0.94);
      d += "A" + RF + " " + RF + " 0 0 1 " + P(RF, c + pitch);
    }
    d += "Z";
    var rim = RF - 7, hub = 9;
    for (var s = 0; s < 4; s++) { // the four windows between spokes
      var a0 = s * 90 + 9, a1 = s * 90 + 81;
      d += "M" + P(hub + 4, a0 + 14) + "L" + P(rim, a0) + "A" + rim + " " + rim + " 0 0 1 " + P(rim, a1) + "L" + P(hub + 4, a1 - 14) + "Z";
    }
    return d + "M4 0A4 4 0 1 0 -4 0A4 4 0 1 0 4 0Z";
  }
  // Anchor: two arms from the pivot to two pallets whose tips reach in among the teeth.
  // Returns the arm path and the two pallet lines, in wheel coordinates.
  function anchorParts() {
    var tipR = (RA + RF) / 2 + 2, len = 15, parts = [];
    [-90 - PALLET, -90 + PALLET].forEach(function (deg) {
      var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      parts.push({ x1: tipR * c, y1: tipR * s, x2: (tipR + len) * c, y2: (tipR + len) * s });
    });
    var L = parts[0], R = parts[1];
    var arm = "M" + L.x2.toFixed(2) + " " + L.y2.toFixed(2) + "Q" + (L.x2 * 0.55).toFixed(2) + " " + (PIVOT + 6) + " 0 " + PIVOT +
      "Q" + (R.x2 * 0.55).toFixed(2) + " " + (PIVOT + 6) + " " + R.x2.toFixed(2) + " " + R.y2.toFixed(2);
    return { arm: arm, pallets: parts };
  }

  function setup(box) {
    var svg = box.querySelector(".gsc-works"), out = box.querySelector("[data-gsc-time]");
    svg.setAttribute("viewBox", "-78 -116 156 236");
    var pend = el("g", { transform: "translate(0 " + PIVOT + ")" }, svg);
    var swing = el("g", { "class": "gsc-swing" }, pend);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 196, "class": "gsc-rod" }, swing);
    el("circle", { cx: 0, cy: 196, r: 13, "class": "gsc-bob" }, swing);
    var wheelG = el("g", { "class": "gsc-wheel" }, svg);
    var wheel = el("path", { d: wheelPath(), "fill-rule": "evenodd" }, wheelG);
    el("circle", { r: 3, "class": "gsc-arbor" }, svg);
    var anchorWrap = el("g", { transform: "translate(0 " + PIVOT + ")" }, svg);
    var anchor = el("g", { "class": "gsc-anchor" }, anchorWrap);
    var parts = anchorParts(), body = el("g", { transform: "translate(0 " + (-PIVOT) + ")" }, anchor);
    el("path", { d: parts.arm, "class": "gsc-arm" }, body);
    parts.pallets.forEach(function (q) {
      el("line", { x1: q.x1.toFixed(2), y1: q.y1.toFixed(2), x2: q.x2.toFixed(2), y2: q.y2.toFixed(2), "class": "gsc-pallet" }, body);
    });
    el("circle", { cx: 0, cy: 0, r: 4.5, "class": "gsc-pivot" }, anchorWrap);

    var pending = 0, left = Math.max(0, Math.round(+box.dataset.left || 0)), beat = 0, timer = 0, running = false, next = 0;
    var swingEase = getComputedStyle(box).getPropertyValue("--ease-inout").trim() || "ease-in-out";
    var dropEase = getComputedStyle(box).getPropertyValue("--ease-spring").trim() || "ease-out";
    // wheel angle: a tooth face rests on the left pallet on even beats, on the right one on odd beats
    function wheelDeg(n) { return -90 - PALLET - 10 + n * 6; }
    function side(n) { return n % 2 ? SWING : -SWING; } // which pallet locks: + = right, - = left
    function show(v) {
      if (v == null) v = left;
      var h = Math.floor(v / 3600), m = Math.floor(v / 60) % 60, s = v % 60;
      out.textContent = [h, m, s].map(function (v) { return (v < 10 ? "0" : "") + v; }).join(":");
    }
    function place() {
      wheel.style.rotate = wheelDeg(beat) + "deg";
      anchor.style.rotate = swing.style.rotate = side(beat) + "deg";
    }
    function tick() {
      if (!running) return;
      var from = beat;
      beat++;
      left = Math.max(0, left - 1);
      var a0 = side(from), a1 = side(beat), w0 = wheelDeg(from), w1 = wheelDeg(beat);
      anchor.style.rotate = swing.style.rotate = a1 + "deg";
      wheel.style.rotate = w1 + "deg";
      if (!reduce.matches && wheel.animate) {
        [anchor, swing].forEach(function (p) {
          p.animate([{ rotate: a0 + "deg" }, { rotate: a1 + "deg" }], { duration: 980, easing: swingEase });
        });
        // the wheel waits on the old pallet, then drops half a tooth and recoils onto the new one
        var hold = [{ rotate: w0 + "deg", offset: 0 }, { rotate: w0 + "deg", offset: 0.42 }, { rotate: w1 + "deg", offset: 0.72 }, { rotate: w1 + "deg", offset: 1 }];
        try { hold[1].easing = dropEase; wheel.animate(hold, { duration: 1000 }); }
        catch (e) { hold[1].easing = "ease-out"; wheel.animate(hold, { duration: 1000 }); }
      }
      // the digits change on the drop, not on the swing
      var now = left;
      pending = setTimeout(function () {
        show(now);
        box.dispatchEvent(new CustomEvent("gsctick", { detail: { left: now } }));
        if (now === 0) { box.classList.add("is-ended"); box.dispatchEvent(new CustomEvent("gscend")); }
      }, reduce.matches ? 0 : 420);
      if (left === 0) { running = false; return; }
      next += 1000;
      timer = setTimeout(tick, Math.max(0, next - performance.now()));
    }
    box.gscPlay = function () {
      if (running || left === 0) return;
      running = true;
      next = performance.now() + 1000;
      timer = setTimeout(tick, 1000);
    };
    box.gscPause = function () { running = false; clearTimeout(timer); };
    box.gscSet = function (s) {
      clearTimeout(pending);
      left = Math.max(0, Math.round(s));
      box.classList.toggle("is-ended", left === 0);
      show();
    };
    place(); show();
    box.classList.add("is-ready");
  }

  function init() {
    document.querySelectorAll(".gear-sale-countdown").forEach(function (box) {
      setup(box);
      if (!box.hasAttribute("data-manual")) box.gscPlay();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
