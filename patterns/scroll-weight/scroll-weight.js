/*
 * scroll-weight.js: scrubs each .weight part's own CSS animation to its scene's scroll progress through a
 * critically damped spring (exact step, so it is stable at any frame time and never overshoots). Runs only
 * while something is moving; off under reduced motion, where the CSS parks every part at its end.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function start() {
    if (still.matches) return;
    var parts = [];
    document.querySelectorAll(".weight").forEach(function (el) {
      var a = el.getAnimations ? el.getAnimations()[0] : null;
      if (!a) return;
      var w = parseFloat(el.getAttribute("data-weight"));
      parts.push({
        a: a, dur: a.effect.getComputedTiming().duration,
        scene: el.closest("[data-weight-scene]") || document.documentElement,
        w: isNaN(w) ? 12 : w, x: NaN, v: 0
      });
    });
    if (!parts.length) return;
    var raf = 0, last = 0;
    function frame(t) {
      var s = Math.min(0.064, last ? (t - last) / 1000 : 0.016); last = t;
      var vh = window.innerHeight, moving = false;
      parts.forEach(function (p) {
        var r = p.scene.getBoundingClientRect();
        var target = clamp(-r.top / Math.max(1, r.height - vh));
        if (isNaN(p.x) || !p.w) { p.x = target; p.v = 0; }
        else {
          var e0 = p.x - target, c = p.v + p.w * e0, ex = Math.exp(-p.w * s);
          var e = (e0 + c * s) * ex;
          p.v = (p.v - p.w * c * s) * ex;
          if (Math.abs(e) < 0.0004 && Math.abs(p.v) < 0.004) { p.x = target; p.v = 0; }
          else { p.x = target + e; moving = true; }
        }
        p.a.currentTime = p.x * p.dur;
      });
      if (moving) raf = requestAnimationFrame(frame); else { raf = 0; last = 0; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
