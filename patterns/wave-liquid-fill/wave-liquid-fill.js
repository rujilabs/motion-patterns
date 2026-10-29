/*
 * wave-liquid-fill.js: water fills a jar to a percentage, with a moving surface that sloshes when the level changes.
 *   <figure class="liquid-fill" data-value="70.3">
 *     <svg viewBox="0 0 220 260">
 *       <defs><clipPath id="jar-inside"><path class="lf-inside" d="..."/></clipPath></defs>
 *       <g class="lf-liquid" clip-path="url(#jar-inside)"></g>
 *       ...your glass, drawn over the liquid...
 *     </svg>
 *     <span class="lf-pct">70%</span>      (optional, counts with the level; or data-label="id" for one outside)
 *   </figure>
 * 0% is the bottom of .lf-inside, 100% is data-full (a y in the SVG's units), or the top of .lf-inside.
 * The surface is three travelling sines that obey deep-water dispersion (a longer wave runs faster,
 * w = sqrt(g k)), plus the jar's first sloshing mode, a tilt whose frequency falls as the water gets
 * shallower (w^2 = g k tanh(k h)). A change of level kicks both, then they die away to a flat surface
 * and drawing stops. The level, the waves and the slosh read their time from Web Animations on the svg,
 * so the gallery timeline can pause and scrub them. Change data-value to fill again.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var G = 400;                              // gravity in SVG units per s^2, picked so a 15 cm jar reads well on screen
  var WAVES = [                             // wavelength (SVG units), relative height, direction, phase
    { l: 150, a: 1, dir: 1, ph: 0.4 },
    { l: 86, a: 0.55, dir: -1, ph: 2.1 },
    { l: 49, a: 0.3, dir: 1, ph: 4.4 }
  ];
  var TAU_WAVES = 1.5;                      // s for the ripples to lose 63% of their height
  var TAU_SLOSH = 2.1;                      // the slosh lasts longer than the ripples
  var SETTLE = 7000;                        // ms until the surface is flat again

  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  function setup(el) {
    if (el.liquid) return;
    var svg = el.querySelector("svg");
    var inside = el.querySelector(".lf-inside");
    var layer = el.querySelector(".lf-liquid");
    var pct = el.querySelector(".lf-pct") || (el.dataset.label && document.getElementById(el.dataset.label));
    var NS = "http://www.w3.org/2000/svg";
    var top = document.createElementNS(NS, "path"), body = document.createElementNS(NS, "path"), edge = document.createElementNS(NS, "path");
    top.setAttribute("class", "lf-top"); body.setAttribute("class", "lf-body"); edge.setAttribute("class", "lf-edge");
    layer.appendChild(top); layer.appendChild(body); layer.appendChild(edge);

    // measure the inside on a visible copy: shapes inside <clipPath> have no box in every browser
    var probe = inside.cloneNode(false);
    probe.setAttribute("opacity", "0");
    svg.appendChild(probe);
    var bb = probe.getBBox();
    svg.removeChild(probe);
    var x0 = bb.x, x1 = bb.x + bb.width, W = bb.width, xc = x0 + W / 2;
    var yBottom = bb.y + bb.height;
    var yFull = el.dataset.full ? +el.dataset.full : bb.y;
    var decimals = +el.dataset.decimals || 0;
    WAVES.forEach(function (w) { w.k = 2 * Math.PI / w.l; w.w = Math.sqrt(G * w.k); });
    var kS = Math.PI / W;                    // first sloshing mode: half a wavelength across the jar

    var level = 0;                           // fraction shown now
    var from = 0, to = 0;                    // the level ride
    var E0 = 0, A = 0, B = 0, wS = 1;        // ripple height; slosh as e^(-t/tau) (A cos wt + B sin wt)
    var phase = 0;                           // ripple time carried over between kicks
    var rise = null, settle = null, drawn = "";

    function clock(ms, id, easing) {
      var a = svg.animate([{ opacity: 1 }, { opacity: 1 }], { duration: ms, fill: "both", easing: easing || "linear" });
      a.id = id;
      return a;
    }
    function t(anim) {
      if (!anim) return Infinity;
      var c = anim.currentTime;
      return c == null ? Infinity : c / 1000;
    }
    function p(anim, ms) { return anim ? Math.min(1, Math.max(0, (anim.currentTime || 0) / ms)) : 1; }

    function slosh(s) {
      var e = Math.exp(-s / TAU_SLOSH);
      return { y: e * (A * Math.cos(wS * s) + B * Math.sin(wS * s)),
               v: e * (-A * wS * Math.sin(wS * s) + B * wS * Math.cos(wS * s)) - e * (A * Math.cos(wS * s) + B * Math.sin(wS * s)) / TAU_SLOSH };
    }

    function render() {
      var s = t(settle), done = s === Infinity || s * 1000 >= SETTLE;
      var lp = rise ? p(rise, rise._ms) : 1;
      level = from + (to - from) * easeOut(lp);
      var Y = yBottom - (yBottom - yFull) * level;
      var e = done ? 0 : E0 * Math.exp(-s / TAU_WAVES);
      var tilt = done ? 0 : slosh(s).y;
      var time = phase + (done ? 0 : s);
      var sig = Y.toFixed(2) + "," + e.toFixed(3) + "," + tilt.toFixed(3) + "," + time.toFixed(3);
      if (sig === drawn) return;
      drawn = sig;
      if (level <= 0.0005) { top.setAttribute("d", ""); body.setAttribute("d", ""); edge.setAttribute("d", ""); }
      else {
        var front = [], back = [], depth = Math.min(4.5, (yBottom - Y) * 0.35);   // we look down on the water a little
        for (var x = x0 - 2; x <= x1 + 2.01; x += 3) {
          var u = x - x0, hf = 0, hb = 0;
          for (var i = 0; i < WAVES.length; i++) {
            var w = WAVES[i], arg = w.k * u - w.dir * w.w * time + w.ph;
            hf += w.a * Math.sin(arg);
            hb += w.a * Math.sin(arg + 1.3 + i);   // the far side of the surface is a different slice of the same sea
          }
          var lean = tilt * (x - xc) / (W / 2);
          front.push(x.toFixed(1) + " " + (Y + e * hf + lean).toFixed(2));
          back.push(x.toFixed(1) + " " + (Y - depth + e * 0.8 * hb + lean).toFixed(2));
        }
        var line = "M" + front.join(" L");
        body.setAttribute("d", line + " L" + (x1 + 2) + " " + (yBottom + 4) + " L" + (x0 - 2) + " " + (yBottom + 4) + "Z");
        top.setAttribute("d", "M" + back.join(" L") + " L" + front.reverse().join(" L") + "Z");
        edge.setAttribute("d", line);
      }
      if (pct) pct.textContent = (level * 100).toFixed(decimals) + "%";
    }

    function go(value, kick) {
      value = Math.max(0, Math.min(100, value)) / 100;
      if (reduce.matches || !svg.animate) {
        from = to = value; rise = null; if (settle) settle.cancel(); settle = null; E0 = A = B = 0; drawn = ""; render();
        return;
      }
      // carry what is moving now into the new ride, so nothing jumps
      var s = t(settle), alive = s !== Infinity && s * 1000 < SETTLE;
      var now = alive ? slosh(s) : { y: 0, v: 0 };
      var eNow = alive ? E0 * Math.exp(-s / TAU_WAVES) : 0;
      if (alive) phase += s;
      render();
      from = level; to = value;
      var d = Math.abs(to - from);
      var h = Math.max(4, (yBottom - yFull) * Math.max(from, to));
      wS = Math.sqrt(G * kS * Math.tanh(kS * h));      // shallow water sloshes slower
      E0 = Math.min(5.5, eNow + (kick || 1) * (1.1 + 22 * d));
      var dv = (to >= from ? 1 : -1) * Math.min(8, (kick || 1) * (1.6 + 34 * d)) * wS;
      A = now.y;
      B = (now.v + dv + A / TAU_SLOSH) / wS;
      var ms = Math.round(Math.min(2400, 700 + 2400 * d));
      if (rise) rise.cancel();
      if (settle) settle.cancel();
      rise = clock(ms, "level rises"); rise._ms = ms;
      settle = clock(SETTLE, "surface settles");
      drawn = "";
    }

    var started = false;
    (function frame() { render(); requestAnimationFrame(frame); })();
    new MutationObserver(function () { if (started) go(+el.dataset.value || 0); })
      .observe(el, { attributes: true, attributeFilter: ["data-value"] });

    el.liquid = {
      set: function (v) { el.dataset.value = v; },
      splash: function (kick) { if (started) go(to * 100, kick || 1); }
    };
    el.classList.add("is-ready");
    function start() { started = true; go(+el.dataset.value || 0, 1.6); }
    if (reduce.matches || !("IntersectionObserver" in window)) start();
    else {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); start(); } }, { threshold: 0.4 });
      io.observe(el);
    }
  }

  function init() { document.querySelectorAll(".liquid-fill").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
