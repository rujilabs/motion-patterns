/*
 * gear-rack-progress.js: a reading-progress bar made of a rack and pinion.
 *
 *   <div class="gear-rack-progress" data-for="#story" aria-label="Reading progress"></div>
 *
 * data-for names the element that scrolls (leave it out to follow the page). As the reader scrolls,
 * the pinion turns and drives the rack out to the right: the rack's leading end is the progress.
 * The rack moves exactly one tooth pitch (pi times the module) for every tooth the pinion turns, and
 * a pinion tooth always sits in a rack gap. The rack has a little mass: it follows the scroll on a
 * critically damped spring (data-weight, default 16; 0 locks it to the scroll). Under reduced
 * motion it is locked to the scroll and never lags.
 * Options: data-teeth (pinion, default 12), data-module (px, default 2.6).
 * It fires a "rackprogress" event with detail.progress (0 to 1) on the bar after each frame.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var PA = 20 * Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function inv(a) { return Math.tan(a) - a; }
  function pt(R, a) { return (R * Math.cos(a)).toFixed(2) + " " + (R * Math.sin(a)).toFixed(2); }
  function pinionPath(z, m) {
    var r = m * z / 2, ra = r + m, rf = r - 1.25 * m, rb = r * Math.cos(PA);
    var half = (Math.PI / 2 - 0.1) / z;
    function th(R) { return half + inv(PA) - inv(Math.acos(Math.min(1, rb / Math.max(R, rb)))); }
    var r0 = Math.max(rb, rf), radii = [], i, j;
    for (i = 0; i <= 5; i++) radii.push(r0 + (ra - r0) * i / 5);
    var step = 2 * Math.PI / z, tb = th(r0), d = "";
    for (j = 0; j < z; j++) {
      var c = j * step;
      d += (j ? "L" : "M") + pt(rf, c - tb);
      for (i = 0; i < radii.length; i++) d += "L" + pt(radii[i], c - th(radii[i]));
      d += "A" + ra + " " + ra + " 0 0 1 " + pt(ra, c + th(ra));
      for (i = radii.length - 1; i >= 0; i--) d += "L" + pt(radii[i], c + th(radii[i]));
      d += "L" + pt(rf, c + tb) + "A" + rf + " " + rf + " 0 0 1 " + pt(rf, c + step - tb);
    }
    var b = r * 0.3;
    return d + "ZM" + b + " 0A" + b + " " + b + " 0 1 0 " + (-b) + " 0A" + b + " " + b + " 0 1 0 " + b + " 0Z";
  }
  // A straight rack ending at x = 0, teeth pointing up (-y), pitch line at y = 0, 20 degree flanks.
  function rackPath(len, m, back) {
    var p = Math.PI * m, t = Math.tan(PA), w = p / 4 - 0.05 * m;
    var top = -m, root = 1.25 * m, d = "M0 " + (root + back).toFixed(2) + "L0 " + root.toFixed(2);
    for (var c = -p / 2; c > -len; c -= p) {
      d += "L" + (c + w + root * t).toFixed(2) + " " + root.toFixed(2) +
        "L" + (c + w - m * t).toFixed(2) + " " + top.toFixed(2) +
        "L" + (c - w + m * t).toFixed(2) + " " + top.toFixed(2) +
        "L" + (c - w - root * t).toFixed(2) + " " + root.toFixed(2);
    }
    return d + "L" + (-len).toFixed(2) + " " + root.toFixed(2) + "L" + (-len).toFixed(2) + " " + (root + back).toFixed(2) + "Z";
  }
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function setup(bar) {
    var z = +bar.dataset.teeth || 12, m = +bar.dataset.module || 2.6;
    var weight = bar.dataset.weight == null ? 16 : +bar.dataset.weight;
    var scroller = bar.dataset.for ? document.querySelector(bar.dataset.for) : null;
    var r = m * z / 2, ra = r + m, cx = ra + 2, cy = ra + 1;
    var back = 6, H = Math.ceil(cy + r + 1.25 * m + back + 1);
    var svg = el("svg", { "class": "grp-svg", height: H, "aria-hidden": "true" }, bar);
    var track = el("path", { "class": "grp-track" }, svg);
    var rack = el("g", { "class": "grp-rack" }, svg);
    var rackShape = el("path", {}, rack);
    var pin = el("g", { transform: "translate(" + cx + " " + cy + ")" }, svg);
    var spin = el("path", { d: pinionPath(z, m), "fill-rule": "evenodd", "class": "grp-pinion" }, pin);
    el("circle", { r: (r * 0.3 + 0.1).toFixed(2), "class": "grp-axle" }, pin);
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");

    var W = 0, run = 0;
    function size() {
      W = bar.clientWidth;
      svg.setAttribute("width", W);
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      run = Math.max(10, W - cx - 4);
      rackShape.setAttribute("d", rackPath(W + 40, m, back));
      var ty = cy + r + 1.25 * m + back;
      track.setAttribute("d", "M" + cx + " " + (ty + 0.5) + "H" + (W - 4) + "M" + (W - 4.5) + " " + (ty - back - 3) + "V" + (ty + 0.5));
      x = target(); draw();
    }
    function target() {
      var s = scroller || document.scrollingElement || document.documentElement;
      var max = s.scrollHeight - s.clientHeight;
      return max > 0 ? Math.min(1, Math.max(0, s.scrollTop / max)) : 0;
    }
    var x = 0, v = 0, raf = 0, last = 0;
    function draw() {
      var u = x * run; // how far the rack has travelled, px
      rack.setAttribute("transform", "translate(" + (cx + u).toFixed(2) + " " + (cy + r).toFixed(2) + ")");
      // rolling: the pinion turns one tooth (360/z deg) for every rack pitch (pi m) the rack moves
      spin.style.rotate = (90 - (u / r) * 180 / Math.PI).toFixed(2) + "deg";
      var pct = Math.round(x * 100);
      if (bar.getAttribute("aria-valuenow") !== String(pct)) {
        bar.setAttribute("aria-valuenow", pct);
        bar.setAttribute("aria-valuetext", pct + "% read");
      }
      bar.dispatchEvent(new CustomEvent("rackprogress", { detail: { progress: x } }));
    }
    function frame(t) {
      var dt = Math.min(0.064, last ? (t - last) / 1000 : 0.016); last = t;
      var goal = target(), w = reduce.matches ? 0 : weight;
      if (!w) { x = goal; v = 0; }
      else {
        // exact step of a critically damped spring: stable at any frame time, never overshoots
        var e0 = x - goal, c = v + w * e0, ex = Math.exp(-w * dt);
        var e = (e0 + c * dt) * ex;
        v = (v - w * c * dt) * ex;
        x = goal + e;
        if (Math.abs(e) < 0.0002 && Math.abs(v) < 0.002) { x = goal; v = 0; }
      }
      draw();
      if (x !== goal || v) raf = requestAnimationFrame(frame); else { raf = 0; last = 0; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    (scroller || window).addEventListener("scroll", kick, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(size).observe(bar);
    else window.addEventListener("resize", size);
    size();
    bar.classList.add("is-ready");
  }

  function init() { document.querySelectorAll(".gear-rack-progress").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
