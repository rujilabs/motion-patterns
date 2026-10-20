/*
 * popover.js: places each .popover next to the button whose popovertarget names it, just before it
 * opens. It opens below the button, or above it when there is not room below. Opening, closing,
 * light dismiss and Esc are the browser's own popover behaviour. The motion is all in style.css.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(p) {
    var btn = document.querySelector('[popovertarget="' + p.id + '"]:not([popovertargetaction="hide"])');
    if (!btn) return;
    var tall = 260;

    function place() {
      var r = btn.getBoundingClientRect();
      var below = window.innerHeight - r.bottom;
      var up = below < tall + 24 && r.top > below;
      p.dataset.side = up ? "top" : "bottom";
      p.style.setProperty("--pp-x", (r.left + r.width / 2) + "px");
      p.style.setProperty("--pp-y", (up ? r.top : r.bottom) + "px");
    }

    p.addEventListener("beforetoggle", function (e) { if (e.newState === "open") place(); });
    p.addEventListener("toggle", function (e) {
      if (e.newState !== "open") return;
      tall = p.offsetHeight;
      // focus the first control once the panel has landed, or at once under reduced motion
      var first = p.querySelector("[autofocus], button, input, a[href]");
      if (first) setTimeout(function () { first.focus(); }, reduce.matches ? 0 : 50);
    });
    window.addEventListener("resize", function () { if (p.matches(":popover-open")) place(); });
    window.addEventListener("scroll", function () { if (p.matches(":popover-open")) place(); }, { passive: true });
  }

  function start() {
    if (!HTMLElement.prototype.hasOwnProperty("popover")) return;
    document.querySelectorAll(".popover[popover]").forEach(setup);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
