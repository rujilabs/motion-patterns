/*
 * lanyard-badge.js: a badge on a lanyard you can drag, let go, and watch swing and settle.
 *   <div class="lanyard">          (--lanyard-length: strap length in px, from a pivot 40 px above the box)
 *     <svg class="lanyard-strap" aria-hidden="true"></svg>
 *     <div class="lanyard-badge" tabindex="0">...</div>
 *   </div>
 * The strap is a pendulum from a pivot above the box: theta'' = -(g/L) sin(theta) - c theta'. The badge
 * hangs from the strap's end on a clip and lags behind it on its own small spring, so it twists a little
 * as the strap changes direction. Damped to rest in about 4 seconds, as a real lanyard is.
 * Arrow keys nudge it, Enter or Space give a bigger push. Time for the swing comes from a Web Animation
 * ("badge swing"), so the gallery timeline can pause it.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var K = 20, DAMP = 2.1;          // (2 pi / 1.4 s) squared: a 1.4 s swing; damping per second
  var K2 = 110, DAMP2 = 8;         // the badge on its clip
  var MAX = 0.85;                   // the furthest a drag can lift it, radians (about 49 degrees)
  var PIVOT = 40;                   // px above the box where the strap hangs from

  function setup(box) {
    var strap = box.querySelector(".lanyard-strap");
    var badge = box.querySelector(".lanyard-badge");
    var L = parseFloat(getComputedStyle(box).getPropertyValue("--lanyard-length")) || 200;
    var th = 0, w = 0, ps = 0, pw = 0, raf = 0, last = 0, clock = null, drag = null;
    var NS = "http://www.w3.org/2000/svg";
    var band = document.createElementNS(NS, "path"), print = document.createElementNS(NS, "path");
    band.setAttribute("class", "lanyard-band"); print.setAttribute("class", "lanyard-print");
    strap.appendChild(band); strap.appendChild(print);

    function place() {
      var cx = box.clientWidth / 2, py = -PIVOT;
      var x = cx + L * Math.sin(th), y = py + L * Math.cos(th);
      // the strap bows away from the way it is moving
      var bow = Math.max(-26, Math.min(26, -w * 9));
      var mx = (cx + x) / 2 + bow * Math.cos(th), my = (py + y) / 2 - bow * Math.sin(th) * 0.5;
      var d = "M" + (cx - 15) + " " + py + "Q" + (mx - 4) + " " + my + " " + x.toFixed(1) + " " + y.toFixed(1) +
        "M" + (cx + 15) + " " + py + "Q" + (mx + 4) + " " + my + " " + x.toFixed(1) + " " + y.toFixed(1);
      band.setAttribute("d", d); print.setAttribute("d", d);
      badge.style.transform = "translate(" + (x - badge.offsetWidth / 2).toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + (-ps * 57.296).toFixed(2) + "deg)";
    }
    function step(dt) {
      if (!drag) { var a = -K * Math.sin(th) - DAMP * w; w += a * dt; th += w * dt; }
      var a2 = -K2 * (ps - th) - DAMP2 * pw; pw += a2 * dt; ps += pw * dt;
    }
    function quiet() {
      if (clock && clock.playState === "finished") return true;     // the swing clock ran out: hang it straight
      return !drag && Math.abs(th) < 0.008 && Math.abs(w) < 0.03 && Math.abs(ps) < 0.008 && Math.abs(pw) < 0.03;
    }
    function frame(now) {
      var t = clock && clock.currentTime != null ? clock.currentTime : now;
      var dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
      last = t;
      for (var i = 0; i < 4; i++) step(dt / 4);
      place();
      if (quiet()) { th = w = ps = pw = 0; place(); stop(); return; }
      raf = requestAnimationFrame(frame);
    }
    function run() {
      if (reduce.matches) { if (!drag) { th = w = ps = pw = 0; } place(); return; }
      if (!clock && !drag && badge.animate) {
        clock = badge.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 6000, fill: "none" });
        clock.id = "badge swing";
        last = 0;
      } else if (!clock) last = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (clock) clock.cancel();
      clock = null;
    }

    function angleAt(e) {
      var r = box.getBoundingClientRect();
      return Math.atan2(e.clientX - (r.left + box.clientWidth / 2), e.clientY - (r.top - PIVOT));
    }
    badge.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      badge.setPointerCapture(e.pointerId);
      stop();
      drag = { off: angleAt(e) - th, t: performance.now() };
      w = 0;
      badge.classList.add("is-held");
      last = performance.now();
      run();
    });
    badge.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var now = performance.now(), next = Math.max(-MAX, Math.min(MAX, angleAt(e) - drag.off));
      var dt = Math.max(0.008, (now - drag.t) / 1000);
      w = w * 0.5 + ((next - th) / dt) * 0.5;      // smoothed, so the throw follows the hand
      th = next; drag.t = now;
      if (reduce.matches) { ps = th; place(); }
    });
    function letGo() {
      if (!drag) return;
      drag = null;
      badge.classList.remove("is-held");
      w = Math.max(-4, Math.min(4, w));
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      run();
    }
    badge.addEventListener("pointerup", letGo);
    badge.addEventListener("pointercancel", letGo);
    badge.addEventListener("keydown", function (e) {
      var push = { ArrowLeft: -0.9, ArrowRight: 0.9, Enter: 1.7, " ": 1.7 }[e.key];
      if (push === undefined) return;
      e.preventDefault();
      if (reduce.matches) return;
      if (e.key === "Enter" || e.key === " ") push *= (th > 0 || w > 0) ? 1 : -1;
      stop();
      w = Math.max(-3, Math.min(3, w + push));
      run();
    });

    place();
    if (window.ResizeObserver) new ResizeObserver(place).observe(box);
    badge.classList.add("is-ready");
    box.lanyard = { nudge: function (v) { if (reduce.matches) return; stop(); w += v; run(); } };
  }

  function start() { document.querySelectorAll(".lanyard").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
