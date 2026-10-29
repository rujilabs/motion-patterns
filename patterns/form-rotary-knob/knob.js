/*
 * knob.js: a rotary knob with detents on an arc scale, as an ARIA slider.
 *   <div class="knob" role="slider" tabindex="0" aria-label="Temperature"
 *        data-min="16" data-max="30" data-step="0.5" data-value="24" data-major="2" data-unit=" °C"></div>
 * It builds the scale and the cap inside the element. Drag around the centre to turn it (mouse, pen or
 * touch), or use the arrow keys, Page Up and Page Down (bigger steps), Home and End. While you drag,
 * the cap is pulled into the nearest detent and jumps to the next one past the midpoint, so you feel
 * each step; on release it springs into the notch. The value is el.value; "input" fires on every step
 * and "change" when you let go or press a key.
 */
(function () {
  var SWEEP = 270;           // degrees of travel, stop to stop, centred on 12 o'clock
  var PULL = 0.3;            // how much of the way between notches the cap follows while dragging
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var root = getComputedStyle(document.documentElement);
  var SPRING = root.getPropertyValue("--ease-spring").trim() || "ease-out";

  function svg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function polar(a, r) { var t = (a - 90) * Math.PI / 180; return [100 + r * Math.cos(t), 100 + r * Math.sin(t)]; }
  function arc(a0, a1, r) {
    var p0 = polar(a0, r), p1 = polar(a1, r);
    return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }

  function setup(el) {
    if (el._knob) return;
    var min = +el.dataset.min, max = +el.dataset.max, step = +el.dataset.step || 1;
    var major = +el.dataset.major || step * 2;
    var dec = (String(step).split(".")[1] || "").length;
    var unit = el.dataset.unit || "";
    var count = Math.round((max - min) / step);
    var per = SWEEP / count;                       // degrees per detent
    var value = clampV(+el.dataset.value);

    // scale: ticks, the track, the filled part
    var s = svg("svg", { "class": "knob-scale", viewBox: "0 0 200 200", "aria-hidden": "true" });
    s.appendChild(svg("path", { "class": "knob-track", d: arc(-SWEEP / 2, SWEEP / 2, 93) }));
    var fill = svg("path", { "class": "knob-fill", d: arc(-SWEEP / 2, SWEEP / 2, 93), pathLength: "1" });
    s.appendChild(fill);
    var ticks = [];
    for (var i = 0; i <= count; i++) {
      var v = min + i * step, a = -SWEEP / 2 + i * per;
      var big = Math.abs(v / major - Math.round(v / major)) < 1e-6;
      var p0 = polar(a, big ? 79 : 82), p1 = polar(a, 86);
      var t = svg("line", { "class": "knob-tick" + (big ? " is-major" : ""), x1: p0[0].toFixed(2), y1: p0[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2) });
      s.appendChild(t); ticks.push(t);
      if (big) {
        var q = polar(a, 69);
        var lab = svg("text", { "class": "knob-num", x: q[0].toFixed(2), y: q[1].toFixed(2) });
        lab.textContent = v;
        s.appendChild(lab);
      }
    }
    var cap = document.createElement("span");
    cap.className = "knob-cap";
    cap.setAttribute("aria-hidden", "true");
    cap.innerHTML = '<span class="knob-grip"></span><span class="knob-mark"></span>';
    var light = document.createElement("span");
    light.className = "knob-light";
    light.setAttribute("aria-hidden", "true");
    el.textContent = "";
    el.append(s, cap, light);
    el.setAttribute("aria-valuemin", min);
    el.setAttribute("aria-valuemax", max);
    el._knob = true;

    var shown = angleOf(value);
    var anim = null;
    render(value, shown);
    el.classList.add("is-ready");

    function clampV(v) { return Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min)); }
    function angleOf(v) { return -SWEEP / 2 + (v - min) / step * per; }
    function text(v) { return v.toFixed(dec); }
    function render(v, a) {
      cap.style.rotate = a + "deg";
      fill.style.strokeDasharray = ((a + SWEEP / 2) / SWEEP).toFixed(4) + " 2";
      ticks.forEach(function (t, i) { t.classList.toggle("is-on", i <= Math.round((v - min) / step)); });
    }
    function setValue(v, fire) {
      v = clampV(v);
      if (v === value) return false;
      value = v;
      el.value = v;
      el.setAttribute("aria-valuenow", v);
      el.setAttribute("aria-valuetext", text(v) + unit);
      el.dataset.value = v;
      if (fire) el.dispatchEvent(new CustomEvent("input", { bubbles: true, detail: v }));
      return true;
    }
    // turn the cap from where it shows to the notch of the current value
    function settle() {
      var to = angleOf(value);
      if (anim) { anim.cancel(); anim = null; }
      if (!reduce.matches && cap.animate && Math.abs(to - shown) > 0.1) {
        anim = cap.animate([{ rotate: shown + "deg" }, { rotate: to + "deg" }], { duration: 260, easing: SPRING });
        // keep the fill arc in step with the cap while it springs
        var start = shown, t0 = performance.now();
        (function follow(now) {
          var k = Math.min(1, (now - t0) / 260);
          fill.style.strokeDasharray = (((start + (to - start) * k) + SWEEP / 2) / SWEEP).toFixed(4) + " 2";
          if (k < 1 && anim) requestAnimationFrame(follow);
        })(t0);
      }
      shown = to;
      render(value, to);
    }
    el.value = value;
    el.setAttribute("aria-valuenow", value);
    el.setAttribute("aria-valuetext", text(value) + unit);
    el.setValue = function (v) { if (setValue(v, false)) settle(); };

    // dragging: follow the angle of the pointer around the centre, with the stops as hard limits
    var drag = null;
    function pointerAngle(e) {
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      return { a: Math.atan2(dx, -dy) * 180 / Math.PI, d: Math.hypot(dx, dy), r: r.width / 2 };
    }
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      var p = pointerAngle(e);
      e.preventDefault();
      el.focus({ preventScroll: true, focusVisible: false });
      if (anim) { anim.cancel(); anim = null; }
      drag = { last: p.a, raw: shown, id: e.pointerId };
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-turning");
    });
    el.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var p = pointerAngle(e);
      if (p.d < p.r * 0.12) return;                 // too near the centre to read an angle
      var d = p.a - drag.last;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      drag.last = p.a;
      drag.raw = Math.max(-SWEEP / 2, Math.min(SWEEP / 2, drag.raw + d));
      var n = Math.round((drag.raw + SWEEP / 2) / per);
      var notch = -SWEEP / 2 + n * per;
      shown = reduce.matches ? notch : notch + (drag.raw - notch) * PULL;
      setValue(min + n * step, true);
      render(value, shown);
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      el.classList.remove("is-turning");
      settle();
      el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: value }));
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    el.addEventListener("keydown", function (e) {
      var v = value, big = Math.max(step, major);
      switch (e.key) {
        case "ArrowUp": case "ArrowRight": v += step; break;
        case "ArrowDown": case "ArrowLeft": v -= step; break;
        case "PageUp": v += big; break;
        case "PageDown": v -= big; break;
        case "Home": v = min; break;
        case "End": v = max; break;
        default: return;
      }
      e.preventDefault();
      if (setValue(v, true)) {
        settle();
        el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: value }));
      } else if (!reduce.matches && cap.animate) {
        // at a stop: the cap knocks against it
        var dir = v > value ? 1 : -1;
        cap.animate([{ rotate: shown + "deg" }, { rotate: (shown + dir * 2.5) + "deg" }, { rotate: shown + "deg" }], { duration: 180, easing: "ease-out" });
      }
    });
  }

  function init() { document.querySelectorAll(".knob[data-min][data-max]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
