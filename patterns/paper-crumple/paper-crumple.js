/*
 * paper-crumple.js: crumple a note into a ball, throw it in the bin, and bring it back.
 *   <div class="crumple-board">
 *     <article class="crumple">... <svg class="crumple-creases" aria-hidden="true">...</svg></article>
 *     <div class="crumple-bin">...</div>
 *   </div>
 *   note.crumple.discard()  // fires "discarded" on the note when the ball is in the bin
 *   note.crumple.restore()  // the ball comes back out and opens up; fires "restored"
 * One timeline per throw (crumple, swap to the ball, arc, drop), so restore is the same move reversed.
 * The arc is a real throw: straight across at a steady speed, falling under constant gravity.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var T = 1500, PTS = 20, BALL_SVG =
    '<svg viewBox="0 0 60 60"><path fill="currentColor" d="M30 3l9 4 9-1 5 9 4 8-2 9 3 9-7 7-6 8-10-1-8 3-8-5-9-3-2-10-3-8 3-9 2-9 8-4z"/>' +
    '<path fill="rgb(0 0 0 / .16)" d="M30 30l27-7-2 9 3 9-7 7-6 8-10-1-8 3z"/><path fill="rgb(0 0 0 / .1)" d="M30 30l-3 26-8-5-9-3-2-10-3-8z"/>' +
    '<path fill="rgb(255 255 255 / .35)" d="M30 3l9 4-9 23-17-18 8-4z"/><path fill="rgb(255 255 255 / .18)" d="M30 30l18-24 5 9 4 8z"/>' +
    '<path fill="none" stroke="rgb(0 0 0 / .25)" stroke-width="1.2" d="M30 30L13 12M30 30l9-23M30 30l27-7M30 30l3 27M30 30L6 42M21 18l-9 10M42 42l7-14"/></svg>';

  // a little seeded noise, so each note always crumples the same way
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function setup(note, idx) {
    var board = note.closest(".crumple-board");
    var bin = board.querySelector(".crumple-bin");
    var creases = note.querySelector(".crumple-creases");
    var r = rnd(idx * 977 + 31), rect = [], mid = [], ball = [];
    // points around the edge of the note, then the same points pulled into a lumpy ball
    for (var i = 0; i < PTS; i++) {
      var t = i / PTS * 4, side = Math.floor(t), f = t - side, x, y;
      if (side === 0) { x = f * 100; y = 0; } else if (side === 1) { x = 100; y = f * 100; }
      else if (side === 2) { x = 100 - f * 100; y = 100; } else { x = 0; y = 100 - f * 100; }
      rect.push(x.toFixed(1) + "% " + y.toFixed(1) + "%");
      var a = Math.atan2(y - 50, x - 50), rad = 30 + r() * 16;
      var bx = 50 + Math.cos(a) * rad, by = 50 + Math.sin(a) * rad;
      ball.push(bx.toFixed(1) + "% " + by.toFixed(1) + "%");
      var k = 0.45 + r() * 0.2;
      mid.push((x + (bx - x) * k + (r() - .5) * 8).toFixed(1) + "% " + (y + (by - y) * k + (r() - .5) * 8).toFixed(1) + "%");
    }
    var poly = function (p) { return "polygon(" + p.join(", ") + ")"; };
    var state = "here", anims = [], el = null, turn = (r() > .5 ? 1 : -1);

    function fire(n) { note.dispatchEvent(new CustomEvent(n, { bubbles: true })); }

    function discard() {
      if (state !== "here") return;
      if (reduce.matches || !note.animate) { note.classList.add("is-gone"); state = "gone"; fire("discarded"); return; }
      state = "going";
      var b = board.getBoundingClientRect(), bl = board.clientLeft, bt = board.clientTop, n = note.getBoundingClientRect(), bn = bin.getBoundingClientRect();
      var size = parseFloat(getComputedStyle(board).getPropertyValue("--crumple-ball")) || 56;
      var s = size / Math.max(n.width, n.height) * 1.35;
      var opts = { duration: T, easing: "linear", fill: "forwards" };
      anims = [];
      anims.push(note.animate([
        { clipPath: poly(rect), transform: "none", opacity: 1 },
        { clipPath: poly(mid), transform: "scale(.78) rotate(" + 5 * turn + "deg)", offset: .2 },
        { clipPath: poly(ball), transform: "scale(" + s + ") rotate(" + -28 * turn + "deg)", opacity: 1, offset: .4 },
        { clipPath: poly(ball), transform: "scale(" + s + ") rotate(" + -28 * turn + "deg)", opacity: 0, offset: .45 },
        { clipPath: poly(ball), transform: "scale(" + s + ") rotate(" + -28 * turn + "deg)", opacity: 0 }
      ], Object.assign({}, opts, { easing: "ease-in-out" })));
      anims[0].id = "crumple";
      if (creases) anims.push(creases.animate([{ opacity: 0 }, { opacity: 1, offset: .35 }, { opacity: 1 }], opts));
      // the ball: appears where the note folded up, flies to the bin mouth, drops in
      el = document.createElement("span");
      el.className = "crumple-ball";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = BALL_SVG;
      el.style.color = getComputedStyle(note).backgroundColor;
      board.appendChild(el);
      var x0 = n.left + n.width / 2 - b.left - bl - size / 2, y0 = n.top + n.height / 2 - b.top - bt - size / 2;
      var x1 = bn.left + bn.width / 2 - b.left - bl - size / 2, y1 = bn.top - b.top - bt - size * 0.75;
      var peak = Math.min(y0, y1) - Math.max(60, Math.abs(x1 - x0) * 0.35);   // top of the arc
      // a projectile through (0,y0), top at peak, ending at (1,y1): solve for the time of the top
      var h1 = y0 - peak, h2 = y1 - peak, tp = Math.sqrt(h1) / (Math.sqrt(h1) + Math.sqrt(h2));
      var g = 2 * h1 / (tp * tp);
      var keys = [{ opacity: 0, transform: "translate(" + x0 + "px," + y0 + "px) rotate(" + -28 * turn + "deg) scale(.9)" },
        { opacity: 0, transform: "translate(" + x0 + "px," + y0 + "px) rotate(" + -28 * turn + "deg) scale(.9)", offset: .38 },
        { opacity: 1, transform: "translate(" + x0 + "px," + y0 + "px) rotate(" + -28 * turn + "deg) scale(1)", offset: .44 }];
      var a0 = .48, a1 = .88, STEPS = 10;
      for (var k = 0; k <= STEPS; k++) {
        var u = k / STEPS, y = y0 - g * tp * u + g * u * u / 2;
        keys.push({ opacity: 1, transform: "translate(" + (x0 + (x1 - x0) * u).toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + (-28 + 320 * u) * turn + "deg) scale(1)", offset: a0 + (a1 - a0) * u });
      }
      keys.push({ opacity: 1, transform: "translate(" + x1 + "px," + (y1 + size * 0.4) + "px) rotate(" + 340 * turn + "deg) scale(1)" });
      var fly = el.animate(keys, opts);
      fly.id = "throw";
      anims.push(fly);
      fly.onfinish = function () {
        if (state !== "going") return;
        state = "gone";
        note.classList.add("is-gone");
        bump();
        fire("discarded");
      };
    }
    function bump() {
      bin.animate([{ transform: "none" }, { transform: "translateY(2px) rotate(" + -2 * turn + "deg)" }, { transform: "rotate(" + turn + "deg)" }, { transform: "none" }],
        { duration: 380, easing: "ease-out" }).id = "bin";
    }
    function restore() {
      if (state !== "gone") return;
      note.classList.remove("is-gone");
      if (!anims.length) { state = "here"; fire("restored"); return; }
      state = "coming";
      bump();
      anims.forEach(function (a) { a.playbackRate = 1.4; a.reverse(); });
      anims[anims.length - 1].onfinish = function () {
        anims.forEach(function (a) { a.cancel(); });
        anims = [];
        if (el) el.remove();
        el = null;
        state = "here";
        fire("restored");
      };
    }
    note.crumple = { discard: discard, restore: restore, get state() { return state; } };
  }

  function start() { document.querySelectorAll(".crumple").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
