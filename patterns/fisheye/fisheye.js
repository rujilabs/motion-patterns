/*
 * fisheye.js: bends an SVG drawing with a barrel (fisheye) distortion. Mark the svg with
 * data-fisheye="1" (the strength). Every line, rect, polyline, polygon and circle inside it is
 * turned into a path with many points; each point moves away from or toward the centre by
 *   p' = c + (p - c) * (1 + k) / (1 + k * r * r)
 * where r is the distance from the centre over half the diagonal. The middle is magnified and the
 * corners stay put, so straight lines bow outward. The move from flat to bent is a Web Animations
 * tween of the path's d property; blending the points linearly lands exactly on a weaker barrel,
 * so every frame of the tween is a true fisheye. A checkbox with data-fisheye-toggle inside the
 * same .fisheye-group flattens and bends it again.
 */
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canTween = window.CSS && CSS.supports && CSS.supports("d", 'path("M0 0")');
  var STEP = 4; // one point every 4 units along an edge

  function token(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function ms(v) { return v.indexOf("ms") > 0 ? parseFloat(v) : parseFloat(v) * 1000; }

  function pointsOf(el) {
    var tag = el.tagName.toLowerCase(), n = function (a) { return parseFloat(el.getAttribute(a)) || 0; };
    if (tag === "line") return { pts: [[n("x1"), n("y1")], [n("x2"), n("y2")]], closed: false };
    if (tag === "rect") {
      var x = n("x"), y = n("y"), w = n("width"), h = n("height");
      return { pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], closed: true };
    }
    if (tag === "circle") {
      var cx = n("cx"), cy = n("cy"), r = n("r"), out = [], seg = Math.max(16, Math.round(r * 2));
      for (var i = 0; i < seg; i++) out.push([cx + r * Math.cos(i / seg * 2 * Math.PI), cy + r * Math.sin(i / seg * 2 * Math.PI)]);
      return { pts: out, closed: true };
    }
    var raw = (el.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number), list = [];
    for (var j = 0; j + 1 < raw.length; j += 2) list.push([raw[j], raw[j + 1]]);
    return { pts: list, closed: tag === "polygon" };
  }

  function densify(pts, closed) {
    var out = [], last = closed ? pts.length : pts.length - 1;
    for (var i = 0; i < last; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      var steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / STEP));
      for (var s = 0; s < steps; s++) out.push([a[0] + (b[0] - a[0]) * s / steps, a[1] + (b[1] - a[1]) * s / steps]);
    }
    if (!closed) out.push(pts[pts.length - 1]);
    return out;
  }

  function toD(pts, closed) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2); }).join(" ") + (closed ? " Z" : "");
  }

  function setup(svg) {
    var vb = svg.viewBox.baseVal, cx = vb.x + vb.width / 2, cy = vb.y + vb.height / 2;
    var R = Math.hypot(vb.width, vb.height) / 2, k = parseFloat(svg.getAttribute("data-fisheye")) || 1;
    var frame = svg.closest(".fisheye") || svg;
    var group = svg.closest(".fisheye-group") || document;
    var toggle = group.querySelector("[data-fisheye-toggle]");
    var anims = [], paths = [];

    function bend(p) {
      var dx = (p[0] - cx) / R, dy = (p[1] - cy) / R, s = (1 + k) / (1 + k * (dx * dx + dy * dy));
      return [cx + (p[0] - cx) * s, cy + (p[1] - cy) * s];
    }

    svg.querySelectorAll("line, rect, polyline, polygon, circle").forEach(function (el) {
      var shape = pointsOf(el);
      if (shape.pts.length < 2) return;
      var dense = densify(shape.pts, shape.closed);
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      for (var i = 0; i < el.attributes.length; i++) {
        var a = el.attributes[i].name;
        if (!/^(x|y|x1|y1|x2|y2|width|height|rx|ry|cx|cy|r|points)$/.test(a)) path.setAttribute(a, el.attributes[i].value);
      }
      path._flat = toD(dense, shape.closed);
      path._bent = toD(dense.map(bend), shape.closed);
      path.setAttribute("d", path._flat);
      el.replaceWith(path);
      paths.push(path);
    });

    function settle(bent) {
      paths.forEach(function (p) { p.setAttribute("d", bent ? p._bent : p._flat); });
      frame.classList.toggle("is-bent", bent);
    }

    function play(bent) {
      frame.classList.toggle("is-bent", bent);
      if (reduce || !canTween) { settle(bent); return; }
      var dur = ms(token("--dur-draw", "1600ms")), ease = token("--ease-inout", "ease-in-out");
      anims.forEach(function (a) { a.cancel(); });
      anims = paths.map(function (p) {
        var from = 'path("' + (bent ? p._flat : p._bent) + '")', to = 'path("' + (bent ? p._bent : p._flat) + '")';
        var a = p.animate([{ d: from }, { d: to }], { duration: dur, easing: ease, fill: "forwards" });
        a.onfinish = function () { p.setAttribute("d", bent ? p._bent : p._flat); a.cancel(); };
        return a;
      });
    }

    if (toggle) toggle.addEventListener("change", function () { play(toggle.checked); });
    if (toggle && !toggle.checked) return; // starts flat: wait for the toggle

    if (reduce || !("IntersectionObserver" in window)) { settle(true); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); play(true); }
    }, { threshold: 0.3 });
    io.observe(frame);
  }

  function start() { document.querySelectorAll("svg[data-fisheye]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
