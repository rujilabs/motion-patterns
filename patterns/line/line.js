/*
 * line.js: syncs the area wipe and the notes of a .line-chart with its pen. The pen draws by arc
 * length; this measures where along x the pen is at each point of its run and turns that into
 * keyframes, so the area edge sits under the pen tip and each note lands as the pen passes it.
 * Notes say where they sit with data-x, in the svg's own units. Needs play.js for the .go start.
 */
(function () {
  if (!("animate" in Element.prototype)) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");

  function timing(el) {
    var a = el.getAnimations().filter(function (x) { return x.animationName === "line-draw"; })[0];
    if (!a) return null;
    var t = a.effect.getTiming();
    // a CSS animation keeps its curve on the keyframes, not on the effect; read it from the style
    return { duration: t.duration, delay: t.delay, easing: getComputedStyle(el).animationTimingFunction };
  }

  // progress of the eased run at each of n+1 even steps in time, read from the browser's own easing
  function curve(easing, n) {
    var probe = new Animation(new KeyframeEffect(null, null, { duration: 1000, easing: easing }));
    var out = [];
    for (var i = 0; i <= n; i++) { probe.currentTime = (1000 * i) / n; out.push(probe.effect.getComputedTiming().progress); }
    return out;
  }

  function run(chart) {
    if (chart.dataset.lineRun) return;
    var pen = chart.querySelector(".line-pen");
    var t = pen && timing(pen);
    if (!t) return;
    chart.dataset.lineRun = "1";
    var svg = pen.ownerSVGElement, vb = svg.viewBox.baseVal;
    var len = pen.getTotalLength();
    var opts = { duration: t.duration, delay: t.delay, easing: t.easing, fill: "both" };

    var area = chart.querySelector(".line-area");
    if (area) {
      // an inset on an svg shape is a share of the shape's own box
      var box = area.getBBox(), frames = [];
      for (var i = 0; i <= 40; i++) {
        var x = pen.getPointAtLength((len * i) / 40).x;
        var right = Math.max(0, Math.min(100, (1 - (x - box.x) / box.width) * 100));
        frames.push({ clipPath: "inset(0 " + right.toFixed(2) + "% 0 0)", offset: i / 40 });
      }
      area.getAnimations().forEach(function (a) { a.cancel(); });
      area.animate(frames, opts);
    }

    var notes = chart.querySelectorAll(".line-note[data-x]");
    if (!notes.length) return;
    var ease = curve(t.easing, 200);
    var spring = getComputedStyle(document.documentElement).getPropertyValue("--ease-spring").trim() || "ease-out";
    notes.forEach(function (note) {
      var nx = parseFloat(note.dataset.x) + vb.x;
      // first arc fraction where the pen reaches nx, then the first moment in time the run gets there
      var f = 1;
      for (var s = 0; s <= 400; s++) { if (pen.getPointAtLength((len * s) / 400).x >= nx) { f = s / 400; break; } }
      var k = 0;
      while (k < 200 && ease[k] < f) k++;
      note.getAnimations().forEach(function (a) { a.cancel(); });
      note.animate([{ opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }],
        { duration: 600, delay: t.delay + (t.duration * k) / 200, easing: spring, fill: "both" });
    });
  }

  function watch(chart) {
    var host = chart.closest("[data-play]") || chart;
    function check() { if (host.classList.contains("go") || chart.closest(".go")) { mo.disconnect(); requestAnimationFrame(function () { run(chart); }); } }
    var mo = new MutationObserver(check);
    mo.observe(host, { attributes: true, attributeFilter: ["class"] });
    check();
  }

  function start() {
    if (reduce && reduce.matches) return;
    document.querySelectorAll(".line-chart").forEach(watch);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
