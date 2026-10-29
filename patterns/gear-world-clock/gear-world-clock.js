/*
 * gear-world-clock.js: a gear train that drives one clock per city. Turn any wheel, or use the keys,
 * to set a meeting time; every clock follows through the teeth.
 *
 *   <div class="gear-world-clock" tabindex="0" aria-label="Meeting time" data-start="840" data-step="15">
 *     <svg data-module="7.5">
 *       <g class="gw-gear gw-city" data-teeth="24" data-offset="-480" data-city="London"></g>
 *       <g class="gw-gear" data-teeth="12" data-mesh="0" data-dir="30"></g>
 *       <g class="gw-gear gw-city" data-teeth="24" data-mesh="1" data-dir="-30" data-offset="-240" data-city="Dubai"></g>
 *       ...
 *     </svg>
 *   </div>
 *
 * The value is minutes past midnight in the home city (0 to 1439). data-offset on a city wheel is
 * its difference from home in minutes. City wheels carry the hour hand, so they turn once per 12
 * hours; idlers between them keep every city turning the same way, at the same speed, as in a real
 * train. A minute hand rides on each dial (12 to 1, as a clock's motion work would give it).
 * Keys: arrows by data-step minutes, Page Up and Page Down by an hour, Home and End for the ends of
 * the day. Drag a wheel round its centre to turn the whole train; it snaps to the step on release.
 * Fires "clockchange" with detail.minutes (home time) on each change.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var PA = 20 * Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var DAY = 1440;

  function inv(a) { return Math.tan(a) - a; }
  function pt(R, a) { return (R * Math.cos(a)).toFixed(2) + " " + (R * Math.sin(a)).toFixed(2); }
  function gearPath(z, m, bore) {
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
    return d + "ZM" + bore + " 0A" + bore + " " + bore + " 0 1 0 " + (-bore) + " 0A" + bore + " " + bore + " 0 1 0 " + bore + " 0Z";
  }
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function wrap(v) { return ((v % DAY) + DAY) % DAY; }
  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return ((h + 11) % 12 + 1) + ":" + (m < 10 ? "0" : "") + m + (h < 12 ? " am" : " pm");
  }

  function setup(box) {
    var svg = box.querySelector("svg");
    var m = +svg.dataset.module || 7.5;
    var step = +box.dataset.step || 15;
    var gears = [].map.call(svg.querySelectorAll(".gw-gear"), function (g) {
      return { host: g, z: +g.dataset.teeth, mesh: g.dataset.mesh, dir: +g.dataset.dir || 0, city: g.classList.contains("gw-city"), offset: +g.dataset.offset || 0, name: g.dataset.city || "" };
    });
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    gears.forEach(function (g, i) {
      g.r = m * g.z / 2;
      if (!i || g.mesh == null) { g.x = 0; g.y = 0; g.k = 1; g.base = -Math.PI / 2; }
      else {
        var p = gears[+g.mesh], phi = g.dir * Math.PI / 180;
        g.x = p.x + (p.r + g.r) * Math.cos(phi);
        g.y = p.y + (p.r + g.r) * Math.sin(phi);
        g.k = -p.k * p.z / g.z;
        g.base = phi + Math.PI + Math.PI / g.z - (p.z / g.z) * (p.base - phi);
      }
      var rf = g.r - 1.25 * m;
      g.host.setAttribute("transform", "translate(" + g.x.toFixed(2) + " " + g.y.toFixed(2) + ")");
      g.wheel = el("path", { d: gearPath(g.z, m, (g.city ? rf * 0.2 : rf * 0.3).toFixed(2)), "fill-rule": "evenodd", "class": "gw-wheel" }, g.host);
      g.parts = [];
      if (g.city) {
        var R = rf * 0.84;
        g.dial = el("circle", { r: R.toFixed(2), "class": "gw-dial" }, g.host);
        for (var t = 0; t < 12; t++) {
          var a = t * Math.PI / 6, long = t % 3 === 0;
          el("line", { x1: ((R - (long ? 9 : 5)) * Math.sin(a)).toFixed(2), y1: (-(R - (long ? 9 : 5)) * Math.cos(a)).toFixed(2), x2: ((R - 2.5) * Math.sin(a)).toFixed(2), y2: (-(R - 2.5) * Math.cos(a)).toFixed(2), "class": long ? "gw-tick gw-tick-major" : "gw-tick" }, g.host);
        }
        g.hour = el("line", { x1: 0, y1: 4, x2: 0, y2: (-R * 0.52).toFixed(2), "class": "gw-hour" }, g.host);
        g.minute = el("line", { x1: 0, y1: 6, x2: 0, y2: (-R * 0.8).toFixed(2), "class": "gw-minute" }, g.host);
        el("circle", { r: 3.2, "class": "gw-pin" }, g.host);
      } else {
        el("circle", { r: (rf * 0.3 + 2).toFixed(2), "class": "gw-axle" }, g.host);
      }
      x0 = Math.min(x0, g.x - g.r - m); x1 = Math.max(x1, g.x + g.r + m);
      y0 = Math.min(y0, g.y - g.r - m); y1 = Math.max(y1, g.y + g.r + m);
    });
    var pad = 3;
    svg.setAttribute("viewBox", [x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2].map(function (v) { return v.toFixed(1); }).join(" "));
    box.setAttribute("role", "slider");
    box.setAttribute("aria-valuemin", "0");
    box.setAttribute("aria-valuemax", String(DAY - step));
    box.classList.add("is-ready");

    // theta = minutes of home time; the driver turns 0.5 deg a minute (once per 12 hours)
    var value = wrap(+box.dataset.start || 0), theta = value, anims = [];
    var ease = getComputedStyle(box).getPropertyValue("--ease-out").trim() || "ease-out";

    function angles(th) {
      // every wheel turns k times the driver; city hands read local time
      return gears.map(function (g) {
        var o = { wheel: g.base * 180 / Math.PI + g.k * th * 0.5 };
        if (g.city) { o.hour = (th + g.offset) * 0.5; o.minute = (th + g.offset) * 6; }
        return o;
      });
    }
    function paint(th) {
      angles(th).forEach(function (a, i) {
        var g = gears[i];
        g.wheel.style.rotate = a.wheel.toFixed(3) + "deg";
        if (g.city) { g.hour.style.rotate = a.hour.toFixed(3) + "deg"; g.minute.style.rotate = a.minute.toFixed(3) + "deg"; }
      });
    }
    function stop() {
      anims.forEach(function (a) { a.cancel(); });
      anims = [];
    }
    function announce() {
      var local = gears.filter(function (g) { return g.city; }).map(function (g) {
        return { name: g.name, minutes: wrap(value + g.offset), dayShift: Math.floor((value + g.offset) / DAY) };
      });
      gears.forEach(function (g) {
        if (!g.city) return;
        var h = wrap(value + g.offset) / 60;
        g.dial.classList.toggle("gw-night", h < 6 || h >= 19);
      });
      box.setAttribute("aria-valuenow", String(value));
      box.setAttribute("aria-valuetext", local.map(function (c) { return fmt(c.minutes) + " in " + c.name; }).reverse().join(", "));
      box.dispatchEvent(new CustomEvent("clockchange", { detail: { minutes: value, cities: local } }));
    }
    // Move to a new home time. Turns the short way through the teeth, from wherever the train is now.
    function set(next, animate) {
      next = wrap(Math.round(next / step) * step);
      var from = theta, to = theta + (((next - value) % DAY) + DAY) % DAY;
      if (to - from > DAY / 2) to -= DAY;
      value = next;
      stop();
      theta = to;
      paint(to);
      announce();
      if (!animate || reduce.matches || !box.animate || to === from) return;
      var A = angles(from), B = angles(to), dur = Math.min(900, 380 + Math.abs(to - from) * 1.2);
      gears.forEach(function (g, i) {
        ["wheel", "hour", "minute"].forEach(function (k) {
          if (!g[k] || !g.city && k !== "wheel") return;
          try { anims.push(g[k].animate([{ rotate: A[i][k] + "deg" }, { rotate: B[i][k] + "deg" }], { duration: dur, easing: ease })); }
          catch (e) { anims.push(g[k].animate([{ rotate: A[i][k] + "deg" }, { rotate: B[i][k] + "deg" }], { duration: dur, easing: "ease-out" })); }
        });
      });
    }
    box.setTime = function (min) { set(min, true); };

    box.addEventListener("keydown", function (e) {
      var d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: 60, PageDown: -60 }[e.key];
      if (d) { set(value + d, true); e.preventDefault(); }
      else if (e.key === "Home") { set(0, true); e.preventDefault(); }
      else if (e.key === "End") { set(DAY - step, true); e.preventDefault(); }
    });

    // Drag: the wheel under the pointer turns with it, and the driver turns by that over k.
    var drag = null;
    function local(e) {
      var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    svg.addEventListener("pointerdown", function (e) {
      var q = local(e), best = null;
      gears.forEach(function (g) {
        var d = Math.hypot(q.x - g.x, q.y - g.y);
        if (d < g.r + m && (!best || d / g.r < best.d)) best = { g: g, d: d / g.r };
      });
      if (!best) return;
      var g = best.g;
      stop();
      drag = { g: g, a: Math.atan2(q.y - g.y, q.x - g.x), th: theta };
      svg.setPointerCapture(e.pointerId);
      box.classList.add("is-dragging");
      box.focus({ preventScroll: true });
      e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var q = local(e), g = drag.g;
      var a = Math.atan2(q.y - g.y, q.x - g.x), da = a - drag.a;
      if (da > Math.PI) da -= 2 * Math.PI;
      if (da < -Math.PI) da += 2 * Math.PI;
      drag.a = a;
      // wheel degrees = k * 0.5 * minutes, so minutes = degrees / (0.5 k)
      theta += (da * 180 / Math.PI) / (0.5 * g.k);
      paint(theta);
      var v = wrap(Math.round(theta / step) * step);
      if (v !== value) { value = v; announce(); }
    });
    function end() {
      if (!drag) return;
      drag = null;
      box.classList.remove("is-dragging");
      // snap: settle on the nearest step from where the hand was let go
      var snap = Math.round(theta / step) * step, from = theta;
      value = wrap(snap); theta = snap;
      paint(snap); announce();
      if (reduce.matches || !box.animate || snap === from) return;
      var A = angles(from), B = angles(snap);
      gears.forEach(function (g, i) {
        ["wheel", "hour", "minute"].forEach(function (k) {
          if (!g[k] || !g.city && k !== "wheel") return;
          anims.push(g[k].animate([{ rotate: A[i][k] + "deg" }, { rotate: B[i][k] + "deg" }], { duration: 260, easing: ease }));
        });
      });
    }
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);

    paint(theta);
    announce();
  }

  window.GearWorldClock = { format: fmt };
  function init() { document.querySelectorAll(".gear-world-clock").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
