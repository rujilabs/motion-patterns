/*
 * letter-rain-glitch.js: in every .letter-rain, a calm wall of characters on its .lr-canvas. Slow drops
 * run down the columns and light the characters they pass, which fade over 1.6 s; now and then a single
 * character changes; every 2.6 to 5.6 s one or two rows slip sideways for 220 ms and snap back.
 * Calm by design: a character changes at most once every 1.5 s, the slips are at most one every 2.6 s,
 * and nothing flashes, so the notice on top stays easy to read.
 * Time comes from a Web Animation on the canvas ("letter rain"), so the gallery timeline can pause it.
 * A button[data-pause] inside the wall pauses and plays it (aria-pressed). Only cells that change are
 * redrawn, from a pre-drawn glyph sheet. Stops when off screen or when the tab is hidden.
 * Under reduced motion the wall is drawn once, with three trails held still.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var CHARS = "0123456789ABCDEF:+./-=#";
  var TICK = 70, FADE = 1600, HOLD = 1500, LV = 6;

  function setup(root) {
    var canvas = root.querySelector(".lr-canvas");
    if (!canvas || canvas.letterRain) return;
    var ctx = canvas.getContext("2d");
    var sheet = document.createElement("canvas"), sx = sheet.getContext("2d");
    var btn = root.querySelector("button[data-pause]");
    var W = 0, H = 0, dpr = 1, size = 14, cw = 9, ch = 18, cols = 0, rows = 0, n = 0;
    var glyph, bright, level, changed, dirty, list, count = 0, shift, rowDirty;
    var drops = [], clock = null, last = -1, nextSlip = 0, slipEnd = -1, slipRows = [-1, -1];
    var onScreen = false, raf = 0, paused = false, colors = {};

    function read() {
      var cs = getComputedStyle(root);
      size = Math.max(9, parseFloat(cs.getPropertyValue("--lr-size")) || 14);
      colors.ch = cs.getPropertyValue("--lr-char").trim() || "#d4cfc2";
      colors.head = cs.getPropertyValue("--lr-head").trim() || "#2a6f69";
    }
    function makeSheet() {
      // every glyph twice: row 0 in the wall colour, row 1 in the drop colour
      sheet.width = Math.ceil(CHARS.length * cw * dpr); sheet.height = Math.ceil(2 * ch * dpr);
      sx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sx.clearRect(0, 0, CHARS.length * cw, 2 * ch);
      sx.font = "500 " + size + "px ui-monospace, Menlo, Consolas, monospace";
      sx.textAlign = "center"; sx.textBaseline = "middle";
      for (var r = 0; r < 2; r++) {
        sx.fillStyle = r ? colors.head : colors.ch;
        for (var i = 0; i < CHARS.length; i++) sx.fillText(CHARS[i], i * cw + cw / 2, r * ch + ch / 2 + 1);
      }
    }
    function fit() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      read();
      cw = Math.round(size * 0.78); ch = Math.round(size * 1.35);
      cols = Math.max(1, Math.ceil(W / cw)); rows = Math.max(1, Math.ceil(H / ch)); n = cols * rows;
      glyph = new Uint8Array(n); bright = new Float32Array(n); level = new Uint8Array(n); changed = new Float32Array(n);
      dirty = new Uint8Array(n); list = new Int32Array(n); count = 0;
      shift = new Int8Array(rows); rowDirty = new Uint8Array(rows);
      for (var i = 0; i < n; i++) { glyph[i] = (Math.random() * CHARS.length) | 0; changed[i] = -HOLD; }
      drops.length = 0;
      for (var d = 0; d < Math.ceil(cols / 4); d++) drops.push(spawn({}, true));
      makeSheet();
      if (reduce.matches) still(); else { full(); wake(); }
    }
    function spawn(o, first) {
      o.c = (Math.random() * cols) | 0;
      o.r = first ? Math.random() * rows : -Math.random() * rows * 0.6;
      o.v = 0.35 + Math.random() * 0.45;   // rows per tick: 5 to 11 rows a second
      o.at = -1;
      return o;
    }

    function mark(i) { if (!dirty[i]) { dirty[i] = 1; list[count++] = i; } }
    function cell(i) {
      var row = (i / cols) | 0, col = i - row * cols;
      var x = ((col + shift[row]) % cols + cols) % cols * cw, y = row * ch;
      ctx.clearRect(x, y, cw, ch);
      var g = glyph[i] * cw * dpr;
      ctx.drawImage(sheet, g, 0, cw * dpr, ch * dpr, x, y, cw, ch);
      if (level[i]) {
        ctx.globalAlpha = level[i] / LV;
        ctx.drawImage(sheet, g, ch * dpr, cw * dpr, ch * dpr, x, y, cw, ch);
        ctx.globalAlpha = 1;
      }
    }
    function full() { ctx.clearRect(0, 0, W, H); for (var i = 0; i < n; i++) cell(i); }
    function flush() {
      for (var r = 0; r < rows; r++) if (rowDirty[r]) {
        rowDirty[r] = 0;
        ctx.clearRect(0, r * ch, W, ch);
        for (var c = 0; c < cols; c++) { var j = r * cols + c; cell(j); if (dirty[j]) dirty[j] = 2; }
      }
      for (var k = 0; k < count; k++) { var i = list[k]; if (dirty[i] === 1) cell(i); dirty[i] = 0; }
      count = 0;
    }

    function tick(t) {
      var i, d, o;
      for (d = 0; d < drops.length; d++) {
        o = drops[d];
        o.r += o.v;
        var row = Math.floor(o.r);
        if (row !== o.at && row >= 0 && row < rows) {
          i = row * cols + o.c;
          bright[i] = 1;
          if (t - changed[i] >= HOLD) { glyph[i] = (Math.random() * CHARS.length) | 0; changed[i] = t; }
          mark(i);
        }
        o.at = row;
        if (o.r > rows + 2) spawn(o, false);
      }
      for (var m = Math.max(1, (n * 0.002) | 0); m > 0; m--) {
        i = (Math.random() * n) | 0;
        if (t - changed[i] >= HOLD) { glyph[i] = (Math.random() * CHARS.length) | 0; changed[i] = t; mark(i); }
      }
      for (i = 0; i < n; i++) if (bright[i] > 0) {
        bright[i] = Math.max(0, bright[i] - TICK / FADE);
        var lv = Math.ceil(bright[i] * bright[i] * LV);
        if (lv !== level[i]) { level[i] = lv; mark(i); }
      }
      // the slip: one or two rows step sideways, then back
      if (slipEnd >= 0 && t >= slipEnd) {
        for (d = 0; d < 2; d++) if (slipRows[d] >= 0) { shift[slipRows[d]] = 0; rowDirty[slipRows[d]] = 1; slipRows[d] = -1; }
        slipEnd = -1;
        nextSlip = t + 2600 + Math.random() * 3000;
      } else if (slipEnd < 0 && t >= nextSlip) {
        var r0 = (Math.random() * rows) | 0, by = (1 + ((Math.random() * 3) | 0)) * (Math.random() < 0.5 ? -1 : 1);
        slipRows[0] = r0; slipRows[1] = Math.random() < 0.5 && r0 + 1 < rows ? r0 + 1 : -1;
        for (d = 0; d < 2; d++) if (slipRows[d] >= 0) { shift[slipRows[d]] = by; rowDirty[slipRows[d]] = 1; }
        slipEnd = t + 220;
      }
    }

    function live() { return onScreen && !document.hidden && !paused && !reduce.matches; }
    function wake() {
      if (!live()) { if (clock && clock.playState === "running") clock.pause(); return; }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 60000, iterations: Infinity });
        clock.id = "letter rain";
        nextSlip = 1800;
      }
      if (clock && clock.playState === "paused" && !paused) clock.play();
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function frame() {
      raf = 0;
      if (!clock || !live()) return;
      var t = clock.currentTime || 0;
      if (last < 0 || t < last) last = t - TICK;
      var steps = 0;
      while (t - last >= TICK && steps < 3) { last += TICK; tick(last); steps++; }
      if (t - last >= TICK) last = t;
      if (steps) flush();
      raf = requestAnimationFrame(frame);
    }

    function still() {
      for (var i = 0; i < n; i++) { bright[i] = 0; level[i] = 0; }
      for (var r = 0; r < rows; r++) shift[r] = 0;
      [0.18, 0.52, 0.83].forEach(function (f, k) {
        var c = Math.min(cols - 1, (f * cols) | 0), end = Math.min(rows - 1, ((0.3 + 0.25 * k) * rows) | 0);
        for (var r2 = Math.max(0, end - 8); r2 <= end; r2++) level[r2 * cols + c] = Math.ceil(Math.pow(1 - (end - r2) / 9, 2) * LV);
      });
      full();
    }
    function setPaused(p) {
      paused = p;
      if (btn) { btn.setAttribute("aria-pressed", p ? "true" : "false"); btn.textContent = p ? "Play background" : "Pause background"; }
      if (p) { if (clock) clock.pause(); } else wake();
    }

    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; wake(); }).observe(root);
    } else onScreen = true;
    document.addEventListener("visibilitychange", wake);
    function sync() {
      if (btn) btn.hidden = reduce.matches;
      if (reduce.matches) { if (clock) clock.pause(); still(); } else { full(); wake(); }
    }
    reduce.addEventListener("change", sync);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { read(); makeSheet(); full(); });

    canvas.classList.add("is-live");
    canvas.letterRain = { pause: function () { setPaused(true); }, play: function () { setPaused(false); } };
    if (btn) btn.hidden = reduce.matches;
    fit();
  }

  function init() { document.querySelectorAll(".letter-rain").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
