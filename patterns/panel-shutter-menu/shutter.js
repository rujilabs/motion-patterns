/*
 * shutter.js: a menu that drops as a folded strip of slats, like a concertina shutter. The slats
 * are hinged edge to edge and folded in a zig-zag, flat under the header. Opening, the top slat
 * swings down first and each one below lets go when the one above is half way down, so the stack
 * unfolds from the top; each slat lands with a small swing past hanging, and every slat below it
 * rides on its bottom edge. Closing, the bottom slat folds up first.
 *
 *   <button class="shutter-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
 *   <nav class="shutter" id="nav" aria-label="Shop">
 *     <ul class="shutter-list">
 *       <li class="shutter-slat"><a href="/paint">Paint and colour mixing</a></li>
 *       ...
 *     </ul>
 *   </nav>
 *
 * Each slat i gets --slat-a (its own angle: 0deg hanging, +90deg or -90deg folded), and --y, --z, the
 * position of the bottom edge of the slat above it. Escape closes and puts focus back on the button.
 * Without the script the menu is an ordinary open list. Reduced motion: it opens and closes at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAD = Math.PI / 180;
  var DROP = { w: 12, z: 0.48 };  // a slat with some weight: swings about 15 degrees past hanging
  var LIFT = { w: 26, z: 1 };     // folded back up by the one below it: quick, no bounce
  var LET_GO = 24;                // degrees: the next slat lets go once this one is this close

  function Shutter(btn) {
    var nav = document.getElementById(btn.getAttribute("aria-controls"));
    if (!nav || nav._shutter) return;
    var slats = Array.prototype.slice.call(nav.querySelectorAll(".shutter-slat"));
    var list = nav.querySelector(".shutter-list") || nav;
    var open = btn.getAttribute("aria-expanded") === "true";
    // zig-zag: even slats fold up toward you, odd ones fold down and away
    var s = slats.map(function (el, i) {
      var shut = i % 2 ? -90 : 90;
      return { el: el, shut: shut, a: open ? 0 : shut, v: 0, target: open ? 0 : shut, live: open };
    });
    var raf = 0, last = 0;
    nav._shutter = true;
    nav.classList.add("is-shutter");

    function layout() {
      var y = 0, z = 0, prev = 0;
      for (var i = 0; i < s.length; i++) {
        var o = s[i], h = o.el.offsetHeight, st = o.el.style;
        st.setProperty("--y", y.toFixed(2) + "px");
        st.setProperty("--z", z.toFixed(2) + "px");
        st.setProperty("--slat-a", o.a.toFixed(2) + "deg");
        st.setProperty("--kink", Math.min(90, Math.abs(o.a - prev)).toFixed(2) + "deg");
        y += h * Math.cos(o.a * RAD);
        z += h * Math.sin(o.a * RAD);
        prev = o.a;
      }
      list.style.height = Math.max(0, y).toFixed(1) + "px";
    }
    function settled() {
      return s.every(function (o) { return o.live === open && Math.abs(o.a - o.target) < 0.05 && Math.abs(o.v) < 0.5; });
    }
    function frame(t) {
      var dt = Math.min(0.032, last ? (t - last) / 1000 : 1 / 60);
      last = t;
      // release: top down when opening, bottom up when closing
      var order = open ? s : s.slice().reverse();
      for (var i = 0; i < order.length; i++) {
        var o = order[i], before = order[i - 1];
        if (o.live !== open && (!before || (before.live === open && Math.abs(before.a - before.target) < LET_GO))) {
          o.live = open;
          o.target = open ? 0 : o.shut;
        }
      }
      s.forEach(function (o) {
        var sp = o.target === 0 ? DROP : LIFT, k = sp.w * sp.w, c = 2 * sp.z * sp.w, q = dt / 4;
        for (var n = 0; n < 4; n++) { o.v += (-k * (o.a - o.target) - c * o.v) * q; o.a += o.v * q; }
      });
      layout();
      if (settled()) {
        raf = 0; last = 0;
        s.forEach(function (o) { o.a = o.target; o.v = 0; });
        layout();
        if (!open) nav.hidden = true;
        nav.classList.remove("is-moving");
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    function set(next) {
      if (next === open) return;
      open = next;
      btn.setAttribute("aria-expanded", String(open));
      nav.dispatchEvent(new CustomEvent(open ? "shutteropen" : "shutterclose"));
      if (open) nav.hidden = false;
      if (reduce.matches) {
        cancelAnimationFrame(raf); raf = 0;
        s.forEach(function (o) { o.live = open; o.target = o.a = open ? 0 : o.shut; o.v = 0; });
        layout();
        if (!open) nav.hidden = true;
        return;
      }
      nav.classList.add("is-moving");
      if (!raf) raf = requestAnimationFrame(frame);
    }

    btn.addEventListener("click", function () { set(!open); });
    nav.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) { set(false); btn.focus(); }
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) set(false);
    });
    if (window.ResizeObserver) new ResizeObserver(function () { if (!raf) layout(); }).observe(nav);
    nav.hidden = !open;
    layout();
    btn.shutter = { set: set, get open() { return open; } };
  }

  function init() { document.querySelectorAll(".shutter-toggle[aria-controls]").forEach(Shutter); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
