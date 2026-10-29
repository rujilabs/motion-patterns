/*
 * weather-icon.js: one weather icon that morphs between conditions.
 *
 *   <svg class="wx-icon" viewBox="0 0 96 96" data-condition="sun" role="img" aria-label="Sunny"></svg>
 *
 * Change data-condition (sun, partly, cloud, rain, moon) and the icon becomes the new one. It is
 * always the same few parts, so every shape has a partner to morph into:
 *   body   one path of six cubic curves. As the sun it is a circle; as a cloud it is three
 *          bumps on a flat base. The six joints sit at the same angles round the middle in both,
 *          so the disc swells into the bumps instead of folding.
 *   rays   eight lines. Round the sun they are rays; when cloud comes in they slide inward and
 *          shrink to nothing behind it; for rain they fall below the cloud as the streaks.
 *   peek   a small sun that rises behind the cloud for "partly".
 *   bite   a circle in a mask that slides across the disc to cut the moon.
 * Every number rides its own spring, so stepping quickly through hours retargets mid-flight with
 * no jump. Colours are CSS (style.css), keyed on data-condition.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var uid = 0;

  // A circular arc as one cubic: from angle a1 to a2 (degrees, screen coordinates).
  function arc(cx, cy, r, a1, a2) {
    var t1 = a1 * Math.PI / 180, t2 = a2 * Math.PI / 180, k = 4 / 3 * Math.tan((t2 - t1) / 4) * r;
    var x1 = cx + r * Math.cos(t1), y1 = cy + r * Math.sin(t1), x2 = cx + r * Math.cos(t2), y2 = cy + r * Math.sin(t2);
    return [x1 - k * Math.sin(t1), y1 + k * Math.cos(t1), x2 + k * Math.sin(t2), y2 - k * Math.cos(t2), x2, y2];
  }
  function deg(x, y) { return Math.atan2(y, x) * 180 / Math.PI; }

  // The cloud: three circles on a flat base, traced as six curves (base, right lobe in two,
  // top dome, left lobe in two). The joints are where the circles cross.
  var L = [30, 58, 12], B = [50, 46, 18], R = [70, 58, 12], MID = [50, 58];
  var JR = [68, 46.2], JL = [32, 46.2];
  var aR = deg(JR[0] - R[0], JR[1] - R[1]);   // where the right lobe meets the dome, about -100 deg
  var aL = deg(JL[0] - L[0], JL[1] - L[1]);   // where the dome meets the left lobe, about -80 deg
  var cloudStart = [30, 70];
  // traced clockwise on screen: along the base, up the right lobe, over the dome, down the left lobe
  var cloudSegs = [
    [30 + 40 / 3, 70, 30 + 80 / 3, 70, 70, 70],                 // the flat base, as a straight curve
    arc(R[0], R[1], R[2], 90, (90 + aR) / 2),
    arc(R[0], R[1], R[2], (90 + aR) / 2, aR),
    arc(B[0], B[1], B[2], deg(JR[0] - B[0], JR[1] - B[1]), deg(JL[0] - B[0], JL[1] - B[1]) - 360),
    arc(L[0], L[1], L[2], aL, (aL - 270) / 2),
    arc(L[0], L[1], L[2], (aL - 270) / 2, -270)
  ];
  // the joints of the cloud, used to put the circle's joints at the same angles
  function joints() {
    var pts = [cloudStart];
    cloudSegs.forEach(function (s) { pts.push([s[4], s[5]]); });
    return pts.slice(0, 6).map(function (p) { return deg(p[0] - MID[0], p[1] - MID[1]); });
  }
  var ANG = joints();

  function circle(cx, cy, r) {
    var a = ANG.slice(), out = [cx + r * Math.cos(a[0] * Math.PI / 180), cy + r * Math.sin(a[0] * Math.PI / 180)];
    for (var i = 0; i < 6; i++) {
      var a1 = a[i], a2 = a[(i + 1) % 6];
      while (a2 > a1) a2 -= 360;               // always round the same way as the cloud
      out = out.concat(arc(cx, cy, r, a1, a2));
    }
    return out;
  }
  function cloud(scale, dx, dy) {
    var out = [cloudStart[0], cloudStart[1]];
    cloudSegs.forEach(function (s) { out = out.concat(s); });
    return out.map(function (v, i) { var c = i % 2 ? MID[1] : MID[0]; return c + (v - c) * scale + (i % 2 ? dy : dx); });
  }
  function rays(cx, cy, r1, r2) {
    var out = [];
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4 - Math.PI / 2;
      out.push(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a), cx + r2 * Math.cos(a), cy + r2 * Math.sin(a));
    }
    return out;
  }
  function streaks() {
    var out = [], xs = [31, 43, 55, 67, 37, 49, 61, 73];
    xs.forEach(function (x, i) { var y = i < 4 ? 67 : 79; out.push(x, y, x - 3, y + 9); });
    return out;
  }
  function point(x, y) { var out = []; for (var i = 0; i < 8; i++) out.push(x, y, x, y); return out; }

  // Every condition as one flat list of numbers: body (38), rays (32), ray width, peek (3), bite (3).
  var OFF_BITE = [124, -28, 17];
  var SHAPES = {
    sun: [].concat(circle(48, 48, 18), rays(48, 48, 26, 35), [4], [48, 48, 0], OFF_BITE),
    partly: [].concat(cloud(.8, -8, 4), rays(63, 35, 17, 23), [3.2], [63, 35, 12], OFF_BITE),
    cloud: [].concat(cloud(1, -2, -2), point(60, 40), [3], [60, 40, 0], OFF_BITE),
    rain: [].concat(cloud(1, -2, -8), streaks(), [3], [60, 36, 0], OFF_BITE),
    moon: [].concat(circle(46, 48, 21), point(46, 48), [3], [46, 48, 0], [60, 37, 17])
  };
  var LABEL = { sun: "Sunny", partly: "Partly cloudy", cloud: "Cloudy", rain: "Rain", moon: "Clear night" };

  function f(n) { return Math.round(n * 100) / 100; }
  function bodyD(v) {
    var d = "M " + f(v[0]) + " " + f(v[1]);
    for (var i = 0; i < 6; i++) d += " C " + v.slice(2 + i * 6, 8 + i * 6).map(f).join(" ");
    return d + " Z";
  }

  function build(svg) {
    var id = "wx-bite-" + (++uid);
    svg.textContent = "";
    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    var mask = el("mask", { id: id, maskUnits: "userSpaceOnUse", x: -20, y: -40, width: 160, height: 160 }, el("defs", {}));
    el("rect", { x: -20, y: -40, width: 160, height: 160, fill: "#fff" }, mask);
    var parts = { bite: el("circle", { fill: "#000" }, mask) };
    parts.peek = el("circle", { class: "wx-peek" });
    var g = el("g", { class: "wx-rays" });
    parts.rays = [];
    for (var i = 0; i < 8; i++) parts.rays.push(el("line", {}, g));
    parts.rayGroup = g;
    parts.body = el("path", { class: "wx-body", mask: "url(#" + id + ")" });
    return parts;
  }

  function draw(p, v) {
    p.body.setAttribute("d", bodyD(v));
    for (var i = 0; i < 8; i++) {
      var o = 38 + i * 4;
      p.rays[i].setAttribute("x1", f(v[o])); p.rays[i].setAttribute("y1", f(v[o + 1]));
      p.rays[i].setAttribute("x2", f(v[o + 2])); p.rays[i].setAttribute("y2", f(v[o + 3]));
    }
    p.rayGroup.setAttribute("stroke-width", f(Math.max(0, v[70])));
    p.peek.setAttribute("cx", f(v[71])); p.peek.setAttribute("cy", f(v[72])); p.peek.setAttribute("r", f(Math.max(0, v[73])));
    p.bite.setAttribute("cx", f(v[74])); p.bite.setAttribute("cy", f(v[75])); p.bite.setAttribute("r", f(Math.max(0, v[76])));
  }

  // Springs: stiffness 210, damping ratio 0.82: one small overshoot that settles in about half a second.
  var K = 210, C = 2 * Math.sqrt(K) * 0.82;
  function setup(svg) {
    if (svg._wx) return;
    var cond = SHAPES[svg.getAttribute("data-condition")] ? svg.getAttribute("data-condition") : "sun";
    var s = svg._wx = { parts: build(svg), x: SHAPES[cond].slice(), v: SHAPES[cond].map(function () { return 0; }), to: SHAPES[cond], raf: 0, last: 0 };
    draw(s.parts, s.x);
    if (!svg.hasAttribute("aria-label")) svg.setAttribute("aria-label", LABEL[cond]);
    new MutationObserver(function () { go(svg); }).observe(svg, { attributes: true, attributeFilter: ["data-condition"] });
  }
  function go(svg) {
    var s = svg._wx, cond = svg.getAttribute("data-condition");
    if (!SHAPES[cond] || s.to === SHAPES[cond]) return;
    s.to = SHAPES[cond];
    if (reduce.matches) { s.x = s.to.slice(); s.v = s.v.map(function () { return 0; }); draw(s.parts, s.x); return; }
    if (!s.raf) { s.last = performance.now(); s.raf = requestAnimationFrame(step); }
    function step(now) {
      var dt = Math.min(.05, (now - s.last) / 1000), moving = false, n = 4, h = dt / n;
      s.last = now;
      for (var j = 0; j < n; j++) for (var i = 0; i < s.x.length; i++) {
        s.v[i] += (-K * (s.x[i] - s.to[i]) - C * s.v[i]) * h;
        s.x[i] += s.v[i] * h;
      }
      for (i = 0; i < s.x.length; i++) if (Math.abs(s.x[i] - s.to[i]) > .01 || Math.abs(s.v[i]) > .01) { moving = true; break; }
      if (!moving) s.x = s.to.slice();
      draw(s.parts, s.x);
      s.raf = moving ? requestAnimationFrame(step) : 0;
    }
  }

  function init() { document.querySelectorAll(".wx-icon").forEach(setup); }
  window.WeatherIcon = { init: init, conditions: Object.keys(SHAPES) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
