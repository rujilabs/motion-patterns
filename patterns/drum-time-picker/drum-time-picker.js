/*
 * drum-time-picker.js: turns each <div class="drum"> holding a list of values into a 3D wheel.
 * The values sit on a real cylinder (rotateX + translateZ), each face shaded by the cosine of its
 * angle. Drag or flick it: it glides on with the speed you gave it and lands on a value. Tap a row,
 * turn the mouse wheel, or use the arrow keys, Page Up / Page Down, Home and End.
 *
 *   <div class="drum" role="spinbutton" tabindex="0" aria-label="Hour" data-loop>
 *     <ol class="drum-list"><li>1</li><li class="is-on">2</li>...</ol>
 *   </div>
 *
 * data-loop       the values repeat (hours, minutes); without it the wheel stops at both ends
 * data-step       degrees between rows, default 20
 * li.is-on        the starting value
 * li[data-say]    what a screen reader hears for that value; li[data-n] the number for aria-valuenow
 *
 * Events: "input" each time a new value passes the centre, "change" when the wheel comes to rest.
 * el.drum.index is the current value's position in the list; el.drum.set(i) turns to it.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAD = Math.PI / 180;
  var GLIDE = 0.26; // seconds: how long a flick keeps its speed (a time constant, like a real wheel's drag)
  function mod(a, n) { return ((a % n) + n) % n; }

  function Drum(el) {
    var lis = Array.prototype.slice.call(el.querySelectorAll(".drum-list > li"));
    var n = lis.length;
    if (!n) return;
    var items = lis.map(function (li, i) {
      var t = li.textContent.trim();
      return { text: t, say: li.getAttribute("data-say") || t, num: li.hasAttribute("data-n") ? li.getAttribute("data-n") : String(i) };
    });
    var loop = el.hasAttribute("data-loop");
    var step = parseFloat(el.getAttribute("data-step")) || 20;
    var start = Math.max(0, lis.findIndex(function (li) { return li.classList.contains("is-on"); }));

    var cyl = document.createElement("div");
    cyl.className = "drum-cyl";
    cyl.setAttribute("aria-hidden", "true");
    var K = Math.ceil(90 / step) + 1; // faces either side of the centre: enough to reach the cylinder's rim
    var faces = [];
    for (var k = -K; k <= K; k++) {
      var f = document.createElement("div");
      f.className = "drum-face";
      f.idx = -1;
      cyl.appendChild(f);
      faces.push(f);
    }
    el.appendChild(cyl);

    var h = 40, R = 0;
    function measure() {
      h = faces[0].offsetHeight || 40;
      R = h / (2 * Math.tan(step / 2 * RAD)); // radius at which rows of height h meet edge to edge
      cyl.style.transform = "translateZ(" + (-R).toFixed(2) + "px)"; // keep the front row at true size
    }

    var pos = start, vel = 0, target = start, omega = 14, zeta = 1;
    var raf = 0, last = 0, dragging = false, centre = -1, committed = start;

    function clampIdx(i) { return loop ? i : Math.max(0, Math.min(n - 1, i)); }

    function render() {
      var base = Math.round(pos);
      for (var k = -K; k <= K; k++) {
        var f = faces[k + K], i = base + k;
        var a = (i - pos) * step;
        if ((!loop && (i < 0 || i >= n)) || Math.abs(a) > 91) { f.style.visibility = "hidden"; continue; }
        var idx = mod(i, n);
        if (f.idx !== idx) { f.idx = idx; f.textContent = items[idx].text; }
        f.style.visibility = "";
        f.style.transform = "rotateX(" + (-a).toFixed(3) + "deg) translateZ(" + R.toFixed(2) + "px)";
        f.style.setProperty("--lit", Math.cos(a * RAD).toFixed(3));
        f.classList.toggle("is-centre", k === 0 && Math.abs(i - pos) < 0.5);
      }
      var c = mod(Math.round(pos), n);
      if (!loop) c = Math.max(0, Math.min(n - 1, Math.round(pos)));
      if (c !== centre) { centre = c; el.dispatchEvent(new CustomEvent("input", { detail: { index: c } })); }
    }

    function announce(i) {
      el.setAttribute("aria-valuenow", items[i].num);
      el.setAttribute("aria-valuetext", items[i].say);
    }

    function settle() {
      var i = loop ? mod(target, n) : target;
      if (loop) { pos = target = i; } // keep the numbers small; the faces read the value modulo n anyway
      announce(i);
      if (i !== committed) { committed = i; el.dispatchEvent(new Event("change", { bubbles: true })); }
    }

    // A damped spring toward the target row. Critically damped steps are exact (stable at any frame time).
    function frame(t) {
      var dt = Math.min(0.05, last ? (t - last) / 1000 : 1 / 60);
      last = t;
      var e = pos - target;
      if (zeta >= 1) {
        var c = vel + omega * e, ex = Math.exp(-omega * dt);
        e = (e + c * dt) * ex;
        vel = (vel - omega * c * dt) * ex;
      } else {
        for (var s = 0; s < 4; s++) { var d = dt / 4; vel += (-2 * zeta * omega * vel - omega * omega * e) * d; e += vel * d; }
      }
      pos = target + e;
      if (Math.abs(e) < 5e-4 && Math.abs(vel) < 5e-3) {
        pos = target; vel = 0; raf = 0; last = 0;
        render(); settle();
        return;
      }
      render();
      raf = requestAnimationFrame(frame);
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; }

    function goTo(i, w, z) {
      target = clampIdx(i);
      omega = w || 14;
      zeta = z || 1;
      announce(loop ? mod(target, n) : target);
      if (reduce.matches) { stop(); pos = target; vel = 0; render(); settle(); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function rubber(raw) {
      if (loop) return raw;
      if (raw < 0) return -(1 - 1 / (1 - raw * 0.6)) / 0.6 * 0.5;
      if (raw > n - 1) { var o = raw - (n - 1); return n - 1 + (1 - 1 / (1 + o * 0.6)) / 0.6 * 0.5; }
      return raw;
    }

    // Pointer: drag follows the finger one row per row height; release projects the flick and lands on a row.
    var startY = 0, startPos = 0, moved = false, samples = [];
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      stop();
      dragging = true; moved = false;
      startY = e.clientY; startPos = pos; vel = 0;
      samples = [[e.timeStamp, pos]];
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-grabbed");
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      if (Math.abs(dy) > 3) moved = true;
      pos = rubber(startPos - dy / h);
      samples.push([e.timeStamp, pos]);
      while (samples.length > 2 && e.timeStamp - samples[0][0] > 90) samples.shift();
      render();
    });
    function release(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-grabbed");
      if (!moved) {
        // a tap: turn the tapped row to the centre (the row's height on screen shrinks with the curve)
        var r = el.getBoundingClientRect();
        var off = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / R));
        goTo(Math.round(pos) + Math.round(Math.asin(off) / RAD / step), 12);
        return;
      }
      var a = samples[0], b = samples[samples.length - 1];
      var dt = (b[0] - a[0]) / 1000;
      var v = dt > 0.005 && e.timeStamp - b[0] < 60 ? (b[1] - a[1]) / dt : 0; // rows per second
      vel = v;
      var proj = pos + v * GLIDE;
      var t = clampIdx(Math.round(proj));
      // a real flick glides: a spring with time constant GLIDE starts at the finger's speed and decays to the row
      goTo(t, Math.abs(v) > 2 && t === Math.round(proj) ? 1 / GLIDE : 14);
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    // Mouse wheel: a notched wheel moves one row a notch; a trackpad scrolls freely, then snaps.
    var wheelTimer = 0;
    el.addEventListener("wheel", function (e) {
      e.preventDefault();
      var d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      if (!d) return;
      if (Math.abs(d) >= 50) { goTo(Math.round(target) + Math.sign(d), 16); return; }
      stop(); vel = 0;
      pos = rubber(pos + d / h * 0.5);
      target = clampIdx(Math.round(pos));
      render();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () { goTo(Math.round(pos), 14); }, 120);
    }, { passive: false });

    el.addEventListener("keydown", function (e) {
      var t = Math.round(target), map = { ArrowUp: t + 1, ArrowDown: t - 1, PageUp: t + 4, PageDown: t - 4, Home: 0, End: n - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      goTo(map[e.key], 16);
    });

    measure();
    render();
    announce(start);
    el.classList.add("is-ready");
    window.addEventListener("resize", function () { measure(); render(); });

    el.drum = {
      get index() { return committed; },
      get centre() { return centre; },
      set: function (i) { goTo(loop ? i + n * Math.round((pos - i) / n) : i, 12); } // the short way round
    };
  }

  function init() { document.querySelectorAll(".drum").forEach(Drum); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
