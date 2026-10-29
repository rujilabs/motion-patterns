/*
 * dice-roll.js: throws the die in a .dice-tray and lands it on the number you rolled.
 *
 * The throw is worked out backwards from where it ends. First the die's resting orientation is set
 * with the rolled face pointing up and its edges square to the direction of travel. Every earlier
 * moment is that orientation turned back about the rolling axis, so it can only ever come to rest
 * on the rolled face. The roll itself is a cube tipping edge over edge: its centre swings round the
 * edge it pivots on, rising and falling, and travels exactly one edge length per quarter turn. Before
 * that it falls, strikes the felt on a corner, bounces once and lands flat. At the end it has a
 * little speed left, tips onto its leading edge and rocks back down. The height at every moment is
 * the height that keeps its lowest corner on the felt.
 *
 * The whole throw is sampled 60 times a second into Web Animations keyframes: the die's matrix, a
 * brightness for each face from its normal against one fixed light, and the contact shadow's place,
 * size, darkness and blur from the height. So it is light to run and shows on an animation timeline.
 *
 * tray.dice.roll() picks a fair number (crypto) and throws; tray.dice.roll(4) throws a 4. It returns
 * a promise for the number, and a "diceroll" event with detail.value fires on the tray when it rests.
 */
(function () {
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var LIGHT = norm([-0.45, -0.8, 0.4]);   // toward the light: above, left, a little in front (y points down)
  var UP = [0, -1, 0];
  // face normals on the die, and the number on each: opposite faces add up to 7
  var FACES = [
    { cls: "front", n: [0, 0, 1], v: 1 }, { cls: "back", n: [0, 0, -1], v: 6 },
    { cls: "top", n: [0, -1, 0], v: 2 }, { cls: "bottom", n: [0, 1, 0], v: 5 },
    { cls: "right", n: [1, 0, 0], v: 3 }, { cls: "left", n: [-1, 0, 0], v: 4 }
  ];

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function rot(ax, deg) {
    var a = norm(ax), x = a[0], y = a[1], z = a[2], r = deg * RAD, c = Math.cos(r), s = Math.sin(r), t = 1 - c;
    return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
  }
  function mul(A, B) {
    var C = new Array(9);
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
    return C;
  }
  function apply(M, n) { return [M[0] * n[0] + M[1] * n[1] + M[2] * n[2], M[3] * n[0] + M[4] * n[1] + M[5] * n[2], M[6] * n[0] + M[7] * n[1] + M[8] * n[2]]; }
  function f(x) { return +x.toFixed(4); }
  function css(M, p) {
    return "matrix3d(" + [M[0], M[3], M[6], 0, M[1], M[4], M[7], 0, M[2], M[5], M[8], 0, p[0], p[1], p[2], 1].map(f).join(",") + ")";
  }
  // how far the centre of a cube with half-edge r sits above the floor when its lowest corner touches it
  function rest(M, r) { return r * (Math.abs(M[3]) + Math.abs(M[4]) + Math.abs(M[5])); }
  // turn that brings the face with normal n to the top
  function align(n) {
    if (n[1] === -1) return rot([1, 0, 0], 0);
    if (n[1] === 1) return rot([1, 0, 0], 180);
    return rot(cross(n, UP), 90);
  }
  function fair() {
    if (window.crypto && crypto.getRandomValues) {
      var b = new Uint8Array(1);
      do { crypto.getRandomValues(b); } while (b[0] >= 252); // 252 = 6 x 42: no bias
      return (b[0] % 6) + 1;
    }
    return 1 + Math.floor(Math.random() * 6);
  }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function setup(tray) {
    if (tray.dice) return;
    var die = tray.querySelector(".die");
    var shadow = tray.querySelector(".dice-shadow");
    if (!die) return;
    var faces = FACES.map(function (F) { return { el: die.querySelector(".die-" + F.cls), n: F.n, v: F.v }; });
    var size = function () { return parseFloat(getComputedStyle(tray).getPropertyValue("--die")) || 56; };

    // where it rests now: matches the CSS no-script view (a one on top, turned 25 degrees)
    var state = { M: mul(rot([0, 1, 0], -25), rot([1, 0, 0], 90)), p: [0, 0, 0], yaw: 25 };
    var busy = false, anims = [];

    function shade(M) {
      return faces.map(function (F) {
        var n = apply(M, F.n);
        var lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
        return "brightness(" + f(0.5 + 0.6 * lit) + ")";
      });
    }
    function shadowAt(p, h, yaw, r) {
      // the shadow falls away from the light, spreads and fades as the die rises
      var dx = h * 0.45, dz = -h * 0.4, k = 1 + h / (r * 5);
      return {
        transform: "translate(" + f(p[0] + dx) + "px," + f(p[2] + dz) + "px) translateZ(.5px) rotate(" + f(yaw) + "deg) scale(" + f(k) + ")",
        opacity: f(Math.max(0.15, 1 - h / (r * 7))),
        filter: "blur(" + f(2.5 + h * 0.1) + "px)"
      };
    }
    function place(M, p, yaw) {
      var r = size() / 2, h = rest(M, r);
      die.style.transform = css(M, [p[0], -h, p[2]]);
      var sh = shade(M);
      faces.forEach(function (F, i) { if (F.el) F.el.style.filter = sh[i]; });
      if (shadow) { var s = shadowAt(p, h - r, yaw, r); shadow.style.transform = s.transform; shadow.style.opacity = s.opacity; shadow.style.filter = s.filter; }
    }

    function plan(value) {
      var s = size(), r = s / 2;
      var face = FACES.filter(function (F) { return F.v === value; })[0];
      var w = tray.clientWidth, d = tray.clientHeight;
      // travel right to left across the felt, at a slightly different angle each throw
      var theta = 180 + rand(-16, 16);                         // direction of travel on the floor
      var dir = [Math.cos(theta * RAD), 0, Math.sin(theta * RAD)];
      var axis = cross(dir, [0, 1, 0]);                         // rolling forward turns about this
      var N = w < 380 || Math.random() < 0.5 ? 2 : 3;          // quarter turns along the felt
      var A = N * 90;
      var end = [rand(-0.2, -0.05) * w, 0, rand(-0.06, 0.12) * d];
      // resting orientation: rolled face up, edges square to the travel, any quarter turn about the vertical
      var Mend = mul(rot([0, 1, 0], -theta + 90 * Math.floor(Math.random() * 4)), align(face.n));
      var yawEnd = theta;

      // timing, in seconds
      var tHit = 0.28, tLand = 0.6, tRoll = 0.6 + (N === 3 ? 1.0 : 0.82);
      var vEnd = 200;                                           // degrees a second left when the last quarter lands
      var v0 = 2 * A / (tRoll - tLand) - vEnd;                  // steady slowing from v0 to vEnd
      var dec = (v0 - vEnd) / (tRoll - tLand);
      var w0 = 2 * Math.PI * 2.6, damp = 7;                     // the rock: about 2.6 swings a second
      var T = tRoll + 0.62;
      var g = 4300, e = 0.55;                                   // gravity in px/s/s and the bounce
      var speed = v0 / 90 * s;                                  // floor speed while airborne, px/s
      var spinB = rand(160, 260) * (Math.random() < 0.5 ? -1 : 1), spinC = rand(-120, 120);

      // where the centre is along the travel, from the angle rolled (the edge-over-edge swing)
      function along(a) {
        var n = Math.floor(a / 90), phi = (a - n * 90) * RAD;
        return s * n + r * (Math.sin(phi) - Math.cos(phi)) + r;
      }
      function angleAt(t) {
        if (t <= tLand) return v0 * (t - tLand);
        if (t <= tRoll) { var u = t - tLand; return v0 * u - 0.5 * dec * u * u; }
        var q = t - tRoll; // past the last edge: it tips onto the next one and rocks back
        return A + (vEnd / w0) * Math.exp(-damp * q) * Math.sin(w0 * q);
      }
      function orient(t) {
        var a = angleAt(t);
        var M = mul(rot(axis, a - A), Mend);
        if (t < tLand) {
          var k = (tLand - t) / tLand;
          M = mul(rot([0, 1, 0], spinC * k * k), mul(rot(dir, spinB * k * k), M));
        }
        return { M: M, a: a };
      }
      var Mhit = orient(tHit).M, hHit = rest(Mhit, r);
      var T2 = tLand - tHit;
      var v2 = (r - hHit + 0.5 * g * T2 * T2) / T2, v1 = v2 / e;
      // keep the first bounce on the felt: pull the end point left if the throw would start too far right
      end[0] = Math.min(end[0], 0.34 * w - along(A) - speed * (tLand - tHit));
      var start = [end[0] - dir[0] * (along(A) + speed * tLand), 0, end[2] - dir[2] * (along(A) + speed * tLand)];

      var frames = { die: [], shadow: [] };
      faces.forEach(function (F) { F.frames = []; });
      var steps = Math.round(T * 60);
      for (var i = 0; i <= steps; i++) {
        var t = (i / steps) * T, o = orient(t), M = o.M;
        var low = rest(M, r), h, u;
        if (t < tHit) { var b = tHit - t; h = Math.max(low, hHit + v1 * b - 0.5 * g * b * b); }
        else if (t < tLand) { var c = t - tHit; h = Math.max(low, hHit + v2 * c - 0.5 * g * c * c); }
        else h = low;
        if (t < tLand) u = speed * t;
        else u = speed * tLand + along(Math.max(0, o.a));
        var p = [start[0] + dir[0] * u, 0, start[2] + dir[2] * u];
        var off = i / steps;
        frames.die.push({ transform: css(M, [p[0], -h, p[2]]), offset: off });
        var sh = shade(M);
        faces.forEach(function (F, j) { F.frames.push({ filter: sh[j], offset: off }); });
        var spin = t < tLand ? yawEnd + spinC * Math.pow((tLand - t) / tLand, 2) : yawEnd;
        var sd = shadowAt(p, h - r, spin, r);
        sd.offset = off;
        frames.shadow.push(sd);
      }
      return { frames: frames, ms: T * 1000, M: Mend, p: end, yaw: yawEnd };
    }

    function clear() { anims.forEach(function (a) { a.cancel(); }); anims = []; }

    function roll(value) {
      if (busy) return Promise.resolve(null);
      value = value >= 1 && value <= 6 ? Math.round(value) : fair();
      var throwPlan = plan(value);
      clear();
      if (reduce.matches || !die.animate) {
        state = { M: throwPlan.M, p: throwPlan.p, yaw: throwPlan.yaw };
        place(state.M, state.p, state.yaw);
        done(value);
        return Promise.resolve(value);
      }
      busy = true;
      tray.setAttribute("aria-busy", "true");
      var opts = { duration: throwPlan.ms, easing: "linear", fill: "both" };
      anims.push(die.animate(throwPlan.frames.die, opts));
      faces.forEach(function (F) { if (F.el) anims.push(F.el.animate(F.frames, opts)); });
      if (shadow) anims.push(shadow.animate(throwPlan.frames.shadow, opts));
      return anims[0].finished.then(function () {
        state = { M: throwPlan.M, p: throwPlan.p, yaw: throwPlan.yaw };
        place(state.M, state.p, state.yaw); // write the resting pose, then let the animations go
        clear();
        busy = false;
        tray.removeAttribute("aria-busy");
        done(value);
        return value;
      });
    }
    function done(value) {
      tray.setAttribute("data-value", String(value));
      tray.dispatchEvent(new CustomEvent("diceroll", { detail: { value: value } }));
    }

    tray.dice = { roll: roll, busy: function () { return busy; } };
    place(state.M, state.p, state.yaw);
  }

  function init() { document.querySelectorAll(".dice-tray").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
