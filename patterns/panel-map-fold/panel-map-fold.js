/*
 * panel-map-fold.js: folds any wide content (a drawn map, a plan, a timetable) into equal panels
 * that open one crease at a time, like a printed map. Each panel is a window onto a copy of the
 * same content, shifted by its own width, so the picture runs on unbroken across every crease.
 *
 *   <div class="mapfold" data-panels="4" data-value="0" aria-label="Map to the hall">
 *     <svg viewBox="0 0 360 288">...</svg>
 *   </div>
 *
 * The panels are nested: each one hangs on the right edge of the one before (a roll fold, every
 * crease the same way), so a folded panel carries the rest of the stack on its back. One number,
 * u (0 folded, panels - 1 open), drives every crease: crease k turns from 180deg to 0deg while u
 * goes from k - 1 to k. A damped spring moves u, so a panel lands, swings a few degrees past flat
 * and settles; pulling the edge sets u directly and a flick carries on to the next crease.
 *
 * It becomes a role="slider": Arrow Right or Up opens one crease, Left or Down folds one, Home folds
 * it all, End opens it all, Enter or Space opens or folds the lot, a tap opens the next crease.
 * It fires "foldchange" (detail.value) when it comes to rest. el.mapfold.set(n) moves it from code.
 * Without the script the content shows flat. Reduced motion: no swing, it jumps to the crease.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAD = Math.PI / 180;
  var W = 9, Z = 0.5;     // spring: about 10 degrees past flat, then settled within 0.8 s
  var PAPER = 1.2;         // px between two folded layers, so they never cut through each other

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  function Fold(el) {
    var n = Math.max(2, parseInt(el.getAttribute("data-panels"), 10) || 4), folds = n - 1;
    var art = el.firstElementChild;
    if (!art) return;
    var label = el.getAttribute("aria-label") || "Folded map";

    // build: sheet > panel 0 > (face, back, panel 1 > (face, back, panel 2 > ...))
    var shadow = document.createElement("div");
    shadow.className = "mapfold-shadow";
    var sheet = document.createElement("div");
    sheet.className = "mapfold-sheet";
    var panels = [], parent = sheet;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("div"), face = document.createElement("div"), win = document.createElement("div"), back = document.createElement("div");
      p.className = "mapfold-panel";
      face.className = "mapfold-face";
      win.className = "mapfold-win";
      back.className = "mapfold-back";
      p.style.setProperty("--i", i);
      var copy = i === 0 ? art : art.cloneNode(true);
      win.appendChild(copy);
      face.appendChild(win);
      p.appendChild(face);
      p.appendChild(back);
      parent.appendChild(p);
      panels.push(p);
      parent = p;
    }
    el.appendChild(shadow);
    el.appendChild(sheet);
    el.style.setProperty("--mapfold-n", n);
    el.classList.add("is-live");

    el.setAttribute("role", "slider");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", label);
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", String(folds));

    var w = 0;
    function measure() {
      w = el.clientWidth / n;
      el.style.setProperty("--mapfold-w", w + "px");
      el.style.setProperty("--mapfold-h", panels[0].querySelector(".mapfold-win").offsetHeight + "px");
    }

    var u = clamp(parseFloat(el.getAttribute("data-value")) || 0, 0, folds);
    // goal is where it is going; target is the next crease on the way, so several folds open one
    // after another, each with its own swing, instead of in one sweep
    var target = u, goal = u, v = 0, raf = 0, last = 0;

    function paint() {
      var b = 0, x = 0, reach = w;
      for (var k = 1; k < n; k++) {
        // how folded crease k is: 1 shut, 0 flat. The last crease may swing a little past flat.
        var f = clamp(k - u, k === folds ? -0.06 : 0, 1);
        panels[k]._f = f;
      }
      for (k = 0; k < n; k++) {
        var p = panels[k];
        if (k > 0) {
          var f = p._f, inside = 0;
          for (var j = k + 1; j < n; j++) inside += Math.max(0, panels[j]._f);
          var c = f * 180;
          b += c;
          p.style.setProperty("--crease", c.toFixed(2) + "deg");
          p.style.setProperty("--dz", (-PAPER * (1 + inside) * Math.max(0, f)).toFixed(2) + "px");
        }
        p.style.setProperty("--turn", b.toFixed(2) + "deg");
        x += w * Math.cos(b * RAD);
        reach = Math.max(reach, x);
      }
      el.style.setProperty("--mapfold-reach", reach.toFixed(1) + "px");
    }
    function announce() {
      var t = Math.round(goal);
      el.setAttribute("aria-valuenow", String(t));
      el.setAttribute("aria-valuetext", t === 0 ? "Folded" : t === folds ? "Fully open" : t + " of " + folds + " folds open");
    }
    function rest() {
      raf = 0; last = 0; v = 0; u = target = goal;
      paint();
      el.dispatchEvent(new CustomEvent("foldchange", { detail: { value: Math.round(goal) } }));
    }
    function frame(t) {
      var dt = Math.min(0.032, last ? (t - last) / 1000 : 1 / 60);
      last = t;
      var q = dt / 4;
      for (var s = 0; s < 4; s++) { v += (-W * W * (u - target) - 2 * Z * W * v) * q; u += v * q; }
      if (target !== goal && Math.abs(u - target) < 0.3) target += goal > target ? 1 : -1;
      if (target === goal && Math.abs(u - target) < 0.0015 && Math.abs(v) < 0.01) return rest();
      paint();
      raf = requestAnimationFrame(frame);
    }
    function go(to) {
      goal = clamp(Math.round(to), 0, folds);
      // the first crease on the way: the one u is turning now, or the next one
      target = goal > u ? Math.min(goal, Math.floor(u + 0.7) + 1) : goal < u ? Math.max(goal, Math.ceil(u - 0.7) - 1) : goal;
      announce();
      if (reduce.matches) { cancelAnimationFrame(raf); return rest(); }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    // pointer: pull the free edge to open, push it back to fold; a tap opens the next crease
    var drag = null;
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      cancelAnimationFrame(raf); raf = 0; last = 0;
      drag = { x: e.clientX, u: u, t: e.timeStamp, moved: false, vx: 0, px: e.clientX, pt: e.timeStamp };
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-held");
    });
    el.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      if (!drag.moved) return;
      var dt = (e.timeStamp - drag.pt) / 1000;
      if (dt > 0) drag.vx = 0.7 * ((e.clientX - drag.px) / dt / w) + 0.3 * drag.vx;
      drag.px = e.clientX; drag.pt = e.timeStamp;
      var raw = drag.u + dx / w;
      // past either end the paper resists
      u = raw < 0 ? raw * 0.25 : raw > folds ? folds + (raw - folds) * 0.25 : raw;
      v = 0;
      paint();
    });
    function release(e) {
      if (!drag) return;
      var d = drag;
      drag = null;
      el.classList.remove("is-held");
      if (!d.moved) { go(Math.round(goal) >= folds ? 0 : Math.round(goal) + 1); return; }
      v = reduce.matches ? 0 : clamp(d.vx, -12, 12);
      go(u + v * 0.14);
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    el.addEventListener("keydown", function (e) {
      var t = Math.round(goal), to = null;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") to = t + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = t - 1;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = folds;
      else if (e.key === "Enter" || e.key === " ") to = t >= folds ? 0 : folds;
      if (to === null) return;
      e.preventDefault();
      go(to);
    });

    if (window.ResizeObserver) new ResizeObserver(function () { measure(); paint(); }).observe(el);
    measure();
    announce();
    paint();
    el.mapfold = { set: go, get value() { return Math.round(goal); } };
  }

  function init() { document.querySelectorAll(".mapfold").forEach(function (el) { if (!el.mapfold) Fold(el); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
