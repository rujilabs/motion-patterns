/*
 * dock-magnify.js: every .dock grows its .dock-item children by their distance to the pointer
 * (mouse, or a finger dragged along the bar), or to the item with keyboard focus.
 * data-dock-max: largest scale (default 1.6). data-dock-reach: how far the swell spreads, in px (default 130).
 * Distances use the rest layout, so items do not chase the pointer while they grow.
 * Under reduced motion nothing grows; the label still shows.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function num(el, name, fallback) {
    var v = parseFloat(el.getAttribute(name));
    return isNaN(v) ? fallback : v;
  }

  function setup(dock) {
    var items = [].slice.call(dock.querySelectorAll(".dock-item"));
    if (!items.length) return;
    var max = num(dock, "data-dock-max", 1.6);
    var reach = num(dock, "data-dock-reach", 130);
    var frame = 0;
    var target = null;
    var pressed = false;

    // centre of item i when nothing is magnified: the dock stays centred, so its centre is fixed
    function restCentres() {
      var cs = getComputedStyle(dock);
      var size = parseFloat(cs.getPropertyValue("--dock-size")) || 44;
      var gap = parseFloat(cs.columnGap) || 0;
      var r = dock.getBoundingClientRect();
      var whole = items.length * size + (items.length - 1) * gap;
      var left = r.left + r.width / 2 - whole / 2;
      return items.map(function (_, i) { return left + i * (size + gap) + size / 2; });
    }

    function paint() {
      frame = 0;
      if (target === null) return;
      var cs = restCentres();
      var best = -1, bestD = Infinity;
      cs.forEach(function (c, i) {
        var d = Math.abs(target - c);
        if (d < bestD) { bestD = d; best = i; }
        var t = Math.max(0, 1 - d / reach);
        var s = still.matches ? 1 : 1 + (max - 1) * (0.5 - 0.5 * Math.cos(Math.PI * t));
        items[i].style.setProperty("--dock-s", s.toFixed(3));
      });
      items.forEach(function (it, i) { it.classList.toggle("is-hot", i === best && bestD < reach / 2); });
    }

    function aim(x) {
      target = x;
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function rest() {
      target = null;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      items.forEach(function (it) { it.style.removeProperty("--dock-s"); it.classList.remove("is-hot"); });
      var f = document.activeElement;
      if (f && items.indexOf(f) > -1 && f.matches(":focus-visible")) aimAt(f);
    }

    function aimAt(item) {
      var i = items.indexOf(item);
      if (i > -1) aim(restCentres()[i]);
    }

    dock.addEventListener("pointermove", function (e) {
      if (e.pointerType === "mouse" || pressed) aim(e.clientX);
    });
    dock.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      pressed = true;
      aim(e.clientX);
    });
    function lift(e) {
      if (e.pointerType === "mouse") return;
      pressed = false;
      setTimeout(function () { if (!pressed) rest(); }, 450);
    }
    dock.addEventListener("pointerup", lift);
    dock.addEventListener("pointercancel", lift);
    dock.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") rest(); });
    dock.addEventListener("focusin", function (e) {
      if (e.target.matches(":focus-visible")) aimAt(e.target.closest(".dock-item"));
    });
    dock.addEventListener("focusout", function (e) {
      if (!dock.contains(e.relatedTarget) && !dock.matches(":hover")) rest();
    });
    still.addEventListener("change", rest);
  }

  function start() { document.querySelectorAll(".dock").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
