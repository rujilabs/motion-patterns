/*
 * grid-cell-glow.js: in every .gg, a soft light follows the pointer (mouse, pen or a dragging finger)
 * and each .gg-cell gets --gg from 0 to 1 by its distance to it: full under the light, nothing beyond
 * data-gg-reach cell widths (default 1.8). Distance is measured to the cell's edge, so a wide cell
 * lights as soon as the light reaches it.
 *   <div class="gg" data-gg-reach="1.8"> <button class="gg-cell">A1</button> ... </div>
 * Focus a cell and the light moves onto it. Buttons inside get a roving tab stop: one Tab into the
 * grid, then arrow keys move between them. Click or Enter on a button fires "gg-pick" on the grid.
 * The first time the grid comes into view the light sweeps across it once, on a Web Animations clock.
 * The light eases toward its target; the loop stops when it arrives. Under reduced motion it jumps.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(grid) {
    var cells = [].slice.call(grid.querySelectorAll(".gg-cell"));
    var buttons = cells.filter(function (c) { return c.tagName === "BUTTON"; });
    var M = cells.length;
    if (!M) return;
    var reach = +grid.getAttribute("data-gg-reach") || 1.8;
    var cx = new Float32Array(M), cy = new Float32Array(M), hw = new Float32Array(M), hh = new Float32Array(M), val = new Float32Array(M);
    var unit = 60, W = 0, H = 0;
    var px = 0, py = 0, tx = 0, ty = 0, amp = 0, ampT = 0, pointerIn = false;
    var sweep = null, swept = false, raf = 0, last = 0;

    function measure() {
      var g = grid.getBoundingClientRect();
      W = g.width; H = g.height;
      unit = Infinity;
      for (var i = 0; i < M; i++) {
        var r = cells[i].getBoundingClientRect();
        cx[i] = r.left - g.left + r.width / 2; cy[i] = r.top - g.top + r.height / 2;
        hw[i] = r.width / 2; hh[i] = r.height / 2;
        unit = Math.min(unit, r.width);
      }
      paint();
    }
    function paint() {
      var R = reach * unit;
      for (var i = 0; i < M; i++) {
        var dx = Math.max(0, Math.abs(px - cx[i]) - hw[i]), dy = Math.max(0, Math.abs(py - cy[i]) - hh[i]);
        var f = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / R), g = amp * f * f;
        if (Math.abs(g - val[i]) > 0.004 || (g === 0 && val[i] !== 0)) { val[i] = g; cells[i].style.setProperty("--gg", g.toFixed(3)); }
      }
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (sweep) {
        var p = sweep.effect.getComputedTiming().progress;
        if (sweep.playState === "finished" || p == null) { sweep = null; if (!pointerIn && !grid.contains(document.activeElement)) ampT = 0; }
        else { tx = px = -unit + (W + 2 * unit) * p; ty = py = H * (0.3 + 0.4 * p); ampT = 1; }
      }
      var k = 1 - Math.exp(-dt / 70), ka = 1 - Math.exp(-dt / 140);
      px += (tx - px) * k; py += (ty - py) * k; amp += (ampT - amp) * ka;
      var done = !sweep && Math.abs(tx - px) < 0.3 && Math.abs(ty - py) < 0.3 && Math.abs(ampT - amp) < 0.003;
      if (done) { px = tx; py = ty; amp = ampT; }
      paint();
      if (!done && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() {
      if (reduce.matches) { px = tx; py = ty; amp = ampT; paint(); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function aim(x, y, a) {
      if (sweep) { sweep.cancel(); sweep = null; }
      tx = x; ty = y; ampT = a;
      if (amp < 0.02) { px = x; py = y; }   // the light switches on where it is aimed, it does not fly in
      kick();
    }

    grid.addEventListener("pointermove", function (e) {
      var g = grid.getBoundingClientRect();
      pointerIn = true;
      aim(e.clientX - g.left, e.clientY - g.top, 1);
    });
    grid.addEventListener("pointerdown", function (e) {
      var g = grid.getBoundingClientRect();
      pointerIn = true;
      aim(e.clientX - g.left, e.clientY - g.top, 1);
    });
    function out() {
      pointerIn = false;
      var f = document.activeElement, i = cells.indexOf(f);
      if (i >= 0) aim(cx[i], cy[i], 1); else aim(tx, ty, 0);
    }
    grid.addEventListener("pointerleave", out);
    grid.addEventListener("pointercancel", out);
    grid.addEventListener("focusin", function (e) {
      var i = cells.indexOf(e.target);
      if (i < 0) return;
      buttons.forEach(function (b) { b.tabIndex = b === e.target ? 0 : -1; });
      aim(cx[i], cy[i], 1);   // the keyboard wins until the pointer moves again
    });
    grid.addEventListener("focusout", function () {
      setTimeout(function () { if (!pointerIn && !grid.contains(document.activeElement)) aim(tx, ty, 0); }, 0);
    });

    // arrow keys: to the nearest button in that direction
    grid.addEventListener("keydown", function (e) {
      var dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
      var i = cells.indexOf(document.activeElement);
      if (!dir || i < 0) return;
      e.preventDefault();
      var best = null, score = Infinity;
      buttons.forEach(function (b) {
        var j = cells.indexOf(b), dx = cx[j] - cx[i], dy = cy[j] - cy[i];
        var along = dx * dir[0] + dy * dir[1], side = Math.abs(dx * dir[1] + dy * dir[0]);
        if (along < 2) return;
        var s = along + side * 3;
        if (s < score) { score = s; best = b; }
      });
      if (best) best.focus();
    });
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        grid.dispatchEvent(new CustomEvent("gg-pick", { bubbles: true, detail: { cell: b } }));
      });
    });

    // one tab stop for the whole grid: the picked button, else the first one
    var first = buttons.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; })[0] || buttons[0];
    buttons.forEach(function (b) { b.tabIndex = b === first ? 0 : -1; });

    measure();
    grid.classList.add("gg-live");
    if (window.ResizeObserver) new ResizeObserver(measure).observe(grid); else window.addEventListener("resize", measure);
    reduce.addEventListener("change", function () { if (sweep) { sweep.cancel(); sweep = null; } kick(); });
    if ("IntersectionObserver" in window && grid.animate) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting || swept) return;
        swept = true; io.disconnect();
        if (reduce.matches || pointerIn) return;
        sweep = grid.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1400, easing: "ease-in-out" });
        sweep.id = "lights sweep on";
        amp = 0; kick();
      }, { threshold: 0.4 });
      io.observe(grid);
    }
  }

  function start() { document.querySelectorAll(".gg").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
