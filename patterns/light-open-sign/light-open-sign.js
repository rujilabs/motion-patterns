/*
 * light-open-sign.js: a neon sign that is lit during opening hours, on a clock you give it.
 *   <svg class="neon-sign" data-hours="11:30-15:00 17:30-23:45" data-time="19:40" viewBox="...">
 *     <g class="neon-circuit" data-flicker="quick"><path d="..."/></g>    tube centre lines
 *   </svg>
 * Each circuit is one transformer: its tubes strike together. For every path the script builds the tube:
 * clear glass when off, and when lit a coloured tube with a hot core plus the light it throws on the board
 * behind (a blurred copy, so it falls off with distance from the glass). Moving into open hours strikes
 * the sign with a neon start: a few fast flickers, a dead gap while the gas finds its path, then steady.
 * Leaving open hours cuts it at once: neon has no afterglow. The strike waits until the sign is in view.
 *   data-hours     open spans, "HH:MM-HH:MM", space separated; a span may run past midnight
 *   data-time      the clock, "HH:MM" (or minutes); change it with el.neon.setTime()
 *   data-flicker   per circuit: "quick", "stutter" or "weak" (strikes late and stammers)
 * "neon" fires on the sign with detail.open whenever it switches.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;
  // [offset, brightness]; each value holds until the next offset, like a tube that is on, off or half lit
  var FLICKER = {
    quick:   { dur: 760,  delay: 0,   k: [[0, 0], [.06, 1], [.11, 0], [.2, 0], [.24, .85], [.29, .3], [.33, 1], [1, 1]] },
    stutter: { dur: 1560, delay: 120, k: [[0, 0], [.04, .9], [.07, 0], [.12, 0], [.14, .7], [.17, .2], [.2, .95], [.23, 0], [.47, 0], [.49, .6], [.51, .25], [.54, 1], [.57, .82], [.61, 1], [1, 1]] },
    weak:    { dur: 2000, delay: 120, k: [[0, 0], [.04, .5], [.06, 0], [.4, 0], [.42, .4], [.45, 0], [.58, 0], [.6, .75], [.63, .3], [.66, .9], [.7, .45], [.72, 1], [.8, .7], [.82, 1], [1, 1]] }
  };

  function minutes(v) {
    if (v === undefined || v === null || v === "") return 0;
    if (/^\d+$/.test(String(v))) return +v;
    var m = String(v).match(/(\d{1,2}):(\d{2})/);
    return m ? +m[1] * 60 + +m[2] : 0;
  }
  function spans(str) {
    return (str || "").trim().split(/\s+/).filter(Boolean).map(function (s) {
      var p = s.split("-"), a = minutes(p[0]), b = minutes(p[1]);
      if (b <= a) b += 1440;   // past midnight
      return [a, b];
    });
  }

  function setup(svg) {
    if (svg._neon) return;
    svg._neon = true;
    var id = "neon-cast-" + (++uid);
    // one filter region over the whole sign, so the thrown light is never clipped to a letter's box
    var vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : { x: 0, y: 0, width: 400, height: 200 };
    var defs = document.createElementNS(NS, "defs");
    defs.innerHTML = '<filter id="' + id + '" filterUnits="userSpaceOnUse" x="' + (vb.x - 60) + '" y="' + (vb.y - 60) + '" width="' + (vb.width + 120) + '" height="' + (vb.height + 120) + '"><feGaussianBlur stdDeviation="7"/></filter>';
    svg.insertBefore(defs, svg.firstChild);

    var circuits = Array.prototype.map.call(svg.querySelectorAll(".neon-circuit"), function (g) {
      var paths = Array.prototype.slice.call(g.querySelectorAll("path"));
      function layer(cls) {
        var l = document.createElementNS(NS, "g");
        l.setAttribute("class", cls);
        paths.forEach(function (p) { l.appendChild(p.cloneNode()); });
        return l;
      }
      var glass = layer("neon-glass");
      var on = document.createElementNS(NS, "g");
      on.setAttribute("class", "neon-on");
      var cast = layer("neon-cast");
      cast.setAttribute("filter", "url(#" + id + ")");
      on.appendChild(cast);
      on.appendChild(layer("neon-color"));
      on.appendChild(layer("neon-core"));
      paths.forEach(function (p) { p.remove(); });
      g.appendChild(glass);
      g.appendChild(layer("neon-shine"));
      g.appendChild(on);
      return { on: on, f: FLICKER[g.getAttribute("data-flicker")] || FLICKER.stutter };
    });

    var hours = spans(svg.dataset.hours);
    var now = minutes(svg.dataset.time);
    var open = null, seen = false, pending = false;

    function isOpen(t) {
      return hours.some(function (h) { return (t >= h[0] && t < h[1]) || (t + 1440 >= h[0] && t + 1440 < h[1]); });
    }
    function strike() {
      svg.classList.add("is-lit");
      if (reduce.matches) return;
      circuits.forEach(function (c) {
        c.on.getAnimations().forEach(function (a) { a.cancel(); });
        c.on.animate(c.f.k.map(function (k) { return { offset: k[0], opacity: k[1], easing: "steps(1, end)" }; }),
          { duration: c.f.dur, delay: c.f.delay, fill: "backwards" });
      });
    }
    function update(fire) {
      var o = isOpen(now);
      if (o === open) return;
      open = o;
      if (!o) {
        pending = false;
        svg.classList.remove("is-lit");
        circuits.forEach(function (c) { c.on.getAnimations().forEach(function (a) { a.cancel(); }); });
      } else if (seen) strike();
      else pending = true;
      if (fire) svg.dispatchEvent(new CustomEvent("neon", { detail: { open: o, time: now } }));
    }

    svg.neon = {
      setTime: function (t) { now = ((minutes(t) % 1440) + 1440) % 1440; svg.dataset.time = now; update(true); },
      isOpen: function () { return !!open; },
      strike: function () { if (open) strike(); }
    };
    update(false);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          seen = true; io.disconnect();
          if (pending) { pending = false; strike(); }
        });
      }, { threshold: 0.4 });
      io.observe(svg);
    } else { seen = true; if (pending) strike(); }
  }

  function init() { document.querySelectorAll(".neon-sign").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
