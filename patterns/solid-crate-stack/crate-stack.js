/*
 * crate-stack.js: drops crates into their slots in a .crate-bay.
 *
 * Each drop is real falling: height = h0 - g t^2 / 2 from rest, so a crate speeds up all the way
 * down. It falls a few degrees askew, so its low corner meets the surface first: the height at every
 * moment is the larger of the free fall and the height that keeps its lowest corner on the surface.
 * It leaves the surface again at 22% of the speed it hit with (one small bounce), and the tilt and
 * twist die away on the surface the way a heavy box squares up. The fall is sampled 60 times a
 * second into Web Animations keyframes for the crate, each face's brightness (its normal against one
 * fixed light) and its contact shadow, which darkens and sharpens as the gap closes.
 *
 * Crates with data-drop fall when the bay scrolls into view. bay.crates.add(n) drops the next n
 * hidden crates. A "cratelanded" event fires on the bay as each one hits, with detail.count = the
 * number of crates now in the bay.
 */
(function () {
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var LIGHT = norm([-0.5, -0.78, 0.38]);
  var FACES = { front: [0, 0, 1], back: [0, 0, -1], right: [1, 0, 0], left: [-1, 0, 0], top: [0, -1, 0] };
  var G = 2600, H0 = 260, BOUNCE = 0.22, GAP = 140; // px/s/s, drop height in px, restitution, ms between crates

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
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
  function css(M, p) { return "matrix3d(" + [M[0], M[3], M[6], 0, M[1], M[4], M[7], 0, M[2], M[5], M[8], 0, p[0], p[1], p[2], 1].map(f).join(",") + ")"; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function setup(bay) {
    if (bay.crates) return;
    var world = bay.querySelector(".crate-world");
    var all = Array.prototype.slice.call(bay.querySelectorAll(".crate"));
    var dims = function () {
      var cs = getComputedStyle(bay);
      return { w: parseFloat(cs.getPropertyValue("--cw")) || 70, h: parseFloat(cs.getPropertyValue("--ch")) || 50, d: parseFloat(cs.getPropertyValue("--cd")) || 58 };
    };
    function slot(i, D) {
      var col = i % 3, row = Math.floor(i / 3) % 2, layer = Math.floor(i / 6);
      return { x: (col - 1) * D.w, z: (row - 0.5) * D.d, base: layer * D.h, layer: layer };
    }
    // crates in the bay: the ones that never had to drop, plus every one that has landed
    function count() { return all.filter(function (c) { return !c.hidden && (c._landed || !c.classList.contains("is-in")); }).length; }

    function drop(crate, delay) {
      var i = all.indexOf(crate), D = dims(), s = slot(i, D);
      crate.hidden = false;
      crate.classList.add("is-in");
      if (reduce.matches || !crate.animate) { landed(crate); return; }
      var faces = {};
      Object.keys(FACES).forEach(function (k) { faces[k] = crate.querySelector(".crate-" + k); });
      var shadow = document.createElement("div");
      shadow.className = "crate-shadow";
      shadow.style.transform = "translate3d(" + s.x + "px," + (-s.base - 0.6) + "px," + s.z + "px) rotateX(90deg)";
      world.insertBefore(shadow, world.firstChild);

      var tilt = rand(4, 8) * (Math.random() < 0.5 ? -1 : 1), axis = [rand(-1, 1), 0, rand(-1, 1)], twist = rand(-9, 9);
      var tFall = Math.sqrt(2 * H0 / G), vHit = G * tFall, vUp = vHit * BOUNCE, T = tFall + 0.62;
      var half = function (M) { return (Math.abs(M[3]) * D.w + Math.abs(M[4]) * D.h + Math.abs(M[5]) * D.d) / 2; };
      function orient(t) {
        var k = 1;
        if (t > tFall) { var q = t - tFall; k = Math.exp(-11 * q) * Math.cos(26 * q); } // squares up on the surface
        return mul(rot([0, 1, 0], twist * (t > tFall ? Math.exp(-9 * (t - tFall)) : 1)), rot(axis, tilt * k));
      }
      var cf = [], sf = [], ff = {};
      Object.keys(FACES).forEach(function (k) { ff[k] = []; });
      var steps = Math.round(T * 60), hitAt = tFall;
      for (var n = 0; n <= steps; n++) {
        var t = (n / steps) * T, M = orient(t), low = half(M), y;
        if (t <= tFall) y = H0 - 0.5 * G * t * t;                   // height of the bottom above the surface, if it were level
        else { var q = t - tFall; y = Math.max(0, vUp * q - 0.5 * G * q * q); }
        var gap = y + D.h / 2;
        var h = Math.max(gap, low);                                   // centre height: never through the surface
        var off = n / steps;
        var frame = { transform: css(M, [s.x, -s.base - h, s.z]), offset: off, visibility: "visible" };
        if (n === 0) frame.visibility = "hidden";
        cf.push(frame);
        Object.keys(FACES).forEach(function (k) {
          var nn = apply(M, FACES[k]);
          ff[k].push({ filter: "brightness(" + f(0.52 + 0.55 * Math.max(0, nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2])) + ")", offset: off });
        });
        var g = h - D.h / 2, near = Math.max(0, 1 - g / H0);
        sf.push({ opacity: f(near * near), transform: "translate3d(" + s.x + "px," + (-s.base - 0.6) + "px," + s.z + "px) rotateX(90deg) scale(" + f(1 + g / 260) + ")", filter: "blur(" + f(1.5 + g * 0.05) + "px)", offset: off });
      }
      var opts = { duration: T * 1000, delay: delay, easing: "linear", fill: "backwards" };
      var a = crate.animate(cf, opts);
      Object.keys(FACES).forEach(function (k) { if (faces[k]) faces[k].animate(ff[k], opts); });
      shadow.animate(sf, opts);
      setTimeout(function () { landed(crate); }, delay + hitAt * 1000);
      a.finished.then(function () { shadow.remove(); });
    }
    function landed(crate) { crate._landed = true; bay.dispatchEvent(new CustomEvent("cratelanded", { detail: { count: count() } })); }

    function add(n) {
      var next = all.filter(function (c) { return c.hidden; }).slice(0, n);
      next.forEach(function (c, k) { drop(c, k * GAP); });
      return next.length;
    }
    function start() {
      all.filter(function (c) { return c.hasAttribute("data-drop") && !c.classList.contains("is-in"); })
        .forEach(function (c, k) { drop(c, k * GAP); });
      landedAll();
    }
    function landedAll() { bay.dispatchEvent(new CustomEvent("cratelanded", { detail: { count: count() } })); }
    bay.crates = { add: add, count: count, free: function () { return all.filter(function (c) { return c.hidden; }).length; } };

    if (!("IntersectionObserver" in window)) { start(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
    }, { threshold: 0.3 });
    io.observe(bay);
  }

  function init() { document.querySelectorAll(".crate-bay").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
