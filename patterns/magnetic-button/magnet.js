/*
 * magnet.js: every .magnet drifts toward a mouse pointer that comes within data-magnet-reach pixels
 * of its edge (default 60), by data-magnet-pull of the distance (default .35), never more than
 * data-magnet-max pixels (default 12). Off for touch and pen, and under reduced motion.
 */
(function () {
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var magnets = [];
  var frame = 0;
  var last = null;

  function num(el, name, fallback) {
    var v = parseFloat(el.getAttribute(name));
    return isNaN(v) ? fallback : v;
  }

  function release(m) {
    if (!m.el.classList.contains("is-near")) return;
    m.el.classList.remove("is-near");
    m.el.style.setProperty("--magnet-x", "0px");
    m.el.style.setProperty("--magnet-y", "0px");
  }

  function update() {
    frame = 0;
    var e = last;
    magnets.forEach(function (m) {
      // measure without our own offset, so the reach does not move with the button
      var r = m.el.getBoundingClientRect();
      var t = (getComputedStyle(m.el).translate || "").split(" ");
      var ox = parseFloat(t[0]) || 0;
      var oy = parseFloat(t[1]) || 0;
      var cx = r.left - ox + r.width / 2;
      var cy = r.top - oy + r.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var reach = num(m.el, "data-magnet-reach", 60);
      var near = Math.abs(dx) < r.width / 2 + reach && Math.abs(dy) < r.height / 2 + reach;
      if (!near) { release(m); return; }
      var pull = num(m.el, "data-magnet-pull", 0.35);
      var max = num(m.el, "data-magnet-max", 12);
      var x = Math.max(-max, Math.min(max, dx * pull));
      var y = Math.max(-max, Math.min(max, dy * pull));
      m.el.classList.add("is-near");
      m.el.style.setProperty("--magnet-x", x.toFixed(1) + "px");
      m.el.style.setProperty("--magnet-y", y.toFixed(1) + "px");
    });
  }

  function move(e) {
    if (e.pointerType !== "mouse" || !fine.matches || still.matches) return;
    last = e;
    if (!frame) frame = requestAnimationFrame(update);
  }

  function releaseAll() { magnets.forEach(release); }

  function start() {
    document.querySelectorAll(".magnet").forEach(function (el) { magnets.push({ el: el }); });
    if (!magnets.length) return;
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", releaseAll);
    window.addEventListener("blur", releaseAll);
    still.addEventListener("change", releaseAll);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
