/*
 * Stamp collage: pick up a scrap and move it. Pointer events with capture, so a drag that leaves
 * the board still ends cleanly. While lifted the scrap swings with the drag speed (--spin, eased
 * on requestAnimationFrame, the loop stops when it settles); on drop it squashes a little.
 * Positions are written as --x and --y in cqw of the board with style.setProperty, so a moved
 * scrap keeps its place when the board resizes.
 * Keyboard: arrow keys move the focused scrap (Shift for bigger steps), Escape puts it back.
 * Tab always moves on, so a scrap never traps focus. Under reduced motion: no swing, no squash.
 */
(function () {
  var board = document.querySelector(".board");
  if (!board) return;
  var scraps = [].slice.call(board.querySelectorAll(".scrap"));
  var tidy = board.querySelector(".tidy");
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var still = function () { return !!(reduce && reduce.matches); };
  var top = 10, drag = null, raf = 0;
  var state = scraps.map(function () { return { fx: 0, fy: 0 }; });

  function write(el, st) {
    el.style.setProperty("--x", (st.fx * 100).toFixed(3) + "cqw");
    el.style.setProperty("--y", (st.fy * 100).toFixed(3) + "cqw");
  }
  function raise(el) { top += 1; el.style.setProperty("--z", String(top)); }
  function moved() {
    if (!tidy) return;
    tidy.hidden = !state.some(function (st) { return Math.abs(st.fx) > 0.001 || Math.abs(st.fy) > 0.001; });
  }
  // how far the scrap's centre may travel and stay on the board, in board widths
  function limits(el) {
    var b = board.getBoundingClientRect(), r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    return { W: b.width, minX: (b.left - cx) / b.width, maxX: (b.right - cx) / b.width,
      minY: (b.top - cy) / b.width, maxY: (b.bottom - cy) / b.width };
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function clear(el) { el.classList.remove("homing", "nudge"); }
  // a small squash as the scrap meets the felt. Web Animations on the scale property, so the
  // CSS entrance (on transform) is never swapped out and replayed; timing comes from tokens.css
  function settle(el) {
    if (still() || !el.animate) return;
    var cs = getComputedStyle(document.documentElement);
    el.animate([{ scale: "1.06" }, { scale: ".965", offset: 0.4 }, { scale: "1" }], {
      duration: parseFloat(cs.getPropertyValue("--dur-base")) || 600,
      easing: cs.getPropertyValue("--ease-out").trim() || "ease-out"
    });
  }

  function swing() {
    if (!drag) {
      raf = 0;
      return;
    }
    drag.target *= 0.86;
    drag.spin += (drag.target - drag.spin) * 0.2;
    drag.el.style.setProperty("--spin", drag.spin.toFixed(2) + "deg");
    raf = requestAnimationFrame(swing);
  }

  function down(e) {
    if (e.button !== 0 || drag) return;
    var el = e.currentTarget, i = scraps.indexOf(el), st = state[i];
    e.preventDefault();
    if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
    clear(el);
    var lim = limits(el);
    drag = { el: el, st: st, id: e.pointerId, sx: e.clientX, sy: e.clientY, fx0: st.fx, fy0: st.fy, lim: lim,
      lastX: e.clientX, lastT: e.timeStamp, target: 0, spin: 0 };
    el.classList.add("lifted");
    raise(el);
    el.focus({ preventScroll: true });
    if (!still() && !raf) raf = requestAnimationFrame(swing);
  }
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag, W = d.lim.W;
    var dx = clamp((e.clientX - d.sx) / W, d.lim.minX, d.lim.maxX);
    var dy = clamp((e.clientY - d.sy) / W, d.lim.minY, d.lim.maxY);
    d.st.fx = d.fx0 + dx;
    d.st.fy = d.fy0 + dy;
    write(d.el, d.st);
    var dt = Math.max(8, e.timeStamp - d.lastT);
    d.target = clamp(((e.clientX - d.lastX) / dt) * 7, -11, 11);
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var el = drag.el;
    drag = null;
    el.classList.remove("lifted");
    el.style.setProperty("--spin", "0deg");
    settle(el);
    moved();
  }

  function key(e) {
    var el = e.currentTarget, i = scraps.indexOf(el), st = state[i];
    var step = e.shiftKey ? 0.06 : 0.02, dx = 0, dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else if (e.key === "Escape") {
      if (!st.fx && !st.fy) return;
      e.preventDefault();
      home(el, st);
      moved();
      return;
    } else return;
    e.preventDefault();
    var lim = limits(el);
    clear(el);
    el.classList.add("nudge");
    raise(el);
    st.fx += clamp(dx, lim.minX, lim.maxX);
    st.fy += clamp(dy, lim.minY, lim.maxY);
    write(el, st);
    moved();
  }

  function home(el, st) {
    clear(el);
    el.classList.add("homing");
    st.fx = 0;
    st.fy = 0;
    write(el, st);
  }

  scraps.forEach(function (el) {
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("lostpointercapture", up);
    el.addEventListener("keydown", key);
    el.addEventListener("transitionend", function (e) {
      if (e.propertyName === "translate") el.classList.remove("homing", "nudge");
    });
  });

  if (tidy) {
    tidy.addEventListener("click", function () {
      scraps.forEach(function (el, i) {
        if (!state[i].fx && !state[i].fy) return;
        if (still()) home(el, state[i]);
        else setTimeout(function () { home(el, state[i]); }, i * 70);
      });
      tidy.hidden = true;
      scraps[0].focus({ preventScroll: true });
    });
  }
})();
