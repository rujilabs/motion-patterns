/*
 * scroll-expand-media.js: only for browsers without CSS scroll timelines. It makes each .se tall
 * (.se-live) and runs the same three moves as style.css with the Web Animations API, paused, setting
 * their time from how far the pinned section has scrolled. Does nothing under reduced motion.
 */
(function () {
  if (window.CSS && CSS.supports("animation-timeline: view()")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !Element.prototype.animate) return;

  function setup(se) {
    var media = se.querySelector(".se-media"), img = media && media.querySelector("img"), cap = se.querySelector(".se-caption");
    if (!media) return;
    se.classList.add("se-live");
    var cs = getComputedStyle(se);
    function v(name, fallback) { return cs.getPropertyValue(name).trim() || fallback; }
    var end = parseFloat(v("--se-end", "60%")) / 100;
    var shut = "inset(" + v("--se-y", "20%") + " " + v("--se-x", "22%") + " round " + v("--se-round", "18px") + ")";
    var anims = [
      { a: media.animate([{ clipPath: shut }, { clipPath: "inset(0 round 0)" }], { duration: 1000, fill: "both" }), from: 0, to: end },
      img && { a: img.animate([{ transform: "scale(" + v("--se-zoom", "1.16") + ")" }, { transform: "none" }], { duration: 1000, fill: "both" }), from: 0, to: end },
      cap && { a: cap.animate([{ opacity: 0, transform: "translateY(" + (v("--rise-y", "18px")) + ")" }, { opacity: 1, transform: "none" }], { duration: 1000, fill: "both" }), from: end + 0.04, to: end + 0.22 }
    ].filter(Boolean);
    anims.forEach(function (x) { x.a.pause(); });
    var queued = false;
    function update() {
      queued = false;
      var r = se.getBoundingClientRect(), run = r.height - window.innerHeight;
      var p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1;
      anims.forEach(function (x) {
        x.a.currentTime = 1000 * Math.min(1, Math.max(0, (p - x.from) / (x.to - x.from)));
      });
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    update();
  }

  function start() { document.querySelectorAll(".se").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
