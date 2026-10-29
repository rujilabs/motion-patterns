/*
 * drum-rolodex.js: a rotary card file. Every card hangs on one axle by its bottom edge (rotateX about a
 * point below the card). The open card stands upright in a gap; the cards after it lean back, fanned a
 * few degrees apart, and the cards before it have fallen forward, so you see their backs. Scroll, drag
 * or flick and the cards flip over the drum one by one, with momentum, landing on a card. Type a letter
 * to spin to the first name with it.
 *
 *   <div class="rdx" role="listbox" tabindex="0" aria-label="Suppliers">
 *     <ol class="rdx-list">
 *       <li class="rdx-card" role="option" id="c1" data-key="Ah Keong">
 *         <div class="rdx-front">...</div><div class="rdx-back"></div>
 *       </li> ...
 *     </ol>
 *     <span class="rdx-knob rdx-knob-l"></span><span class="rdx-knob rdx-knob-r"></span><span class="rdx-base"></span>
 *   </div>
 *
 * data-key on a card is what typing matches (default: its text). li.is-on is the starting card.
 * Event "change" when it comes to rest on a new card. el.rolodex.go(i), .index, .letter("K").
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAD = Math.PI / 180;
  var GLIDE = 0.3;     // seconds a flick keeps its speed
  var PX = 34;         // drag distance that flips one card
  var GAP = 15;        // the open card's lean back from the next one, in degrees
  var FAN = 5.5;       // degrees between the cards behind
  var FALL = 94;       // how far a card falls forward: it lies on the stack in front of the axle
  var STACK = 4;       // degrees between the fallen cards: their edges show as a stack
  // light from above and in front of the desk: a face is lit by the cosine to this direction
  var LY = -0.6, LZ = 0.8;

  function angle(d) {
    if (d >= 1) return Math.min(82, GAP + (d - 1) * FAN);
    if (d >= 0) return GAP * d * d * (3 - 2 * d); // eases out of the gap as it comes upright
    if (d > -1) { var u = -d; return -FALL * u * u * (3 - 2 * u); } // tips over the top and falls
    return Math.max(-150, -FALL - (-d - 1) * STACK);
  }

  function Rolodex(el) {
    var cards = Array.prototype.slice.call(el.querySelectorAll(".rdx-card"));
    var n = cards.length;
    if (!n) return;
    var keys = cards.map(function (c) { return (c.getAttribute("data-key") || c.textContent).trim().toUpperCase(); });
    var start = Math.max(0, cards.findIndex(function (c) { return c.classList.contains("is-on"); }));
    var knobs = el.querySelectorAll(".rdx-knob");

    var pos = start, vel = 0, target = start, omega = 12, raf = 0, last = 0, dragging = false, current = -1;

    function render() {
      for (var i = 0; i < n; i++) {
        var c = cards[i], d = i - pos;
        // only the top six fallen cards are drawn: they make the front stack; deeper ones fade out
        var fade = d < -6 ? Math.max(0, d + 7) : 1;
        if (d > 9 || fade <= 0) { c.style.visibility = "hidden"; continue; }
        c.style.visibility = "";
        c.style.setProperty("--rdx-fade", fade.toFixed(3));
        var a = angle(d);
        c.style.transform = "rotateX(" + a.toFixed(3) + "deg)";
        var s = Math.sin(a * RAD), co = Math.cos(a * RAD);
        // the front's normal is (0, -sin a, cos a), the back's the opposite; lit = cosine to the light
        var nf = Math.max(0, (-s) * LY + co * LZ), nb = Math.max(0, s * LY - co * LZ);
        // an upright card is the reference; deeper in either stack, less light gets between the cards
        var deep = d > 1 ? (d - 1) * 0.05 : d < -1 ? (-d - 1) * 0.06 : 0;
        c.style.setProperty("--rdx-shade-front", Math.min(0.8, Math.max(0, 0.8 - nf) * 0.8 + deep).toFixed(3));
        c.style.setProperty("--rdx-shade-back", Math.min(0.8, Math.max(0, 0.8 - nb) * 0.7 + deep).toFixed(3));
      }
      var turn = (pos * 14).toFixed(2) + "deg"; // the knobs on the axle turn with the drum
      for (var k = 0; k < knobs.length; k++) knobs[k].style.setProperty("--rdx-turn", turn);
    }

    function select(i) {
      if (i === current) return;
      if (current >= 0) cards[current].setAttribute("aria-selected", "false");
      current = i;
      cards[i].setAttribute("aria-selected", "true");
      el.setAttribute("aria-activedescendant", cards[i].id);
    }
    function settle() {
      var i = Math.max(0, Math.min(n - 1, target));
      var was = current;
      select(i);
      if (i !== was) el.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function frame(t) {
      var dt = Math.min(0.05, last ? (t - last) / 1000 : 1 / 60);
      last = t;
      var e = pos - target, c = vel + omega * e, ex = Math.exp(-omega * dt);
      e = (e + c * dt) * ex;
      vel = (vel - omega * c * dt) * ex;
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
    function clampIdx(i) { return Math.max(0, Math.min(n - 1, i)); }
    function go(i, w) {
      target = clampIdx(i);
      omega = w || 12;
      select(target);
      if (reduce.matches) { stop(); pos = target; vel = 0; render(); settle(); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function rubber(raw) {
      if (raw < 0) return -(1 - 1 / (1 - raw * 0.7)) / 0.7 * 0.4;
      if (raw > n - 1) { var o = raw - (n - 1); return n - 1 + (1 - 1 / (1 + o * 0.7)) / 0.7 * 0.4; }
      return raw;
    }

    var startY = 0, startPos = 0, moved = false, samples = [];
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      stop(); vel = 0;
      dragging = true; moved = false;
      startY = e.clientY; startPos = pos; samples = [[e.timeStamp, pos]];
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-grabbed");
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      if (Math.abs(dy) > 3) moved = true;
      pos = rubber(startPos + dy / PX); // pull down: the open card comes toward you and the next one stands up
      samples.push([e.timeStamp, pos]);
      while (samples.length > 2 && e.timeStamp - samples[0][0] > 90) samples.shift();
      render();
    });
    function release(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-grabbed");
      if (!moved) { go(Math.round(pos)); return; }
      var a = samples[0], b = samples[samples.length - 1], dt = (b[0] - a[0]) / 1000;
      var v = dt > 0.005 && e.timeStamp - b[0] < 60 ? (b[1] - a[1]) / dt : 0;
      vel = v;
      var proj = pos + v * GLIDE, t = clampIdx(Math.round(proj));
      go(t, Math.abs(v) > 2 && t === Math.round(proj) ? 1 / GLIDE : 12);
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    var wheelTimer = 0;
    el.addEventListener("wheel", function (e) {
      var d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      if (!d) return;
      // at either end, let the page scroll on instead of trapping it
      if ((d < 0 && target <= 0 && pos <= 0.01) || (d > 0 && target >= n - 1 && pos >= n - 1.01)) return;
      e.preventDefault();
      if (Math.abs(d) >= 50) { go(Math.round(target) + Math.sign(d), 14); return; }
      stop(); vel = 0;
      pos = rubber(pos + d / PX * 0.6);
      target = clampIdx(Math.round(pos));
      render();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () { go(Math.round(pos), 12); }, 120);
    }, { passive: false });

    // type a letter (or a few, quickly) to spin to the first card that starts with it
    var typed = "", typedAt = 0;
    function letter(s) {
      s = s.toUpperCase();
      var from = s.length === 1 && keys[current] && keys[current][0] === s ? current + 1 : 0;
      for (var k = 0; k < n; k++) {
        var i = (from + k) % n;
        if (keys[i].indexOf(s) === 0) { go(i, 9); return i; }
      }
      return -1;
    }
    el.addEventListener("keydown", function (e) {
      var t = Math.round(target);
      var map = { ArrowDown: t + 1, ArrowUp: t - 1, PageDown: t + 5, PageUp: t - 5, Home: 0, End: n - 1 };
      if (e.key in map) { e.preventDefault(); go(map[e.key], 14); return; }
      if (e.key.length === 1 && /[a-z0-9]/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        typed = e.timeStamp - typedAt < 700 ? typed + e.key : e.key;
        typedAt = e.timeStamp;
        if (letter(typed) < 0 && typed.length > 1) { typed = e.key; letter(typed); }
      }
    });

    render();
    select(start);
    el.classList.add("is-ready");
    el.rolodex = {
      get index() { return current; },
      go: function (i) { go(i, 9); },
      letter: letter
    };
  }

  function init() { document.querySelectorAll(".rdx").forEach(Rolodex); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
