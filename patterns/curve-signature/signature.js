/*
 * signature.js: a signature pad whose ink thins with speed, like a pen, and a Clear that un-draws it.
 *   <div class="curve-signature" role="img" aria-label="Signature pad, empty"></div>
 * It puts a canvas inside the element. Each stroke is smoothed twice: the points are joined by
 * quadratic curves through their midpoints, and the width follows the pen speed through a low-pass
 * filter, so a fast flick runs thin, a slow turn pools wide, and the change between them is gradual,
 * the way pressure behaves. A pen with real pressure adds it on top. The ink is stamped as small round
 * dabs about every half pixel, so the width can change along a single curve.
 *   el.clear()          un-draws the ink, newest stroke first, each from its end back to its start
 *                       (returns a Promise); "clear" fires when it is empty
 *   el.isEmpty()        true when there is no ink
 *   el.toDataURL()      a PNG of the ink
 *   el.strokes          the strokes as [[x, y, ms], ...] in CSS px; el.fromStrokes(list) draws them back
 * "sign" fires when a stroke ends, with detail.length (px of ink) and detail.strokes.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var dark = window.matchMedia("(prefers-color-scheme: dark)");

  function setup(el) {
    if (el._sig) return;
    el._sig = true;
    var MIN = +el.dataset.minWidth || 0.9;     // px, at full speed
    var MAX = +el.dataset.maxWidth || 3.6;     // px, at rest
    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1;
    var strokes = [];        // { raw: [[x, y, t]], dabs: [x, y, r, x, y, r, ...] }
    var cur = null, undraw = 0;

    function ink() { return getComputedStyle(el).getPropertyValue("--sig-ink").trim() || "#1a2a6c"; }
    function size() {
      var r = el.getBoundingClientRect();
      dpr = Math.min(3, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(Infinity);
    }

    // a stroke in progress: filtered speed and width carried from point to point
    function begin(x, y, t, p) {
      cur = { raw: [[x, y, t]], dabs: [], pts: [{ x: x, y: y, w: width(0, p) }], v: 0, w: width(0, p) };
      cur.pts[0].w = cur.w;
      strokes.push(cur);
      dab(cur, x, y, cur.w / 2);
    }
    function width(v, p) {
      var w = MIN + (MAX - MIN) * Math.exp(-v * 0.9);            // v in px per ms
      if (p > 0 && p !== 0.5) w *= 0.55 + p * 0.9;               // a real pen adds its pressure
      return w;
    }
    function add(x, y, t, p) {
      var last = cur.raw[cur.raw.length - 1];
      var d = Math.hypot(x - last[0], y - last[1]);
      if (d < 1.2) return;
      var dt = Math.max(1, t - last[2]);
      cur.v = cur.v * 0.72 + (d / dt) * 0.28;                   // speed, low-passed
      cur.w = cur.w * 0.65 + width(cur.v, p) * 0.35;            // width eases toward the new target
      cur.raw.push([x, y, t]);
      cur.pts.push({ x: x, y: y, w: cur.w });
      var n = cur.pts.length;
      if (n < 3) { line(cur, cur.pts[0], cur.pts[1]); return; }
      // curve from the middle of the last segment to the middle of this one, bending through the shared point
      var a = cur.pts[n - 3], b = cur.pts[n - 2], c = cur.pts[n - 1];
      quad(cur, mid(a, b), b, mid(b, c));
    }
    function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: (a.w + b.w) / 2 }; }
    function line(s, a, b) { quad(s, a, mid(a, b), b); }
    function quad(s, a, c, b) {
      var len = Math.hypot(c.x - a.x, c.y - a.y) + Math.hypot(b.x - c.x, b.y - c.y);
      var n = Math.max(1, Math.ceil(len / 0.5));
      for (var i = 1; i <= n; i++) {
        var t = i / n, u = 1 - t;
        dab(s, u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y, (a.w + (b.w - a.w) * t) / 2);
      }
    }
    function dab(s, x, y, r) {
      s.dabs.push(x, y, r);
      ctx.fillStyle = ink();
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }
    function total() { return strokes.reduce(function (n, s) { return n + s.dabs.length / 3; }, 0); }
    // paint the first `upto` dabs, in drawing order
    function paint(upto) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = ink();
      ctx.beginPath();
      var k = 0;
      for (var i = 0; i < strokes.length && k < upto; i++) {
        var d = strokes[i].dabs;
        for (var j = 0; j < d.length && k < upto; j += 3, k++) { ctx.moveTo(d[j] + d[j + 2], d[j + 1]); ctx.arc(d[j], d[j + 1], d[j + 2], 0, 6.2832); }
      }
      ctx.fill();
    }
    function inkLength() {
      return Math.round(strokes.reduce(function (n, s) {
        for (var i = 1; i < s.raw.length; i++) n += Math.hypot(s.raw[i][0] - s.raw[i - 1][0], s.raw[i][1] - s.raw[i - 1][1]);
        return n;
      }, 0));
    }
    function status() {
      el.classList.toggle("is-signed", strokes.length > 0);
    }

    function point(e) { var r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, e.timeStamp, e.pointerType === "pen" ? e.pressure : 0]; }
    var drawing = null;
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || undraw) return;
      e.preventDefault();
      drawing = e.pointerId;
      el.setPointerCapture(e.pointerId);
      var p = point(e);
      begin(p[0], p[1], p[2], p[3]);
      el.classList.add("is-drawing");
    });
    el.addEventListener("pointermove", function (e) {
      if (drawing !== e.pointerId || !cur) return;
      // coalesced events: every sample the pointer gave, not one per frame, so fast flicks stay round
      var list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      if (!list.length) list = [e];
      list.forEach(function (c) { var p = point(c); add(p[0], p[1], p[2], p[3]); });
    });
    function end(e) {
      if (drawing !== e.pointerId) return;
      drawing = null;
      el.classList.remove("is-drawing");
      if (cur && cur.pts.length > 1) {
        // finish the tail: from the last midpoint to the last point
        var n = cur.pts.length;
        line(cur, mid(cur.pts[n - 2], cur.pts[n - 1]), cur.pts[n - 1]);
      }
      cur = null;
      status();
      el.dispatchEvent(new CustomEvent("sign", { bubbles: true, detail: { length: inkLength(), strokes: el.strokes } }));
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    Object.defineProperty(el, "strokes", { get: function () { return strokes.map(function (s) { return s.raw.map(function (p) { return [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10, Math.round(p[2])]; }); }); } });
    el.isEmpty = function () { return strokes.length === 0; };
    el.inkLength = inkLength;
    el.toDataURL = function () { return canvas.toDataURL("image/png"); };
    el.fromStrokes = function (list) {
      list.forEach(function (s) {
        begin(s[0][0], s[0][1], s[0][2], 0);
        for (var i = 1; i < s.length; i++) add(s[i][0], s[i][1], s[i][2], 0);
        var n = cur.pts.length;
        if (n > 1) line(cur, mid(cur.pts[n - 2], cur.pts[n - 1]), cur.pts[n - 1]);
        cur = null;
      });
      paint(Infinity);
      status();
    };
    // un-draw: the pen rewinds through every dab, newest first; long signatures rewind faster, never past 1.1 s
    el.clear = function () {
      return new Promise(function (resolve) {
        var n = total();
        function done() { strokes = []; undraw = 0; paint(0); status(); el.dispatchEvent(new CustomEvent("clear", { bubbles: true })); resolve(); }
        if (!n || reduce.matches) { done(); return; }
        var ms = Math.max(450, Math.min(1100, n * 0.35)), t0 = performance.now();
        el.classList.add("is-clearing");
        undraw = requestAnimationFrame(function step(now) {
          var k = Math.min(1, (now - t0) / ms);
          var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   // ease in and out
          paint(Math.round(n * (1 - e)));
          if (k < 1) undraw = requestAnimationFrame(step);
          else { el.classList.remove("is-clearing"); done(); }
        });
      });
    };

    size();
    if ("ResizeObserver" in window) new ResizeObserver(size).observe(el);
    dark.addEventListener && dark.addEventListener("change", function () { paint(Infinity); });
    el.classList.add("is-ready");
  }

  function init() { document.querySelectorAll(".curve-signature").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
