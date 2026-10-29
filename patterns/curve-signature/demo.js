// Demo only: the consent form around the pad. The pad itself is signature.js.
// On load the pad holds a signature, written by a tablet at the front desk, so the first thing to try
// is Clear. The strokes below are that recording, kept as control points and replayed with pen timing.
(function () {
  var pad = document.getElementById("pad");
  var clear = document.getElementById("clear");
  var submit = document.getElementById("submit");
  var signed = document.getElementById("signed");
  var typeBtn = document.getElementById("type-instead");
  var typedRow = document.getElementById("typed-row");
  var typed = document.getElementById("typed");
  var MIN_INK = 120;  // px of ink before a signature counts

  // control points in a 400 by 110 box; the pen slows in tight turns and runs fast on straights
  var SIG = [
    [[14, 96], [20, 74], [28, 40], [33, 22], [38, 30], [47, 62], [56, 92], [61, 90], [66, 64], [72, 32], [79, 16], [84, 24]],
    [[92, 70], [100, 56], [94, 50], [86, 60], [90, 72], [100, 68], [106, 56], [108, 70], [114, 76], [120, 60], [123, 54], [124, 72], [130, 76],
     [136, 58], [140, 54], [142, 70], [146, 62], [152, 54], [158, 58], [158, 74], [164, 76], [174, 58], [182, 54], [174, 62], [176, 74], [186, 72], [194, 58], [196, 72], [204, 74]],
    [[121, 42], [123, 39]],
    [[40, 104], [110, 98], [200, 92], [268, 88], [300, 84], [288, 80]]
  ];
  function spline(pts) {
    var out = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      for (var s = 0; s < 10; s++) {
        var t = s / 10, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(function (k) {
          return 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
        }));
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }
  function written() {
    var w = pad.clientWidth, h = pad.clientHeight;
    var sc = Math.min((w - 70) / 330, (h - 24) / 115), ox = 44, oy = h - 40 - 100 * sc, t = 0;
    return SIG.map(function (pts, n) {
      var line = spline(pts), out = [];
      t += n ? 140 : 0;
      line.forEach(function (p, i) {
        if (i) {
          var a = line[i - 1], b = line[i + 1] || p;
          var turn = Math.abs(Math.atan2(b[1] - p[1], b[0] - p[0]) - Math.atan2(p[1] - a[1], p[0] - a[0]));
          if (turn > Math.PI) turn = 2 * Math.PI - turn;
          var ds = Math.hypot(p[0] - a[0], p[1] - a[1]) * sc;
          var speed = (n === 3 ? 2.6 : 1.5) / (1 + turn * 6);   // px per ms; the underline is a fast flick
          t += Math.max(1, ds / speed);
        }
        out.push([ox + p[0] * sc, oy + p[1] * sc, t]);
      });
      return out;
    });
  }

  function update() {
    var ok = pad.inkLength() >= MIN_INK || (!typedRow.hidden && typed.value.trim().length > 2);
    submit.disabled = !ok;
    clear.disabled = pad.isEmpty();
    pad.setAttribute("aria-label", pad.isEmpty() ? "Signature pad, empty" : "Signature pad, signed");
    signed.textContent = pad.isEmpty() ? "" : "Signed 3:47 pm, 29 Oct 2026";
  }
  pad.addEventListener("sign", update);
  pad.addEventListener("clear", update);
  clear.addEventListener("click", function () { clear.disabled = true; pad.clear(); });
  typeBtn.addEventListener("click", function () {
    typedRow.hidden = !typedRow.hidden;
    typeBtn.textContent = typedRow.hidden ? "Type instead" : "Draw instead";
    if (!typedRow.hidden) typed.focus();
    update();
  });
  typed.addEventListener("input", update);
  submit.addEventListener("click", function () { signed.textContent = "Sent to the clinic at 3:48 pm. A copy goes to your email."; submit.disabled = true; });

  pad.fromStrokes(written());
  update();
})();
