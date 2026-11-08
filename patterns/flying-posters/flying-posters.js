/*
 * flying-posters.js: every .fp section gets .fp-on, and each .fp-poster its place in the line
 * (--fp-i of --fp-n) and a spot round the centre (--fp-x, --fp-y, in % of a poster), alternating
 * left and right so no two in a row cover each other. Set --fp-x and --fp-y yourself in CSS to
 * place them by hand; the script leaves posters that already have them.
 * Where scroll timelines are missing, it scrubs each poster's paused fp-fly animation from how far
 * the section has scrolled through its sticky hold. Does nothing under reduced motion.
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var SPOTS = [[-62, -22], [64, 18], [-58, 30], [60, -30], [-18, 8], [22, -10], [-70, 4], [70, 2]];

  function setup(fp) {
    var posters = [].slice.call(fp.querySelectorAll(".fp-poster"));
    if (!posters.length) return;
    var n = posters.length;
    fp.style.setProperty("--fp-n", n);
    posters.forEach(function (p, i) {
      p.style.setProperty("--fp-i", i);
      var cs = getComputedStyle(p);
      if (!cs.getPropertyValue("--fp-x").trim()) {
        var s = i === n - 1 ? [0, 0] : SPOTS[i % SPOTS.length]; // the last one comes straight at you
        p.style.setProperty("--fp-x", s[0] + "%");
        p.style.setProperty("--fp-y", s[1] + "%");
      }
    });
    fp.classList.add("fp-on");
    if (window.CSS && CSS.supports("animation-timeline: view()")) return;

    // fallback: same keyframes, driven by the scroll position
    var span = (parseFloat(getComputedStyle(fp).getPropertyValue("--fp-span")) || 40) / 100, frame = 0;
    function scrub() {
      frame = 0;
      var r = fp.getBoundingClientRect();
      var hold = Math.max(1, r.height - window.innerHeight);
      var t = Math.min(1, Math.max(0, -r.top / hold));
      posters.forEach(function (p, i) {
        var a = p.getAnimations()[0];
        if (!a) return;
        var start = n > 1 ? (1 - span) * i / (n - 1) : 0;
        a.currentTime = Math.min(1, Math.max(0, (t - start) / span)) * 999;
      });
    }
    function ask() { if (!frame) frame = requestAnimationFrame(scrub); }
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    scrub();
  }

  function start() { document.querySelectorAll(".fp").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
