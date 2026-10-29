/*
 * arc-picker.js: options that ride an arc, like the top of a wheel. The chosen one rises to the top.
 *   <ul class="curve-arc-picker" role="listbox" tabindex="0" aria-label="Cake size" aria-orientation="horizontal">
 *     <li class="ap-item" role="option" data-value="6">6 inch</li>
 *     <li class="ap-item" role="option" data-value="8" aria-selected="true">8 inch</li>
 *   </ul>
 * Each option sits at an angle on a circle whose centre is below the picker; turning the wheel moves
 * them along it. Drag sideways (mouse, pen or touch) and let go: the wheel keeps the speed you gave it,
 * then a spring catches the nearest option and settles it at the top. Click or tap an option to bring it
 * up, or use the arrow keys, Home and End. The arc and the rise are set in CSS (--ap-radius, --ap-step,
 * --ap-rise). "input" fires as the option at the top changes, "change" when it settles; el.value is the
 * chosen option's data-value, el.select(i) turns to an option from code.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var K = 240, C = 26;          // snap spring (damping ratio about 0.84: settles with a trace of overshoot)
  var THROW = 0.22;             // seconds of flick speed carried before the spring takes over

  function setup(el) {
    if (el._ap) return;
    el._ap = true;
    var items = [].slice.call(el.querySelectorAll(".ap-item"));
    var n = items.length;
    var sel = Math.max(0, items.findIndex(function (it) { return it.getAttribute("aria-selected") === "true"; }));
    var pos = sel, vel = 0, goal = sel, raf = 0, last = 0, shown = -1;
    var R = 420, STEP = 15, RISE = 18;

    items.forEach(function (it, i) {
      if (!it.id) it.id = (el.id || "ap") + "-opt-" + i;
      it.addEventListener("click", function () { if (!moved) choose(i); });
    });

    function read() {
      var s = getComputedStyle(el);
      R = parseFloat(s.getPropertyValue("--ap-radius")) || 420;
      STEP = parseFloat(s.getPropertyValue("--ap-step")) || 15;
      RISE = parseFloat(s.getPropertyValue("--ap-rise")) || 18;
      render();
    }
    // place every option for the wheel position p (in options, fractional while it turns)
    function render() {
      items.forEach(function (it, i) {
        var deg = (i - pos) * STEP, rad = deg * Math.PI / 180;
        var near = Math.max(0, 1 - Math.abs(i - pos));      // 1 at the top, 0 one step away
        var x = Math.sin(rad) * R, y = (1 - Math.cos(rad)) * R - near * RISE;
        it.style.transform = "translate(-50%, 0) translate(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px) rotate(" + (deg * 0.4).toFixed(2) + "deg) scale(" + (0.92 + near * 0.08).toFixed(3) + ")";
        it.style.setProperty("--ap-near", near.toFixed(3));
        it.style.setProperty("--ap-far", Math.min(1, Math.abs(i - pos) / 2.5).toFixed(3));
        it.style.zIndex = 10 - Math.round(Math.abs(i - pos) * 2);
      });
      var top = clamp(Math.round(pos));
      if (top !== shown) {
        shown = top;
        el.setAttribute("aria-activedescendant", items[top].id);
        el.dispatchEvent(new CustomEvent("input", { bubbles: true, detail: { index: top, value: items[top].dataset.value } }));
      }
    }
    function clamp(i) { return Math.max(0, Math.min(n - 1, i)); }
    function commit(i) {
      if (i === sel) return;
      items[sel].setAttribute("aria-selected", "false");
      sel = i;
      items[sel].setAttribute("aria-selected", "true");
      el.value = items[sel].dataset.value;
      el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { index: sel, value: el.value } }));
    }
    function tick(now) {
      var dt = Math.min(0.032, (now - (last || now)) / 1000) || 0.016;
      last = now;
      // past either end the wheel meets a soft stop: the spring pulls it back in
      var f = K * (goal - pos) - C * vel;
      vel += f * dt;
      pos += vel * dt;
      if (Math.abs(goal - pos) < 0.001 && Math.abs(vel) < 0.01) { pos = goal; vel = 0; render(); raf = 0; last = 0; commit(goal); return; }
      render();
      raf = requestAnimationFrame(tick);
    }
    function settle() {
      if (reduce.matches) { pos = goal; vel = 0; render(); commit(goal); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function choose(i) { goal = clamp(i); settle(); }

    // dragging: the arc follows the finger along its length, then is thrown
    var drag = null, moved = false;
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, p: pos, t: e.timeStamp, hist: [] };
      moved = false;
      cancelAnimationFrame(raf); raf = 0; last = 0; vel = 0;
    });
    el.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) < 5) return;
      if (!moved) { moved = true; el.setPointerCapture(e.pointerId); el.classList.add("is-turning"); }
      var per = R * STEP * Math.PI / 180;                  // px of arc between two options
      var p = drag.p - dx / per;
      // rubber band past the ends
      if (p < 0) p = p / 3; else if (p > n - 1) p = n - 1 + (p - n + 1) / 3;
      pos = p;
      drag.hist.push([e.timeStamp, p]);
      if (drag.hist.length > 6) drag.hist.shift();
      render();
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var h = drag.hist;
      drag = null;
      el.classList.remove("is-turning");
      if (!moved) return;                                   // a tap: the option's click handles it
      setTimeout(function () { moved = false; }, 0);
      var v = 0;
      if (h.length > 1 && e.timeStamp - h[h.length - 1][0] < 80) {
        v = (h[h.length - 1][1] - h[0][1]) / Math.max(1, h[h.length - 1][0] - h[0][0]) * 1000;  // options per second
      }
      vel = reduce.matches ? 0 : v;
      goal = clamp(Math.round(pos + v * THROW));
      settle();
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    el.addEventListener("keydown", function (e) {
      var i = goal;
      switch (e.key) {
        case "ArrowLeft": case "ArrowUp": i -= 1; break;
        case "ArrowRight": case "ArrowDown": i += 1; break;
        case "Home": i = 0; break;
        case "End": i = n - 1; break;
        default: return;
      }
      e.preventDefault();
      choose(i);
    });

    el.value = items[sel].dataset.value;
    items[sel].setAttribute("aria-selected", "true");
    el.select = choose;
    el.classList.add("is-ready");
    read();
    if ("ResizeObserver" in window) new ResizeObserver(read).observe(el);
  }

  function init() { document.querySelectorAll(".curve-arc-picker").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
