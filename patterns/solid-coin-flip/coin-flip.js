/*
 * coin-flip.js: tosses the coin in a .coin-tray when it scrolls into view, and again on tray.coin.toss().
 *
 * The rim is built here: data-edges flat segments (default 32) standing round the edge, each with its
 * own outward normal. The toss is sampled 60 times a second into Web Animations keyframes:
 * - in the air the coin turns about one axis at a steady rate (two and a half turns, so it goes up
 *   showing its back and comes down showing its face) while its height follows a parabola;
 * - it lands still tilted a little and wobbles out like a spun coin: the tilt shrinks while the
 *   direction it leans swings round faster and faster, and the rim it rests on keeps its centre at
 *   the height that tilt allows, until it drops flat with a last quick rattle;
 * - every face and rim segment gets a brightness from its normal against one fixed light;
 * - the shadow is the coin's disc projected onto the surface along that same light (an affine
 *   matrix), so it thins to a line when the coin stands on edge, and it fades and blurs with height.
 * A "coinlanded" event fires on the tray when the coin comes to rest.
 */
(function () {
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var L = norm([-0.3, -0.42, 0.86]); // toward the light: left, toward the top of the screen, above (z is up off the surface)

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
  function css(M, z) { return "matrix3d(" + [M[0], M[3], M[6], 0, M[1], M[4], M[7], 0, M[2], M[5], M[8], 0, 0, 0, z, 1].map(f).join(",") + ")"; }
  function bright(M, n) { var w = apply(M, n); return "brightness(" + f(0.55 + 0.55 * Math.max(0, w[0] * L[0] + w[1] * L[1] + w[2] * L[2])) + ")"; }

  function setup(tray) {
    if (tray.coin) return;
    var coin = tray.querySelector(".coin");
    var shadow = tray.querySelector(".coin-shadow");
    if (!coin) return;
    var heads = coin.querySelector(".coin-heads"), tails = coin.querySelector(".coin-tails");
    var cs = getComputedStyle(tray);
    var D = parseFloat(cs.getPropertyValue("--coin")) || 124, T = parseFloat(cs.getPropertyValue("--coin-t")) || 9, R = D / 2;
    var N = parseInt(tray.getAttribute("data-edges"), 10) || 32;

    // the rim: N segments, each a little wider than its share so no seams show
    var edges = [];
    var w = 2 * R * Math.tan(Math.PI / N) + 0.8, inset = R * Math.cos(Math.PI / N);
    for (var i = 0; i < N; i++) {
      var a = (i + 0.5) * 360 / N, e = document.createElement("span");
      e.className = "coin-edge";
      e.style.width = f(w) + "px";
      e.style.left = f(-w / 2) + "px";
      e.style.top = f(-T / 2) + "px";
      e.style.transform = "rotateZ(" + f(a) + "deg) translateY(" + f(inset) + "px) rotateX(-90deg)";
      coin.appendChild(e);
      edges.push({ el: e, n: [-Math.sin(a * RAD), Math.cos(a * RAD), 0] });
    }
    var parts = [{ el: heads, n: [0, 0, 1] }, { el: tails, n: [0, 0, -1] }].concat(edges);

    function shadowFrame(M, z) {
      // project the disc's own axes onto the surface along the light
      var kx = L[0] / L[2], ky = L[1] / L[2];
      var ux = M[0] - M[6] * kx, uy = M[3] - M[6] * ky, vx = M[1] - M[7] * kx, vy = M[4] - M[7] * ky;
      var lift = Math.max(0, z - T / 2);
      return {
        transform: "matrix(" + [ux, uy, vx, vy, -z * kx, -z * ky].map(f).join(",") + ")",
        opacity: f(Math.max(0.2, 1 - lift / 260)),
        filter: "blur(" + f(1.5 + lift * 0.06) + "px)"
      };
    }
    function rest(back) {
      var M = rot([1, 0, 0], back ? 180 : 0);
      coin.style.transform = css(M, T / 2);
      parts.forEach(function (p) { if (p.el) p.el.style.filter = bright(M, p.n); });
      if (shadow) { var s = shadowFrame(M, T / 2); shadow.style.transform = s.transform; shadow.style.opacity = s.opacity; shadow.style.filter = s.filter; }
    }

    var anims = [];
    function toss() {
      anims.forEach(function (a) { a.cancel(); });
      anims = [];
      tray.classList.add("is-tossed");
      if (reduce.matches || !coin.animate) { rest(); tray.dispatchEvent(new CustomEvent("coinlanded")); return Promise.resolve(); }
      var g = 1100, tFly = 0.8, vz = g * tFly / 2;          // up and down again in tFly seconds
      var b0 = 13, turns = 900 - b0;                         // lands 13 degrees short of flat, after 2.5 turns
      var tWob = 1.05, W0 = 2 * Math.PI * 1.9;              // the wobble: starts at 1.9 swings a second
      var Ttot = tFly + tWob, steps = Math.round(Ttot * 60);
      var lean = 0, last = tFly;                             // direction the coin leans, integrated
      var cf = [], sf = [], pf = parts.map(function () { return []; });
      for (var k = 0; k <= steps; k++) {
        var t = (k / steps) * Ttot, M, z;
        if (t <= tFly) {
          M = rot([1, 0, 0], b0 + turns * (1 - t / tFly));
          var reach = R * Math.abs(M[7]) + (T / 2) * Math.abs(M[8]);   // lowest point of the rim below the centre
          z = Math.max(reach, T / 2 + vz * t - 0.5 * g * t * t);
        } else {
          var u = (t - tFly) / tWob;
          var b = b0 * Math.pow(Math.max(0, 1 - u), 0.6);             // the tilt shrinks
          var rate = W0 * Math.min(5, Math.sqrt(b0 / Math.max(b, 0.5))); // and the lean swings round faster
          lean += rate * (t - last);
          M = rot([Math.cos(lean), Math.sin(lean), 0], b);
          z = R * Math.sin(b * RAD) + (T / 2) * Math.cos(b * RAD);
        }
        last = t;
        var off = k / steps;
        cf.push({ transform: css(M, z), offset: off });
        parts.forEach(function (p, j) { pf[j].push({ filter: bright(M, p.n), offset: off }); });
        var s = shadowFrame(M, z); s.offset = off; sf.push(s);
      }
      var opts = { duration: Ttot * 1000, easing: "linear", fill: "both" };
      anims.push(coin.animate(cf, opts));
      parts.forEach(function (p, j) { if (p.el) anims.push(p.el.animate(pf[j], opts)); });
      if (shadow) anims.push(shadow.animate(sf, opts));
      return anims[0].finished.then(function () {
        rest();
        anims.forEach(function (a) { a.cancel(); });
        anims = [];
        tray.dispatchEvent(new CustomEvent("coinlanded"));
      }, function () {});
    }

    tray.coin = { toss: toss };
    rest(!reduce.matches); // waits back up until it is tossed
    if (!("IntersectionObserver" in window)) { toss(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); toss(); }
    }, { threshold: 0.4 });
    io.observe(tray);
  }

  function init() { document.querySelectorAll(".coin-tray").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
