/*
 * parcel-open.js: sets the .parcel down and opens it when it scrolls into view, and again on
 * el.parcel.open().
 *
 * 1. Set down: the box falls the last 40 px under gravity, bounces once at a fifth of the speed it
 *    hit with, and its contact shadow tightens, darkens and sharpens as the gap closes. A
 *    "parceldelivered" event fires on the element the moment it touches down.
 * 2. The knife line runs along the seam and the tape splits.
 * 3. Each flap turns about its own crease. Its angle follows a damped spring (it swings past where it
 *    will rest and comes back, as a flap does when it falls open on a springy crease); the long
 *    outer flaps go first, then the short inner ones. The flap's outside and inside are shaded every
 *    frame from their real normals against one fixed light.
 * Everything is Web Animations keyframes sampled 60 times a second, so it shows on a timeline.
 * A "parcelopened" event fires when the last flap settles.
 */
(function () {
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var L = norm([-0.5, -0.75, 0.45]);

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function f(x) { return +x.toFixed(3); }
  // world normal of a flap's outside, for a flap turned phi about the vertical and opened theta
  function outside(phi, theta) {
    // outside points up when closed; opening tips it about the crease (local x), then the flap's own heading
    var t = theta * RAD, p = phi * RAD;
    var n = [0, -Math.cos(t), Math.sin(t)];               // rotateX(-theta) applied to (0, -1, 0)
    return [n[0] * Math.cos(p) + n[2] * Math.sin(p), n[1], -n[0] * Math.sin(p) + n[2] * Math.cos(p)];
  }
  function lit(n) { return Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]); }
  function spring(target, u) {
    var w = 2 * Math.PI * 1.55, z = 0.5, wd = w * Math.sqrt(1 - z * z);
    return target * (1 - Math.exp(-z * w * u) * (Math.cos(wd * u) + (z * w / wd) * Math.sin(wd * u)));
  }

  function setup(el) {
    if (el.parcel) return;
    var box = el.querySelector(".parcel-box");
    var shadow = el.querySelector(".parcel-shadow");
    var cut = el.querySelector(".parcel-cut");
    var cs = getComputedStyle(el);
    var W = parseFloat(cs.getPropertyValue("--pw")) || 200, D = parseFloat(cs.getPropertyValue("--pd")) || 150, H = parseFloat(cs.getPropertyValue("--ph")) || 116;
    var flaps = [
      { cls: "front", at: [0, -H - 1.2, D / 2], phi: 0, open: 122, start: 0.85 },
      { cls: "back", at: [0, -H - 1.2, -D / 2], phi: 180, open: 114, start: 0.97 },
      { cls: "left", at: [-W / 2, -H, 0], phi: -90, open: 106, start: 1.27 },
      { cls: "right", at: [W / 2, -H, 0], phi: 90, open: 110, start: 1.36 }
    ].map(function (F) {
      F.el = el.querySelector(".flap-" + F.cls);
      F.inside = F.el && F.el.querySelector(".flap-in");
      F.out = F.el && F.el.querySelector(".flap-out");
      return F;
    }).filter(function (F) { return F.el; });

    function pose(F, theta) {
      var n = outside(F.phi, theta);
      return {
        transform: "translate3d(" + F.at.map(function (v) { return f(v) + "px"; }).join(",") + ") rotateY(" + F.phi + "deg) rotateX(" + f(-theta) + "deg)",
        out: "brightness(" + f(0.5 + 0.6 * lit(n)) + ")",
        inside: "brightness(" + f(0.5 + 0.6 * lit([-n[0], -n[1], -n[2]])) + ")"
      };
    }
    function hold(open) {
      flaps.forEach(function (F) {
        var p = pose(F, open ? F.open : 0);
        F.el.style.transform = p.transform;
        if (F.out) F.out.style.filter = p.out;
        if (F.inside) F.inside.style.filter = p.inside;
      });
    }

    var anims = [], timer = 0;
    function play() {
      anims.forEach(function (a) { a.cancel(); }); anims = [];
      clearTimeout(timer);
      el.classList.add("is-open");
      if (reduce.matches || !el.animate) {
        hold(true);
        el.dispatchEvent(new CustomEvent("parceldelivered"));
        el.dispatchEvent(new CustomEvent("parcelopened"));
        return;
      }
      var T = 2.4, steps = Math.round(T * 60);
      var g = 2600, h0 = 40, tFall = Math.sqrt(2 * h0 / g), vUp = g * tFall * 0.2;
      var bf = [], sf = [], cf = [];
      flaps.forEach(function (F) { F.k = { t: [], o: [], i: [] }; });
      for (var k = 0; k <= steps; k++) {
        var t = (k / steps) * T, off = k / steps, h;
        // set down
        if (t < tFall) h = h0 - 0.5 * g * t * t;
        else { var q = t - tFall; h = Math.max(0, vUp * q - 0.5 * g * q * q); }
        bf.push({ transform: "translateY(" + f(-h) + "px)", offset: off });
        sf.push({ transform: "rotateX(90deg) translateZ(.5px) scale(" + f(1 + h / 120) + ")", opacity: f(0.35 + 0.65 * (1 - h / h0)), filter: "blur(" + f(4 + h * 0.25) + "px)", offset: off });
        // the knife line, then it is gone as the flaps part
        var c = Math.min(1, Math.max(0, (t - 0.5) / 0.32));
        c = c * c * (3 - 2 * c);
        cf.push({ transform: "translateY(" + f(-H - 1.6) + "px) rotateX(90deg) scaleX(" + f(c) + ")", opacity: t < 0.5 ? 0 : t < 0.9 ? 1 : Math.max(0, 1 - (t - 0.9) / 0.12), offset: off });
        flaps.forEach(function (F) {
          var p = pose(F, t <= F.start ? 0 : spring(F.open, t - F.start));
          F.k.t.push({ transform: p.transform, offset: off });
          F.k.o.push({ filter: p.out, offset: off });
          F.k.i.push({ filter: p.inside, offset: off });
        });
      }
      var opts = { duration: T * 1000, easing: "linear", fill: "both" };
      if (box) anims.push(box.animate(bf, opts));
      if (shadow) anims.push(shadow.animate(sf, opts));
      if (cut) anims.push(cut.animate(cf, opts));
      flaps.forEach(function (F) {
        anims.push(F.el.animate(F.k.t, opts));
        if (F.out) anims.push(F.out.animate(F.k.o, opts));
        if (F.inside) anims.push(F.inside.animate(F.k.i, opts));
      });
      timer = setTimeout(function () { el.dispatchEvent(new CustomEvent("parceldelivered")); }, tFall * 1000);
      anims[0].finished.then(function () {
        hold(true);
        anims.forEach(function (a) { a.cancel(); }); anims = [];
        el.dispatchEvent(new CustomEvent("parcelopened"));
      }, function () {});
    }

    el.parcel = { open: play };
    hold(reduce.matches);
    if (!("IntersectionObserver" in window)) { play(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); setTimeout(play, 300); }
    }, { threshold: 0.4 });
    io.observe(el);
  }

  function init() { document.querySelectorAll(".parcel").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
