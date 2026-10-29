/*
 * drum-combo-lock.js: a combination lock made of number dials. Each .dial is a ten-sided cylinder
 * (36 degrees a face, so the ring closes on itself) that turns with a drag, a flick, the mouse wheel
 * or the arrow keys, and clicks into each number with a small spring, like a detent. When every
 * dial rests on the code in data-code, the lock gets .is-open and fires "unlock".
 *
 *   <div class="lock" data-code="1408">
 *     <span class="lock-shackle"></span>
 *     <div class="lock-dials" role="group" aria-label="Code">
 *       <div class="dial" role="spinbutton" tabindex="0" aria-label="First digit" data-value="2"></div>
 *       ... one .dial per digit
 *     </div>
 *   </div>
 *
 * lock.lock() closes it again; dial.dial.spin(digit, turns) turns a dial to a digit with extra turns.
 * Arrow Left and Right move between dials.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAD = Math.PI / 180, N = 10, STEP = 36;
  var GLIDE = 0.24; // seconds a flick keeps its speed
  function mod(a, n) { return ((a % n) + n) % n; }

  function Dial(el, onRest) {
    var start = mod(parseInt(el.getAttribute("data-value"), 10) || 0, N);
    el.textContent = "";
    var cyl = document.createElement("div");
    cyl.className = "dial-cyl";
    cyl.setAttribute("aria-hidden", "true");
    var faces = [];
    for (var k = -3; k <= 3; k++) { // 7 faces: the front half of the ring plus one each side
      var f = document.createElement("span");
      f.className = "dial-face";
      f.idx = -1;
      cyl.appendChild(f);
      faces.push(f);
    }
    el.appendChild(cyl);

    var h = 46, R = 0;
    function measure() {
      h = faces[0].offsetHeight || 46;
      R = h / (2 * Math.tan(STEP / 2 * RAD));
      cyl.style.transform = "translateZ(" + (-R).toFixed(2) + "px)";
    }

    var pos = start, vel = 0, target = start, omega = 20, zeta = 1, raf = 0, last = 0, dragging = false, value = start;

    function render() {
      var base = Math.round(pos);
      for (var k = -3; k <= 3; k++) {
        var f = faces[k + 3], i = base + k, a = (i - pos) * STEP;
        if (Math.abs(a) > 100) { f.style.visibility = "hidden"; continue; }
        var d = mod(i, N);
        if (f.idx !== d) { f.idx = d; f.textContent = d; }
        f.style.visibility = "";
        f.style.transform = "rotateX(" + (-a).toFixed(3) + "deg) translateZ(" + R.toFixed(2) + "px)";
        f.style.setProperty("--lit", Math.max(0, Math.cos(a * RAD)).toFixed(3));
      }
    }
    function announce(d) { el.setAttribute("aria-valuenow", d); el.setAttribute("aria-valuetext", String(d)); }

    function frame(t) {
      var dt = Math.min(0.05, last ? (t - last) / 1000 : 1 / 60);
      last = t;
      var e = pos - target;
      if (zeta >= 1) {
        var c = vel + omega * e, ex = Math.exp(-omega * dt);
        e = (e + c * dt) * ex;
        vel = (vel - omega * c * dt) * ex;
      } else {
        for (var s = 0; s < 4; s++) { var q = dt / 4; vel += (-2 * zeta * omega * vel - omega * omega * e) * q; e += vel * q; }
      }
      pos = target + e;
      if (Math.abs(e) < 5e-4 && Math.abs(vel) < 5e-3) {
        pos = target = mod(target, N); vel = 0; raf = 0; last = 0;
        render();
        value = pos;
        onRest();
        return;
      }
      render();
      raf = requestAnimationFrame(frame);
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; }
    // detent: a quick, slightly underdamped spring, so each number lands with a small click
    function goTo(i, w, z) {
      target = i; omega = w || 22; zeta = z || 0.55;
      announce(mod(target, N));
      if (reduce.matches) { stop(); pos = target = mod(target, N); vel = 0; render(); value = pos; onRest(); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    var startY = 0, startPos = 0, moved = false, samples = [];
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      stop(); dragging = true; moved = false; vel = 0;
      startY = e.clientY; startPos = pos; samples = [[e.timeStamp, pos]];
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-grabbed");
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      if (Math.abs(dy) > 3) moved = true;
      pos = startPos - dy / h; // drag up turns the numbers up: the next digit comes from below
      samples.push([e.timeStamp, pos]);
      while (samples.length > 2 && e.timeStamp - samples[0][0] > 90) samples.shift();
      render();
    });
    function release(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-grabbed");
      if (!moved) {
        var r = el.getBoundingClientRect();
        var off = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / R));
        goTo(Math.round(pos) + Math.round(Math.asin(off) / RAD / STEP));
        return;
      }
      var a = samples[0], b = samples[samples.length - 1], dt = (b[0] - a[0]) / 1000;
      var v = dt > 0.005 && e.timeStamp - b[0] < 60 ? (b[1] - a[1]) / dt : 0;
      vel = v;
      var t = Math.round(pos + v * GLIDE);
      if (Math.abs(v) > 2) goTo(t, 1 / GLIDE, 1); // glide on the flick's own speed
      else goTo(t);
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    var wheelTimer = 0;
    el.addEventListener("wheel", function (e) {
      e.preventDefault();
      var d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      if (!d) return;
      if (Math.abs(d) >= 50) { goTo(Math.round(target) + Math.sign(d)); return; }
      stop(); vel = 0;
      pos += d / h * 0.5;
      render();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () { goTo(Math.round(pos)); }, 120);
    }, { passive: false });

    el.addEventListener("keydown", function (e) {
      var t = Math.round(target);
      var map = { ArrowUp: t + 1, ArrowDown: t - 1, Home: t - mod(t, N), End: t - mod(t, N) + 9 };
      if (e.key in map) { e.preventDefault(); goTo(map[e.key]); return; }
      if (/^[0-9]$/.test(e.key)) { // type the digit: turn the short way to it
        e.preventDefault();
        var want = +e.key, diff = mod(want - mod(t, N) + 5, N) - 5;
        goTo(t + diff, 16, 0.7);
      }
    });

    measure(); render(); announce(start);
    el.classList.add("is-ready");
    window.addEventListener("resize", function () { measure(); render(); });

    el.dial = {
      get value() { return value; },
      get moving() { return dragging || raf !== 0; },
      // turn to a digit, adding whole extra turns (positive turns forward, negative backward)
      spin: function (d, turns) {
        var t = Math.round(target), diff = mod(d - mod(t, N), N);
        if (turns < 0) diff -= N;
        goTo(t + diff + (turns || 0) * N, 5.5, 1);
      }
    };
  }

  function Lock(lock) {
    var code = String(lock.getAttribute("data-code") || "");
    var dials = Array.prototype.slice.call(lock.querySelectorAll(".dial"));
    function check() {
      if (dials.some(function (d) { return !d.dial || d.dial.moving; })) return;
      var now = dials.map(function (d) { return d.dial.value; }).join("");
      var open = now === code;
      if (open !== lock.classList.contains("is-open")) {
        lock.classList.toggle("is-open", open);
        lock.dispatchEvent(new CustomEvent(open ? "unlock" : "relock", { bubbles: true }));
      }
    }
    dials.forEach(function (d, i) {
      Dial(d, check);
      d.addEventListener("keydown", function (e) {
        var to = e.key === "ArrowRight" ? dials[i + 1] : e.key === "ArrowLeft" ? dials[i - 1] : null;
        if (to) { e.preventDefault(); to.focus(); }
      });
    });
    lock.lock = function (digits) {
      lock.classList.remove("is-open");
      dials.forEach(function (d, i) { d.dial.spin(+String(digits)[i] || 0, i % 2 ? -1 : 1); });
    };
  }

  function init() { document.querySelectorAll(".lock[data-code]").forEach(Lock); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
