/*
 * falling-words.js: every [data-fall-pit] box wraps the words of its [data-fall] blocks in .fw-w.
 * A click on those words, or on the [data-fall-drop] button, drops them: a small physics run (gravity,
 * floor, walls, boxes that stack) is worked out in one go, then played as one Web Animation per word,
 * so the frame cost is the browser's own. [data-fall-reset] flies them back home.
 * Under reduced motion the pile shows at once and goes back at once.
 * data-fall-gravity on the box: pull in px per frame squared at 60 fps (default 0.55).
 * data-fall-floor on the box: gap between the pile and the bottom edge, in px (default 12).
 * Each word's box is sized for its final tip, so words in the pile do not cut into each other.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var STEP_MS = 1000 / 60;

  function wrapWords(block) {
    var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (t) {
      if (!/\S/.test(t.nodeValue)) return;
      var frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement("span");
        w.className = "fw-w";
        w.textContent = part;
        frag.appendChild(w);
      });
      t.parentNode.replaceChild(frag, t);
    });
  }

  function setup(pit) {
    var blocks = [].slice.call(pit.querySelectorAll("[data-fall]"));
    blocks.forEach(wrapWords);
    var words = [].slice.call(pit.querySelectorAll(".fw-w"));
    if (!words.length) return;
    var dropBtn = pit.querySelector("[data-fall-drop]");
    var resetBtn = pit.querySelector("[data-fall-reset]");
    var g = parseFloat(pit.getAttribute("data-fall-gravity")) || 0.55;
    var fl = parseFloat(pit.getAttribute("data-fall-floor"));
    var floor = isNaN(fl) ? 12 : fl;
    var down = false;
    var ends = []; // the last transform of each word, for the way back
    var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";

    function simulate() {
      var pr = pit.getBoundingClientRect();
      var W = pit.clientWidth, H = pit.clientHeight - floor;
      var n = words.length;
      var b = words.map(function (el, i) {
        var r = el.getBoundingClientRect();
        var x = r.left - pr.left - pit.clientLeft, y = r.top - pr.top - pit.clientTop;
        // small words tip further than long ones
        var tilt = (Math.random() - 0.5) * 22 * Math.min(1, 70 / r.width), t = Math.abs(tilt) * Math.PI / 180;
        return {
          // centre of the word, and the half size of its box once tipped (plus 1 px of air each side)
          x: x + r.width / 2, y: y + r.height / 2, x0: x + r.width / 2, y0: y + r.height / 2,
          hw: (r.width * Math.cos(t) + r.height * Math.sin(t)) / 2 + 1,
          hh: (r.width * Math.sin(t) + r.height * Math.cos(t)) / 2 + 1,
          // a hop and a push toward a random spot along the floor, so the pile spreads over the whole box
          vx: (r.width / 2 + Math.random() * (W - r.width) - x - r.width / 2) / (40 + Math.random() * 20), vy: -2 - Math.random() * 3,
          a: 0, va: (Math.random() - 0.5) * 6, tilt: tilt,
          // the last line lets go first, so a word never falls through one still in place
          start: Math.round((n - 1 - i) * 1.6 + Math.random() * 6),
          frames: []
        };
      });

      function walls(p) {
        if (p.y + p.hh > H) { p.y = H - p.hh; if (p.vy > 0) p.vy = p.vy > 2 ? -p.vy * 0.28 : 0; p.vx *= 0.82; p.ground = true; }
        if (p.x - p.hw < 0) { p.x = p.hw; p.vx = Math.abs(p.vx) * 0.4; }
        if (p.x + p.hw > W) { p.x = W - p.hw; p.vx = -Math.abs(p.vx) * 0.4; }
      }

      // pushes every pair of word boxes apart; returns the deepest overlap it found
      function resolve() {
        var worst = 0, i, j, p, q;
        for (i = 0; i < n; i++) {
          p = b[i];
          if (!p.on) continue;
          for (j = i + 1; j < n; j++) {
            q = b[j];
            if (!q.on) continue;
            var ox = p.hw + q.hw - Math.abs(p.x - q.x);
            var oy = p.hh + q.hh - Math.abs(p.y - q.y);
            if (ox <= 0 || oy <= 0) continue;
            if (Math.min(ox, oy) > worst) worst = Math.min(ox, oy);
            if (oy < ox) {
              var top = p.y < q.y ? p : q, low = top === p ? q : p;
              top.y -= oy;
              if (top.vy > low.vy) top.vy = low.vy - (top.vy - low.vy > 2 ? (top.vy - low.vy) * 0.2 : 0);
              top.vx *= 0.8;
              top.ground = true;
              // a word resting mostly off the edge of the one below slides off it
              var overhang = top.x - low.x;
              if (Math.abs(overhang) > low.hw) top.vx += overhang > 0 ? 0.25 : -0.25;
            } else {
              var left = p.x < q.x ? p : q, right = left === p ? q : p;
              left.x -= ox / 2; right.x += ox / 2;
              var v = (left.vx + right.vx) / 2;
              left.vx = v - 0.2; right.vx = v + 0.2;
            }
          }
        }
        for (i = 0; i < n; i++) if (b[i].on) walls(b[i]);
        return worst;
      }

      var steps = 0, calm = 0;
      for (; steps < 480; steps++) {
        var moving = false, i, p, worst = 0;
        for (i = 0; i < n; i++) {
          p = b[i];
          p.on = steps >= p.start;
          if (!p.on) continue;
          p.vy += g;
          p.vx *= 0.995;
          p.x += p.vx; p.y += p.vy;
          p.ground = false;
          walls(p);
        }
        // several passes so a stack settles in one step, and stops early once nothing overlaps
        for (var pass = 0; pass < 10; pass++) {
          worst = resolve();
          if (worst < 0.5) break;
        }
        for (i = 0; i < n; i++) {
          p = b[i];
          if (!p.on) { moving = true; continue; }
          if (p.ground) { p.a += (p.tilt - p.a) * 0.25; p.va = 0; }
          else p.a += p.va;
          if (Math.abs(p.vx) > 0.05 || Math.abs(p.vy) > 0.6 || Math.abs(p.tilt - p.a) > 0.2) moving = true;
        }
        if (worst > 1.5) moving = true;
        if (steps % 2 === 0) b.forEach(record);
        calm = moving ? 0 : calm + 1;
        if (calm > 12) break;
      }
      b.forEach(function (p) { p.a = p.tilt; record(p); });
      return { bodies: b, ms: steps * STEP_MS };
    }

    function record(p) {
      p.frames.push({ transform: "translate(" + (p.x - p.x0).toFixed(1) + "px," + (p.y - p.y0).toFixed(1) + "px) rotate(" + p.a.toFixed(1) + "deg)" });
    }

    function clear() {
      words.forEach(function (w) {
        w.getAnimations().forEach(function (a) { a.cancel(); });
        w.style.removeProperty("transform");
      });
    }

    function drop() {
      if (down) return;
      clear();
      var run = simulate();
      down = true;
      pit.classList.add("is-down");
      ends = run.bodies.map(function (p) { return p.frames[p.frames.length - 1].transform; });
      words.forEach(function (w, i) {
        if (still.matches) { w.style.transform = ends[i]; return; }
        w.animate(run.bodies[i].frames, { duration: run.ms, easing: "linear", fill: "forwards" });
      });
      sync();
    }

    function reset() {
      if (!down) return;
      down = false;
      pit.classList.remove("is-down");
      clear();
      if (!still.matches) {
        words.forEach(function (w, i) {
          w.animate([{ transform: ends[i] }, { transform: "none" }], { duration: 700, delay: i * 18, easing: ease, fill: "backwards" });
        });
      }
      sync();
    }

    function sync() {
      if (dropBtn) dropBtn.setAttribute("aria-disabled", down ? "true" : "false");
      if (resetBtn) resetBtn.setAttribute("aria-disabled", down ? "false" : "true");
    }

    blocks.forEach(function (bl) { bl.addEventListener("click", drop); });
    if (dropBtn) { dropBtn.hidden = false; dropBtn.addEventListener("click", drop); }
    if (resetBtn) { resetBtn.hidden = false; resetBtn.addEventListener("click", reset); }
    pit.classList.add("fw-ready");
    sync();

    // a new box size makes the pile wrong: put the words home without motion
    if ("ResizeObserver" in window) {
      var lastW = pit.clientWidth, lastH = pit.clientHeight;
      new ResizeObserver(function () {
        if (pit.clientWidth === lastW && pit.clientHeight === lastH) return;
        lastW = pit.clientWidth; lastH = pit.clientHeight;
        if (down) { down = false; pit.classList.remove("is-down"); clear(); sync(); }
      }).observe(pit);
    }
  }

  function start() { document.querySelectorAll("[data-fall-pit]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
