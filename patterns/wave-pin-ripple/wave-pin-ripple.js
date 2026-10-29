/*
 * wave-pin-ripple.js: an address pin you drop on a drawn map, and a ripple that spreads from where it lands.
 *   <div class="pin-map" data-x="158" data-y="159" tabindex="0" role="application" aria-roledescription="map" aria-label="...">
 *     <svg viewBox="0 0 420 300">
 *       ...your map...
 *       <g class="pm-ripples"></g>
 *       <g class="pm-pin"><!-- the pin, its tip on 0 0 --></g>
 *     </svg>
 *   </div>
 * Drag the pin, or tap anywhere on the map and it flies there; arrow keys carry it, Enter or Space drops it.
 * While held the pin is lifted off its shadow. When it lands it squashes on its tip and sends a ripple
 * along the ground under it: three rings a wave train apart, moving out at a steady speed, their height
 * falling as 1 / sqrt(radius), the way a circular wave spreads its energy, and with time as the ground damps it.
 * "drop" fires with detail { x, y } in the map's units; "move" fires while it is carried.
 * el.pinMap.place(x, y) moves it without a drop.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var css = getComputedStyle(document.documentElement);
  function token(name, fallback) { return css.getPropertyValue(name).trim() || fallback; }
  var EASE_INOUT = token("--ease-inout", "ease-in-out");
  var EASE_OUT = token("--ease-out", "ease-out");
  var EASE_IN = token("--ease-in", "ease-in");
  var LIFT = 14;            // how high the pin rides while held, in map units
  var FALL = 170;           // ms from held to the ground
  var SPEED = 105;          // ripple speed, map units per second
  var LIFE = 1150;          // ms a ring lives
  var TAU = 0.62;           // s for the ground to damp a ring to 37%
  var TRAIN = [1, 0.62, 0.34];  // the rings of one drop, each a wavelength behind the last
  var GAP = 120;            // ms between them
  var NS = "http://www.w3.org/2000/svg";

  function setup(el) {
    if (el.pinMap) return;
    var svg = el.querySelector("svg");
    var vb = svg.viewBox.baseVal;
    var ripples = el.querySelector(".pm-ripples");
    var pin = el.querySelector(".pm-pin");
    var pos = document.createElementNS(NS, "g"), spot = document.createElementNS(NS, "g"), shadow = document.createElementNS(NS, "ellipse");
    pos.setAttribute("class", "pm-at");
    spot.setAttribute("class", "pm-at");
    shadow.setAttribute("class", "pm-shadow");
    shadow.setAttribute("rx", "6.5"); shadow.setAttribute("ry", "2.6");
    spot.appendChild(shadow);
    pin.parentNode.insertBefore(spot, pin);
    pin.parentNode.insertBefore(pos, pin);
    pos.appendChild(pin);

    var x = +el.dataset.x || vb.width / 2, y = +el.dataset.y || vb.height / 2;
    var held = false, drag = null, carried = false, running = [];

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function at(px, py) { return "translate(" + px.toFixed(2) + "px, " + py.toFixed(2) + "px)"; }
    function place(px, py) {
      x = clamp(px, vb.x + 6, vb.x + vb.width - 6);
      y = clamp(py, vb.y + 22, vb.y + vb.height - 4);
      pos.style.transform = spot.style.transform = at(x, y);
      el.dataset.x = x.toFixed(1); el.dataset.y = y.toFixed(1);
    }
    function anim(node, frames, opts) { var a = node.animate(frames, opts); running.push(a); a.onfinish = function () { running.splice(running.indexOf(a), 1); }; return a; }
    function stop() { running.slice().forEach(function (a) { a.cancel(); }); running = []; }
    function setHeld(on) {
      held = on;
      el.classList.toggle("is-held", on);
      pin.style.transform = on ? "translateY(" + -LIFT + "px)" : "";
      shadow.style.transform = on ? "scale(.7)" : "";
    }
    function emit(name) { el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { x: x, y: y } })); }

    // the ripple: rings that leave the point together with the landing and spread under the pin
    function ripple(delay) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")");
      ripples.appendChild(g);
      var left = TRAIN.length;
      TRAIN.forEach(function (amp, i) {
        var c = document.createElementNS(NS, "circle");
        c.setAttribute("r", "1");
        c.setAttribute("class", "pm-ring");
        g.appendChild(c);
        var frames = [], R0 = 3;
        for (var k = 0; k <= 12; k++) {
          var t = k / 12 * LIFE / 1000, R = R0 + SPEED * t;
          var a = amp * Math.exp(-t / TAU) * Math.sqrt(R0 / R) * 3.2;   // 1 / sqrt(r) spreading, and damping in time
          frames.push({ transform: "scale(" + R.toFixed(2) + ")", strokeWidth: Math.max(0, a * 3.4).toFixed(3), opacity: Math.min(1, a).toFixed(3) });
        }
        frames[12].opacity = 0;
        var r = anim(c, frames, { duration: LIFE, delay: delay + i * GAP, easing: "linear", fill: "backwards" });
        r.id = "ripple " + (i + 1);
        r.finished.then(done, done);
      });
      function done() { if (--left === 0 && g.parentNode) g.parentNode.removeChild(g); }
    }

    // one keyframe track for the pin: [lift] hold, fall, squash on the tip, a small bounce back
    function land(hold, fromGround) {
      hold = hold || 0;
      setHeld(false);
      if (reduce.matches) { emit("drop"); return; }
      var up = "translateY(" + -LIFT + "px) scale(1, 1)", k = [], s = [], t = 0;
      if (fromGround) { k.push({ t: 0, transform: "translateY(0) scale(1, 1)", easing: EASE_OUT }); s.push({ t: 0, transform: "scale(1)", opacity: 1, easing: EASE_OUT }); t = 150; }
      k.push({ t: t, transform: up }); s.push({ t: t, transform: "scale(.7)", opacity: 0.55 });
      t = Math.max(t, hold);
      k.push({ t: t, transform: up, easing: EASE_IN }); s.push({ t: t, transform: "scale(.7)", opacity: 0.55, easing: EASE_IN });
      var hit = t + FALL;
      k.push({ t: hit, transform: "translateY(0) scale(1, 1)" }); s.push({ t: hit, transform: "scale(1)", opacity: 1 });
      k.push({ t: hit + 65, transform: "translateY(0) scale(1.14, .8)", easing: EASE_OUT });
      k.push({ t: hit + 165, transform: "translateY(0) scale(.96, 1.05)" });
      k.push({ t: hit + 260, transform: "translateY(0) scale(1, 1)" });
      var T = hit + 260;
      function frames(list) { return list.map(function (f) { var o = Object.assign({}, f); o.offset = f.t / T; delete o.t; return o; }); }
      var s2 = frames(s); s2.push({ offset: 1, transform: "scale(1)", opacity: 1 });
      anim(pin, frames(k), { duration: T }).id = "pin drops";
      anim(shadow, s2, { duration: T });
      ripple(hit);
      setTimeout(function () { emit("drop"); }, hit);
    }
    function lift() {
      setHeld(true);
      if (reduce.matches) return;
      anim(pin, [{ transform: "translateY(0)" }, { transform: "translateY(" + -LIFT + "px)" }], { duration: 150, easing: EASE_OUT });
      anim(shadow, [{ transform: "scale(1)" }, { transform: "scale(.7)" }], { duration: 150, easing: EASE_OUT });
    }
    // a tap elsewhere: the pin lifts, flies on a level line, and drops
    function fly(nx, ny) {
      stop();
      var fx = x, fy = y;
      place(nx, ny);
      if (reduce.matches) { emit("drop"); return; }
      var d = Math.hypot(x - fx, y - fy), ms = Math.round(clamp(220 + d * 1.1, 260, 560));
      [pos, spot].forEach(function (n) { anim(n, [{ transform: at(fx, fy) }, { transform: at(x, y) }], { duration: ms, delay: 110, easing: EASE_INOUT, fill: "backwards" }); });
      land(110 + ms, true);
    }

    function toMap(e) {
      var p = svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    svg.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      var m = toMap(e);
      // on the pin (or very near it): pick it up; anywhere else: send it there
      if (Math.hypot(m.x - x, m.y - (y - 12)) < 16) {
        stop();
        drag = { id: e.pointerId, dx: x - m.x, dy: y - m.y };
        svg.setPointerCapture(e.pointerId);
        lift();
      } else fly(m.x, m.y);
      e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var m = toMap(e);
      place(m.x + drag.dx, m.y + drag.dy);
      emit("move");
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      land(0, false);
    }
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);

    el.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 16 : 4, k = e.key, dx = 0, dy = 0;
      if (k === "ArrowLeft") dx = -step; else if (k === "ArrowRight") dx = step;
      else if (k === "ArrowUp") dy = -step; else if (k === "ArrowDown") dy = step;
      else if ((k === "Enter" || k === " ") && carried) { carried = false; stop(); land(0, false); e.preventDefault(); return; }
      else if (k === "Escape" && carried) { carried = false; stop(); land(0, false); return; }
      else return;
      e.preventDefault();
      if (!carried) { carried = true; stop(); lift(); }
      place(x + dx, y + dy);
      emit("move");
    });
    el.addEventListener("blur", function () { if (carried) { carried = false; land(0, false); } });

    el.pinMap = { place: function (px, py) { stop(); place(px, py); }, drop: function (px, py) { fly(px, py); } };
    place(x, y);
    el.classList.add("is-ready");

    // the first drop, when the map scrolls into view
    if (reduce.matches || !("IntersectionObserver" in window)) return;
    el.classList.add("is-waiting");
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      el.classList.remove("is-waiting");
      anim(pin, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: 200, fill: "backwards" });
      anim(shadow, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: 200, fill: "backwards" });
      setHeld(true);
      land(260, false);
    }, { threshold: 0.4 });
    io.observe(el);
  }

  function init() { document.querySelectorAll(".pin-map").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
