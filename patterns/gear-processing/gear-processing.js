/*
 * gear-processing.js: a gear train that turns while a job runs.
 *
 *   <svg class="gear-processing" data-module="4">
 *     <g class="gp-gear" data-teeth="30"></g>                         first gear: the driver
 *     <g class="gp-gear" data-teeth="12" data-mesh="0" data-dir="-30"></g>   meshes with gear 0, placed at -30 deg
 *     <g class="gp-gear" data-teeth="20" data-mesh="1" data-dir="40"></g>
 *   </svg>
 *
 * The script draws involute teeth, places each gear on its partner's pitch circle and sets its phase
 * so tooth meets gap. Every gear turns by the same number of teeth, so a gear with half the teeth
 * turns twice as fast, the other way round. Run a job with:
 *
 *   GearProcessing.run(svg, { teeth: 48, duration: 3600, onFrame: function (p) {}, onDone: fn })
 *
 * p is the eased progress from 0 to 1, read off the gears themselves, so a counter tied to it
 * moves exactly with the metal. Under reduced motion nothing turns: onFrame(1) and onDone run at once.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var PA = 20 * Math.PI / 180; // pressure angle
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function inv(a) { return Math.tan(a) - a; }
  function pt(R, a) { return (R * Math.cos(a)).toFixed(2) + " " + (R * Math.sin(a)).toFixed(2); }
  function ring(R) { return "M" + R.toFixed(2) + " 0A" + R + " " + R + " 0 1 0 " + (-R).toFixed(2) + " 0A" + R + " " + R + " 0 1 0 " + R.toFixed(2) + " 0Z"; }

  // One gear outline centred on 0 0, tooth 0 on the +x axis. Involute flanks from the base circle to the tip.
  function gearPath(z, m) {
    var r = m * z / 2, ra = r + m, rf = r - 1.25 * m, rb = r * Math.cos(PA);
    var half = (Math.PI / 2 - 0.1) / z; // half a tooth at the pitch circle, less a little backlash
    function th(R) { return half + inv(PA) - inv(Math.acos(Math.min(1, rb / Math.max(R, rb)))); }
    var r0 = Math.max(rb, rf), radii = [], i, j, k;
    for (i = 0; i <= 5; i++) radii.push(r0 + (ra - r0) * i / 5);
    var step = 2 * Math.PI / z, tb = th(r0), d = "";
    for (j = 0; j < z; j++) {
      var c = j * step;
      d += (j ? "L" : "M") + pt(rf, c - tb);
      for (i = 0; i < radii.length; i++) d += "L" + pt(radii[i], c - th(radii[i]));
      d += "A" + ra + " " + ra + " 0 0 1 " + pt(ra, c + th(ra));
      for (k = radii.length - 1; k >= 0; k--) d += "L" + pt(radii[k], c + th(radii[k]));
      d += "L" + pt(rf, c + tb) + "A" + rf + " " + rf + " 0 0 1 " + pt(rf, c + step - tb);
    }
    d += "Z";
    var bore = Math.max(m * 1.1, r * 0.16);
    d += ring(bore);
    if (z >= 18) { // lightening holes in the web
      var n = z >= 28 ? 6 : 5, at = (rf + bore) / 2, hr = (rf - bore) * 0.2;
      for (i = 0; i < n; i++) {
        var a = (i + 0.5) * 2 * Math.PI / n, x = at * Math.cos(a), y = at * Math.sin(a);
        d += "M" + (x + hr).toFixed(2) + " " + y.toFixed(2) + "A" + hr + " " + hr + " 0 1 0 " + (x - hr).toFixed(2) + " " + y.toFixed(2) + "A" + hr + " " + hr + " 0 1 0 " + (x + hr).toFixed(2) + " " + y.toFixed(2) + "Z";
      }
    }
    return { d: d, r: r, ra: ra, bore: bore };
  }

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function build(svg) {
    var m = +svg.dataset.module || 4;
    var gears = [].map.call(svg.querySelectorAll(".gp-gear"), function (g) {
      return { host: g, z: +g.dataset.teeth, mesh: g.dataset.mesh, dir: +g.dataset.dir || 0 };
    });
    gears.forEach(function (g, i) {
      g.r = m * g.z / 2;
      if (!i || g.mesh == null) { g.x = 0; g.y = 0; g.k = 1; g.base = 0; return; }
      var p = gears[+g.mesh], phi = g.dir * Math.PI / 180;
      g.x = p.x + (p.r + g.r) * Math.cos(phi);
      g.y = p.y + (p.r + g.r) * Math.sin(phi);
      g.k = -p.k * p.z / g.z; // turns the other way, faster when it has fewer teeth
      // tooth of the partner on the line of centres meets a gap here
      g.base = phi + Math.PI + Math.PI / g.z - (p.z / g.z) * (p.base - phi);
    });
    var shadows = el("g", { "class": "gp-shadows", "aria-hidden": "true" });
    svg.insertBefore(shadows, svg.firstChild);
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    gears.forEach(function (g) {
      var shape = gearPath(g.z, m);
      g.host.setAttribute("transform", "translate(" + g.x.toFixed(2) + " " + g.y.toFixed(2) + ")");
      g.spin = el("g", { "class": "gp-spin" }, g.host);
      el("path", { d: shape.d, "fill-rule": "evenodd", "class": "gp-body" }, g.spin);
      el("circle", { r: (shape.bore * 1.35).toFixed(2), "class": "gp-axle" }, g.host);
      var s = el("g", { transform: "translate(" + (g.x + m * 0.5).toFixed(2) + " " + (g.y + m * 0.8).toFixed(2) + ")" }, shadows);
      g.shade = el("g", {}, s);
      el("path", { d: shape.d, "fill-rule": "evenodd", "class": "gp-shadow" }, g.shade);
      g.deg = g.base * 180 / Math.PI;
      g.spin.style.rotate = g.shade.style.rotate = g.deg + "deg";
      x0 = Math.min(x0, g.x - shape.ra); x1 = Math.max(x1, g.x + shape.ra);
      y0 = Math.min(y0, g.y - shape.ra); y1 = Math.max(y1, g.y + shape.ra);
    });
    if (!svg.getAttribute("viewBox")) {
      var pad = m * 1.5;
      svg.setAttribute("viewBox", [x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2].map(function (v) { return v.toFixed(1); }).join(" "));
    }
    svg.gears = gears;
    svg.classList.add("is-ready");
    return gears;
  }

  function run(svg, o) {
    o = o || {};
    var gears = svg.gears || build(svg);
    var teeth = o.teeth || 48, z0 = gears[0].z;
    var turn = teeth * 360 / z0; // driver degrees
    var easing = getComputedStyle(svg).getPropertyValue("--ease-inout").trim() || "ease-in-out";
    if (svg.job) svg.job.forEach(function (a) { a.cancel(); });
    if (reduce.matches || !svg.animate) {
      if (o.onFrame) o.onFrame(1);
      if (o.onDone) o.onDone();
      return;
    }
    svg.job = [];
    gears.forEach(function (g) {
      var from = g.deg, to = g.deg + g.k * turn;
      [g.spin, g.shade].forEach(function (part) {
        var a = part.animate([{ rotate: from + "deg" }, { rotate: to + "deg" }], { duration: o.duration || 3600, easing: easing, fill: "forwards" });
        svg.job.push(a);
      });
      // a whole number of teeth later every gear looks as it did, so park it back on its start angle
      g.next = from + g.k * turn;
    });
    var lead = svg.job[0];
    function tick() {
      var p = lead.effect.getComputedTiming().progress;
      if (o.onFrame) o.onFrame(p == null ? 1 : p);
      if (lead.playState === "running") requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    lead.finished.then(function () {
      gears.forEach(function (g) {
        g.deg = g.next % 360;
        g.spin.style.rotate = g.shade.style.rotate = g.deg + "deg";
      });
      svg.job.forEach(function (a) { a.cancel(); });
      svg.job = null;
      if (o.onFrame) o.onFrame(1);
      if (o.onDone) o.onDone();
    }, function () {});
  }

  window.GearProcessing = { build: build, run: run, path: gearPath };
  function init() { document.querySelectorAll("svg.gear-processing").forEach(function (s) { if (!s.gears) build(s); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
