/*
 * magic-bento.js: every .mb gets one light. The pointer over the grid (mouse, or a finger, which keeps the light
 * for a moment after it lifts) sets --mb-x / --mb-y once per frame; each .mb-card holds its own offset in the
 * grid (--mb-cx / --mb-cy), written again only when the layout changes. Keyboard focus on a card moves the
 * light to that card's centre, so it lights fully and its neighbours catch the edge of it.
 */
(function () {
  function setup(grid) {
    var cards = [].slice.call(grid.querySelectorAll(".mb-card"));
    var frame = 0, x = 0, y = 0, lift = 0;

    function offsets() {
      cards.forEach(function (c) {
        var cx = 0, cy = 0, el = c;
        while (el && el !== grid) { cx += el.offsetLeft; cy += el.offsetTop; el = el.offsetParent; }
        c.style.setProperty("--mb-cx", cx + "px");
        c.style.setProperty("--mb-cy", cy + "px");
      });
    }
    function paint() {
      frame = 0;
      grid.style.setProperty("--mb-x", x.toFixed(1) + "px");
      grid.style.setProperty("--mb-y", y.toFixed(1) + "px");
    }
    function aim(px, py) {
      x = px; y = py;
      grid.style.setProperty("--mb-on", "1");
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function fromEvent(e) {
      var r = grid.getBoundingClientRect();
      aim(e.clientX - r.left, e.clientY - r.top);
    }
    function off() {
      var f = document.activeElement;
      if (f && cards.indexOf(f.closest && f.closest(".mb-card")) > -1 && f.matches(":focus-visible")) { atCard(f.closest(".mb-card")); return; }
      grid.style.setProperty("--mb-on", "0");
      grid.classList.remove("is-live");
    }
    function atCard(c) {
      var el = c, cx = c.offsetWidth / 2, cy = c.offsetHeight / 2;
      while (el && el !== grid) { cx += el.offsetLeft; cy += el.offsetTop; el = el.offsetParent; }
      aim(cx, cy);
    }

    grid.addEventListener("pointermove", function (e) { grid.classList.add("is-live"); fromEvent(e); });
    grid.addEventListener("pointerdown", function (e) { clearTimeout(lift); grid.classList.add("is-live"); fromEvent(e); });
    function up(e) {
      if (e.pointerType === "mouse") return;
      clearTimeout(lift);
      lift = setTimeout(off, 900);
    }
    grid.addEventListener("pointerup", up);
    grid.addEventListener("pointercancel", up);
    grid.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") off(); });
    grid.addEventListener("focusin", function (e) {
      var c = e.target.closest(".mb-card");
      if (c && e.target.matches(":focus-visible")) atCard(c);
    });
    grid.addEventListener("focusout", function (e) {
      if (!grid.contains(e.relatedTarget) && !grid.matches(":hover")) off();
    });

    offsets();
    if ("ResizeObserver" in window) new ResizeObserver(offsets).observe(grid);
  }

  function start() { document.querySelectorAll(".mb").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
