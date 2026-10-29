/*
 * light-pull-cord.js: a pull-chain light switch that switches a theme.
 *   <div class="pull-cord" data-target="#page">
 *     <button type="button" class="pull-handle" role="switch" aria-checked="true" aria-label="Lights"></button>
 *   </div>
 * The chain is a row of beads simulated with Verlet steps and fixed-length links, hanging from a switch
 * at the top middle of .pull-cord. Drag the handle down and the chain goes taut and pulls the switch
 * along its 14 px travel; at 9 px it clicks, like a real pull switch, and the theme flips on the pull,
 * not on the release. Let go and the switch spring snaps back to its stop, the chain is yanked up,
 * goes slack, falls and jerks taut again: that is the bounce, nobody scripted it. Pull to one side and
 * it swings on the way back. Enter or Space gives the handle a short pull.
 *   data-target     selector of the element whose data-theme is switched (default: <html>)
 *   data-length     chain length in px (default 104)
 *   data-beads      beads in the chain (default 14)
 *   data-on, data-off  the data-theme values for lit and dark (default "light", "dark")
 * The root gets .is-on while lit. "pullcord" fires on it with detail.on after each click.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var NS = "http://www.w3.org/2000/svg";
  var TRAVEL = 14, CLICK = 9, REARM = 3;   // switch travel, click point and re-arm point, px
  var G = 2200;                             // gravity, px/s^2 (scaled for screen size)
  var STEP = 1 / 240, ITER = 10;

  function setup(root) {
    if (root._cord) return;
    root._cord = true;
    var handle = root.querySelector(".pull-handle");
    var target = document.querySelector(root.dataset.target || "html") || document.documentElement;
    var LEN = +root.dataset.length || 104;
    var N = Math.max(4, +root.dataset.beads || 14);
    var ON = root.dataset.on || "light", OFF = root.dataset.off || "dark";
    var seg = LEN / N;

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "pull-chain");
    svg.setAttribute("aria-hidden", "true");
    var wire = document.createElementNS(NS, "polyline");
    wire.setAttribute("class", "pull-wire");
    svg.appendChild(wire);
    var beads = [];
    for (var b = 0; b < N * 2 - 1; b++) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("class", "pull-bead");
      c.setAttribute("r", b % 2 ? 1.6 : 2.3);   // ball chain: a big ball, a small link, a big ball
      svg.appendChild(c);
      beads.push(c);
    }
    root.insertBefore(svg, root.firstChild);

    // state: node 0 is the switch, nodes 1..N the chain, node N carries the handle
    var x = [], y = [], ox = [], oy = [], ax = 0, ay = 0;
    var travel = 0, tv = 0, clicked = false, drag = null, raf = 0, last = 0, acc = 0, auto = null;
    var on = initial();

    function initial() {
      var t = target.getAttribute("data-theme");
      if (t) return t === ON;
      return !window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    function apply(fire) {
      target.setAttribute("data-theme", on ? ON : OFF);
      root.classList.toggle("is-on", on);
      handle.setAttribute("aria-checked", on ? "true" : "false");
      if (fire) root.dispatchEvent(new CustomEvent("pullcord", { detail: { on: on }, bubbles: true }));
    }
    function rest() {
      ax = root.clientWidth / 2; ay = 0;
      for (var i = 0; i <= N; i++) { x[i] = ox[i] = ax; y[i] = oy[i] = ay + i * seg; }
      travel = tv = 0;
    }

    function step(dt) {
      // the switch: kinematic while held, otherwise a stiff spring back up to its stop
      if (drag || auto) {
        var hx = drag ? drag.x : auto.x, hy = drag ? drag.y : auto.y;
        var d = Math.hypot(hx - ax, hy - ay);
        var want = Math.min(TRAVEL, Math.max(0, d - LEN));
        // never stretch the chain: a handle beyond reach is held at the end of it
        if (d > LEN + TRAVEL) { var k = (LEN + TRAVEL) / d; hx = ax + (hx - ax) * k; hy = ay + (hy - ay) * k; }
        tv = (want - travel) / dt; travel = want;
        x[N] = ox[N] = hx; y[N] = oy[N] = hy;
      } else if (travel > 0 || tv !== 0) {
        tv += (-1000 * travel - 24 * tv) * dt;   // spring k and damping, per unit mass
        travel += tv * dt;
        if (travel <= 0) { travel = 0; tv = 0; }  // the stop: no bounce past it
      }
      if (!clicked && travel >= CLICK) {
        clicked = true; on = !on; apply(true);
      } else if (clicked && travel < REARM) clicked = false;

      x[0] = ox[0] = ax; y[0] = ay + travel;
      // integrate the free beads
      var free = drag || auto ? N - 1 : N;
      for (var i = 1; i <= free; i++) {
        var vx = (x[i] - ox[i]) * 0.995, vy = (y[i] - oy[i]) * 0.995;
        ox[i] = x[i]; oy[i] = y[i];
        x[i] += vx; y[i] += vy + G * dt * dt;
      }
      // fixed-length links; the switch end never moves, the handle is pinned while held, and heavier when free
      for (var it = 0; it < ITER; it++) {
        for (var j = 0; j < N; j++) {
          var dx = x[j + 1] - x[j], dy = y[j + 1] - y[j];
          var dist = Math.hypot(dx, dy) || 0.0001, diff = (dist - seg) / dist;
          var wa = j === 0 ? 0 : 1;
          var wb = j + 1 === N ? (drag || auto ? 0 : 0.35) : 1;
          if (!(wa + wb)) continue;
          var sa = wa / (wa + wb), sb = wb / (wa + wb);
          x[j] += dx * diff * sa; y[j] += dy * diff * sa;
          x[j + 1] -= dx * diff * sb; y[j + 1] -= dy * diff * sb;
        }
      }
    }
    function energy() {
      var e = Math.abs(tv) + travel;
      for (var i = 1; i <= N; i++) e += Math.abs(x[i] - ox[i]) + Math.abs(y[i] - oy[i]) + Math.abs(x[i] - ax) * 0.02;
      return e;
    }
    function draw() {
      var pts = [];
      for (var i = 0; i <= N; i++) pts.push(x[i].toFixed(1) + "," + y[i].toFixed(1));
      wire.setAttribute("points", pts.join(" "));
      for (var k = 0; k < beads.length; k++) {
        var n = (k >> 1) + 1, m = k % 2;
        var bx = m ? (x[n] + x[n + 1]) / 2 : x[n], by = m ? (y[n] + y[n + 1]) / 2 : y[n];
        beads[k].setAttribute("cx", bx.toFixed(1));
        beads[k].setAttribute("cy", by.toFixed(1));
      }
      var a = Math.atan2(x[N] - x[N - 1], y[N] - y[N - 1]);   // the handle hangs in line with the last link
      handle.style.transform = "translate(" + (x[N] - handle.offsetWidth / 2).toFixed(1) + "px," + y[N].toFixed(1) + "px) rotate(" + (-a * 180 / Math.PI).toFixed(2) + "deg)";
      root.style.setProperty("--pull-travel", travel.toFixed(2) + "px");
    }
    function frame(t) {
      var dt = Math.min(0.05, last ? (t - last) / 1000 : STEP);
      last = t; acc += dt;
      if (auto) {
        auto.t += dt;
        var p = auto.t < 0.13 ? auto.t / 0.13 : auto.t < 0.2 ? 1 : -1;   // pull down 0.13 s, hold, let go
        if (p < 0) auto = null;
        else { var e = 1 - Math.pow(1 - p, 3); auto.x = auto.x0; auto.y = auto.y0 + e * (TRAVEL + 6); }
      }
      while (acc >= STEP) { step(STEP); acc -= STEP; }
      draw();
      if (drag || auto || energy() > 0.05 * N) raf = requestAnimationFrame(frame);
      else { raf = 0; last = 0; acc = 0; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    function local(e) {
      var r = root.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    handle.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      var p = local(e);
      drag = { dx: x[N] - p[0], dy: y[N] - p[1], x: x[N], y: y[N], px: p[0], py: p[1], moved: false };
      root.classList.add("is-pulling");
      kick();
    });
    handle.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var p = local(e);
      if (Math.hypot(p[0] - drag.px, p[1] - drag.py) > 4) drag.moved = true;
      drag.x = p[0] + drag.dx; drag.y = Math.max(ay + 4, p[1] + drag.dy);
      if (reduce.matches) { step(STEP); draw(); }
      kick();
    });
    function release() {
      if (!drag) return;
      var tap = !drag.moved;
      drag = null;
      if (tap) { auto = null; pull(); return; }   // a tap that never moved gives the cord a short pull
      root.classList.remove("is-pulling");
      if (reduce.matches) { clicked = false; rest(); draw(); return; }
      kick();
    }
    handle.addEventListener("pointerup", release);
    handle.addEventListener("pointercancel", function () { if (drag) drag.moved = true; release(); });
    handle.addEventListener("lostpointercapture", function () { if (drag) drag.moved = true; release(); });
    // a click with no drag (a screen reader, or a tap that never moved) still switches
    handle.addEventListener("click", function (e) {
      if (e.detail === 0) { e.preventDefault(); pull(); }
    });
    handle.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) pull(); }
    });
    function pull() {
      root.classList.remove("is-pulling");
      if (reduce.matches) { on = !on; apply(true); return; }
      if (auto || drag) return;
      auto = { t: 0, x0: x[N], y0: y[N], x: x[N], y: y[N] };
      kick();
    }

    root.cord = { pull: pull, isOn: function () { return on; } };
    rest(); apply(false); draw();
    new ResizeObserver(function () { if (!drag && !auto) { rest(); draw(); } }).observe(root);
  }

  function init() { document.querySelectorAll(".pull-cord").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
