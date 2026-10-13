/*
 * Squeeze headline: letters swell towards the pointer. A letter near the pointer gets wider and
 * heavier; the rest of its line narrows by exactly what it gained, so every line keeps its
 * length and the block stays justified. Glyph widths are measured once (in a hidden probe, at
 * eleven widths and two weights) and each line's give-back is solved from that table by bisection.
 * Values are written as --w (wdth, %) and --g (weight) on each letter with style.setProperty and
 * eased on requestAnimationFrame; the loop stops when they arrive. Starts after the entrance.
 * Does nothing under reduced motion.
 */
(function () {
  var type = document.querySelector(".type");
  if (!type) return;
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var BASE_W = 115, BASE_G = 800, SWELL_W = 42, SWELL_G = 100, MIN_W = 50, MAX_W = 150;
  var STEPS = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150], WEIGHTS = [800, 900];
  var table = {}, lines = [], raf = 0, live = false, px = 0, py = 0, inside = false;

  // width of one glyph at 100px, for every sampled wdth and weight
  function buildTable() {
    var probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.className = "probe";
    probe.style.setProperty("position", "absolute");
    probe.style.setProperty("visibility", "hidden");
    probe.style.setProperty("white-space", "pre");
    probe.style.setProperty("font-family", getComputedStyle(type).fontFamily);
    probe.style.setProperty("font-size", "100px");
    probe.style.setProperty("letter-spacing", "-.01em");
    document.body.appendChild(probe);
    var chars = {};
    [].forEach.call(type.querySelectorAll(".ch"), function (el) { chars[el.textContent] = 1; });
    Object.keys(chars).forEach(function (c) {
      probe.textContent = c;
      table[c] = WEIGHTS.map(function (g) {
        probe.style.setProperty("font-weight", String(g));
        return STEPS.map(function (w) {
          probe.style.setProperty("font-stretch", w + "%");
          return probe.getBoundingClientRect().width / 100;
        });
      });
    });
    probe.remove();
  }
  function glyph(c, w, g) {
    var rows = table[c];
    var i = Math.min(STEPS.length - 2, Math.max(0, Math.floor((w - STEPS[0]) / 10)));
    var t = (w - STEPS[i]) / 10;
    var at = function (row) { return row[i] + (row[i + 1] - row[i]) * t; };
    var u = (g - WEIGHTS[0]) / (WEIGHTS[1] - WEIGHTS[0]);
    return at(rows[0]) + (at(rows[1]) - at(rows[0])) * u;
  }

  // letter centres are measured at rest, so swelling never feeds back into the distances
  function measure() {
    lines = [].map.call(type.querySelectorAll(".ln"), function (ln) {
      var chars = [].map.call(ln.querySelectorAll(".ch"), function (el) {
        var r = el.getBoundingClientRect();
        return { el: el, c: el.textContent, x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY,
          size: r.height, w: BASE_W, g: BASE_G, tw: BASE_W, tg: BASE_G };
      });
      // the resting length as drawn, kerning included, in the table's units (per 1px of font size).
      // Once neighbours differ the browser shapes each letter on its own and kerning drops out,
      // so the solver below matches unkerned glyph widths to this kerned length.
      var first = chars[0].el.getBoundingClientRect(), last = chars[chars.length - 1].el.getBoundingClientRect();
      var size = parseFloat(getComputedStyle(ln).fontSize) || 100;
      return { chars: chars, length: (last.right - first.left) / size };
    });
  }

  function targets() {
    lines.forEach(function (line) {
      var bumps = line.chars.map(function (c) {
        if (!inside) return 0;
        var radius = c.size * 1.15;
        var dx = (px - c.x) / radius, dy = (py - c.y) / (radius * 1.5);
        return Math.exp(-(dx * dx + dy * dy));
      });
      var g = bumps.map(function (b) { return BASE_G + SWELL_G * b; });
      var widthAt = function (shift) {
        return line.chars.reduce(function (s, c, i) {
          return s + glyph(c.c, Math.max(MIN_W, Math.min(MAX_W, BASE_W + SWELL_W * bumps[i] + shift)), g[i]);
        }, 0);
      };
      // the shift that gives the line back its resting length
      var lo = -70, hi = 40;
      for (var k = 0; k < 22; k++) {
        var mid = (lo + hi) / 2;
        if (widthAt(mid) > line.length) hi = mid; else lo = mid;
      }
      var shift = (lo + hi) / 2;
      line.chars.forEach(function (c, i) {
        c.tw = Math.max(MIN_W, Math.min(MAX_W, BASE_W + SWELL_W * bumps[i] + shift));
        c.tg = g[i];
      });
    });
  }

  function tick() {
    var moving = false;
    lines.forEach(function (line) {
      line.chars.forEach(function (c) {
        c.w += (c.tw - c.w) * 0.16;
        c.g += (c.tg - c.g) * 0.16;
        if (Math.abs(c.tw - c.w) > 0.05 || Math.abs(c.tg - c.g) > 0.5) moving = true;
        else { c.w = c.tw; c.g = c.tg; }
        c.el.style.setProperty("--w", c.w.toFixed(2));
        c.el.style.setProperty("--g", c.g.toFixed(0));
      });
    });
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  function kick() { if (live && !raf) raf = requestAnimationFrame(tick); }
  function clear() {
    lines.forEach(function (line) { line.chars.forEach(function (c) { c.el.style.removeProperty("--w"); c.el.style.removeProperty("--g"); }); });
  }

  function onMove(e) {
    if (!live || (reduce && reduce.matches)) return;
    px = e.pageX; py = e.pageY; inside = true;
    targets(); kick();
  }
  function onLeave() { if (!live) return; inside = false; targets(); kick(); }

  function start() {
    if (reduce && reduce.matches) return;
    buildTable();
    measure();
    live = true;
  }

  document.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
  window.addEventListener("resize", function () {
    if (!live) return;
    if (raf) cancelAnimationFrame(raf);
    raf = 0; inside = false;
    clear();
    measure();
  });

  // wait for the font and the entrance; without getAnimations, fall back to a short timer
  var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(function () {
    var anims = type.getAnimations ? type.getAnimations({ subtree: true }) : [];
    if (!anims.length) { setTimeout(start, 50); return; }
    Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); })).then(start);
  });

  if (reduce && reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (!reduce.matches) return;
      inside = false; live = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      clear();
    });
  }
})();
