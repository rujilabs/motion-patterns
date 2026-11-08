/*
 * fuzzy-text.js: in every .fz, the text of .fz-text is drawn on canvas.fz-canvas in thin rows, and each
 * row slides sideways by a little smooth noise, with a faint coloured copy a step behind it. The text
 * keeps its place, so it stays readable; nothing blinks, rows only drift.
 * Over the .fz (hover, a touch, or focus on anything inside it) the noise calms to data-fuzz-calm
 * (default .2) of its full size. The full size is data-fuzz (default .07) times the font size.
 * Time runs on a Web Animations clock on the canvas, so the gallery timeline can pause it. A button with
 * data-pause-for="<id of the .fz>" pauses it too. Nothing is drawn off screen or in a hidden tab.
 * Off under reduced motion: the plain HTML text shows.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ROW = 2;  // CSS px per row

  function setup(box) {
    var text = box.querySelector(".fz-text"), canvas = box.querySelector(".fz-canvas");
    if (!text || !canvas || !canvas.getContext || !canvas.animate) return;
    var ctx = canvas.getContext("2d");
    var ink = document.createElement("canvas"), ghost = document.createElement("canvas");
    var full = parseFloat(box.getAttribute("data-fuzz")) || 0.07;
    var calmTo = parseFloat(box.getAttribute("data-fuzz-calm"));
    if (isNaN(calmTo)) calmTo = 0.2;
    var dpr = 1, W = 0, H = 0, pad = 0, rows = 0, rowPx = 2, fs = 16;
    var ph = new Float32Array(0);
    var level = 1, hovered = false, focused = false, touchUntil = 0;
    var clock = null, raf = 0, onScreen = true, paused = false, live = false;
    var btn = box.id ? document.querySelector('[data-pause-for="' + box.id + '"]') : null;

    function paintText(c, color) {
      var g = c.getContext("2d"), cs = getComputedStyle(text);
      c.width = W; c.height = H;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
      if ("letterSpacing" in g) g.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      g.fillStyle = color;
      g.textBaseline = "alphabetic";
      var m = g.measureText(text.textContent);
      var asc = m.fontBoundingBoxAscent || fs * 0.8, desc = m.fontBoundingBoxDescent || fs * 0.2;
      var lh = text.getBoundingClientRect().height;
      g.fillText(text.textContent, pad, (lh - asc - desc) / 2 + asc);
    }
    function fit() {
      var b = text.getBoundingClientRect(), cs = getComputedStyle(box);
      fs = parseFloat(getComputedStyle(text).fontSize) || 16;
      pad = Math.ceil(fs * full * 1.8) + 4;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var cw = b.width + pad * 2, ch = b.height;
      canvas.style.width = cw + "px"; canvas.style.height = ch + "px";
      canvas.style.left = (text.offsetLeft - pad) + "px"; canvas.style.top = text.offsetTop + "px";
      W = Math.round(cw * dpr); H = Math.round(ch * dpr);
      canvas.width = W; canvas.height = H;
      paintText(ink, cs.getPropertyValue("--fz-ink").trim() || getComputedStyle(text).color);
      paintText(ghost, cs.getPropertyValue("--fz-ghost").trim() || "#e5484d");
      rowPx = Math.max(1, Math.round(ROW * dpr));
      rows = Math.ceil(H / rowPx);
      if (ph.length !== rows * 2) {
        ph = new Float32Array(rows * 2);
        for (var i = 0; i < ph.length; i++) ph[i] = Math.random() * 6.283;
      }
      draw(clock && clock.currentTime != null ? clock.currentTime : 0);
    }

    // sideways offset of row r at time t (s), in device px, before the level is applied
    function off(r, t) {
      var y = r / rows;
      var swell = 0.55 + 0.45 * Math.sin(y * 7.1 + t * 0.9);                          // calmer and busier bands
      var shake = 0.6 * Math.sin(t * 6.9 + ph[r * 2]) + 0.4 * Math.sin(t * 14.5 + ph[r * 2 + 1]);
      var tear = (t * 0.33) % 1.6 - 0.3, d = (y - tear) * 9;                           // a soft tear drifts down
      return (shake * swell + 1.6 * Math.exp(-d * d) * Math.sin(t * 3.1)) * fs * full * dpr;
    }
    function draw(ms) {
      var t = ms / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (!rows) return;
      ctx.globalAlpha = 0.55;
      for (var r = 0; r < rows; r++) {
        var y = r * rowPx, hh = Math.min(rowPx, H - y);
        ctx.drawImage(ghost, 0, y, W, hh, Math.round(off(r, t - 0.09) * level * 1.5 + 2 * dpr), y, W, hh);
      }
      ctx.globalAlpha = 1;
      for (r = 0; r < rows; r++) {
        y = r * rowPx; hh = Math.min(rowPx, H - y);
        ctx.drawImage(ink, 0, y, W, hh, Math.round(off(r, t) * level), y, W, hh);
      }
    }
    function frame(now) {
      raf = 0;
      var calm = hovered || focused || now < touchUntil;
      var want = calm ? calmTo : 1;
      level += (want - level) * 0.08;
      if (clock && clock.currentTime != null) draw(clock.currentTime);
      if (onScreen && !document.hidden && (!paused || Math.abs(want - level) > 0.01)) raf = requestAnimationFrame(frame);
    }
    function kick() { if (live && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame); }

    function start() {
      box.classList.add("fz-live");
      clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 60000, iterations: Infinity });
      clock.id = "fuzz noise";
      if (paused) clock.pause();
      fit();
      kick();
    }
    function stop() {
      if (clock) { clock.cancel(); clock = null; }
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      box.classList.remove("fz-live");
    }
    function sync() {
      var want = !still.matches;
      if (want === live) return;
      live = want;
      if (live) start(); else stop();
    }

    box.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hovered = true; kick(); } });
    box.addEventListener("pointerleave", function () { hovered = false; kick(); });
    box.addEventListener("pointerdown", function () { touchUntil = performance.now() + 2500; kick(); });
    box.addEventListener("focusin", function () { focused = true; kick(); });
    box.addEventListener("focusout", function () { focused = false; kick(); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (live) fit(); }).observe(text);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; kick(); }).observe(box);
    document.addEventListener("visibilitychange", function () {
      if (clock) { if (document.hidden) clock.pause(); else if (!paused) clock.play(); }
      kick();
    });
    if (btn) btn.addEventListener("click", function () {
      paused = !paused;
      btn.setAttribute("aria-pressed", paused ? "true" : "false");
      if (clock) { if (paused) clock.pause(); else clock.play(); }
      kick();
    });
    still.addEventListener("change", sync);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { if (live) fit(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (live) fit(); });
    sync();
  }

  function init() { document.querySelectorAll(".fz").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
