/*
 * light-pointer-spotlight.js: a lamp that follows the pointer over a .spotlight grid.
 *   <div class="spotlight"> <a class="spotlight-item">...</a> ... </div>
 * The lamp hangs a set height over the surface. Its pool of light is drawn by style.css as a mask with
 * a Lambert falloff; this file only moves the lamp. It glides after the pointer like a hand-held lamp
 * (a critically damped spring, no overshoot), comes down when the pointer arrives and lifts away when
 * it leaves: lifting doubles the height, so the pool widens and gets 4 times dimmer (1 / h^2), then goes out.
 * Keyboard focus on an item brings the lamp to the middle of that item.
 *   data-spot-size    reach of the light, as a share of an item's longer side (default 1.15)
 *   data-spot-follow  how fast the lamp catches up, per second (default 22; 0 = no glide)
 *   el.spotlight.aim(x, y, on)  moves the lamp from code (box px); on = false lifts it away
 * "spotmove" fires on the container with detail.item (the item under the lamp, or null).
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(box) {
    if (box._spot) return;
    box._spot = true;
    var items = Array.prototype.slice.call(box.querySelectorAll(".spotlight-item"));
    var size = parseFloat(box.dataset.spotSize) || 1.15;
    var follow = box.dataset.spotFollow !== undefined ? parseFloat(box.dataset.spotFollow) : 22;
    var boxRect = null, rects = [];
    // lamp state: position (x, y) in box px, height h (1 = resting over the surface), brightness a
    var x = 0, y = 0, vx = 0, vy = 0, h = 2, a = 0;
    var tx = 0, ty = 0, th = 2, ta = 0, placed = false;
    var raf = 0, last = 0, under = null, liftTimer = 0;

    function measure() {
      boxRect = box.getBoundingClientRect();
      rects = items.map(function (el) { return el.getBoundingClientRect(); });
    }
    function reach() {
      var m = 0;
      rects.forEach(function (r) { m = Math.max(m, r.width, r.height); });
      return (m || 200) * size;
    }
    function aim(px, py, on) {
      tx = px; ty = py;
      th = on ? 1 : 2; ta = on ? 1 : 0;
      if (!placed || reduce.matches || a < 0.02) { x = tx; y = ty; vx = vy = 0; placed = true; }
      kick();
    }
    function paint() {
      var r = reach() * h;                 // a higher lamp spreads wider ...
      var bright = a / (h * h);            // ... and dimmer, by the inverse square
      box.style.setProperty("--spot-x", x + "px");
      box.style.setProperty("--spot-y", y + "px");
      box.style.setProperty("--spot-r", r + "px");
      box.style.setProperty("--spot-a", bright.toFixed(3));
      var hit = null;
      items.forEach(function (el, i) {
        var rc = rects[i];
        var lx = x + boxRect.left - rc.left, ly = y + boxRect.top - rc.top;
        el.style.setProperty("--spot-x", lx + "px");
        el.style.setProperty("--spot-y", ly + "px");
        if (lx >= 0 && ly >= 0 && lx <= rc.width && ly <= rc.height) hit = el;
      });
      if (hit !== under) {
        under = hit;
        box.dispatchEvent(new CustomEvent("spotmove", { detail: { item: hit } }));
      }
    }
    function frame(t) {
      var dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      var moving = false;
      if (reduce.matches || !follow) { x = tx; y = ty; h = th; a = ta; }
      else {
        // critically damped spring toward the pointer: exact step, stable at any frame time
        var w = follow, e = Math.exp(-w * dt);
        var ex = x - tx, cx = vx + w * ex;
        x = tx + (ex + cx * dt) * e; vx = (vx - w * cx * dt) * e;
        var ey = y - ty, cy = vy + w * ey;
        y = ty + (ey + cy * dt) * e; vy = (vy - w * cy * dt) * e;
        // height and brightness ease on their own, slower: about 0.3 s down, 0.45 s up
        var k = 1 - Math.exp(-dt * (th < h ? 11 : 7));
        h += (th - h) * k; a += (ta - a) * k;
        moving = Math.abs(x - tx) > 0.3 || Math.abs(y - ty) > 0.3 || Math.abs(h - th) > 0.004 || Math.abs(a - ta) > 0.004;
        if (!moving) { x = tx; y = ty; h = th; a = ta; vx = vy = 0; }
      }
      paint();
      if (moving) raf = requestAnimationFrame(frame);
      else { raf = 0; last = 0; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function local(e) { return [e.clientX - boxRect.left, e.clientY - boxRect.top]; }

    box.addEventListener("pointerenter", function (e) { clearTimeout(liftTimer); measure(); var p = local(e); aim(p[0], p[1], true); });
    box.addEventListener("pointermove", function (e) {
      if (!boxRect) measure();
      var p = local(e); aim(p[0], p[1], true);
    });
    box.addEventListener("pointerdown", function (e) { clearTimeout(liftTimer); measure(); var p = local(e); aim(p[0], p[1], true); });
    // a finger lifts off the glass: leave the lamp a moment, then raise it
    box.addEventListener("pointerup", function (e) {
      if (e.pointerType !== "mouse") liftTimer = setTimeout(function () { aim(tx, ty, false); }, 900);
    });
    box.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") aim(tx, ty, false); });
    box.addEventListener("focusin", function (e) {
      var el = e.target.closest(".spotlight-item");
      if (!el || !el.matches(":focus-visible")) return;
      measure();
      var rc = el.getBoundingClientRect();
      aim(rc.left - boxRect.left + rc.width / 2, rc.top - boxRect.top + rc.height / 2, true);
    });
    box.addEventListener("focusout", function (e) {
      if (!box.contains(e.relatedTarget)) aim(tx, ty, false);
    });
    window.addEventListener("resize", function () { measure(); paint(); });
    // light it from code: box.spotlight.aim(x, y, true) in box px, or .aim(0, 0, false) to lift it away
    box.spotlight = { aim: function (px, py, on) { measure(); aim(px, py, on); } };
    window.addEventListener("scroll", function () { if (boxRect) measure(); }, { passive: true });
    measure();
  }

  function init() { document.querySelectorAll(".spotlight").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
