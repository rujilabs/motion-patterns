/*
 * mega.js: a disclosure nav with one shared panel. Markup: nav.mega holding buttons with
 * aria-expanded and aria-controls (each pointing at a .mega-section), a .mega-mark span, and a
 * .mega-panel > .mega-sections holding the sections. Each section's columns are .mega-col.
 * Click a button to open its section, click it again (or Esc, or outside) to close.
 */
(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(nav) {
    var btns = Array.prototype.slice.call(nav.querySelectorAll("button[aria-controls]"));
    var panel = nav.querySelector(".mega-panel");
    var current = -1;

    btns.forEach(function (b) {
      var sec = document.getElementById(b.getAttribute("aria-controls"));
      sec.querySelectorAll(".mega-col").forEach(function (c, n) { c.style.setProperty("--i", n); });
      sec.inert = true;
      sec.addEventListener("animationend", function (e) {
        if (e.target === sec) sec.classList.remove("is-leaving");
      });
    });

    function secOf(i) { return document.getElementById(btns[i].getAttribute("aria-controls")); }

    function mark(i) {
      var b = btns[i];
      var nr = nav.getBoundingClientRect(), br = b.getBoundingClientRect();
      nav.style.setProperty("--mega-x", (br.left - nr.left) + "px");
      nav.style.setProperty("--mega-w", br.width + "px");
    }

    function open(i) {
      var wasOpen = current >= 0;
      var from = current;
      var sec = secOf(i);
      nav.style.setProperty("--mega-dir", wasOpen ? (i > from ? 1 : -1) : 0);
      btns.forEach(function (b, n) { b.setAttribute("aria-expanded", n === i ? "true" : "false"); });
      if (wasOpen) {
        var old = secOf(from);
        old.classList.remove("is-current");
        old.inert = true;
        if (!reduce.matches) old.classList.add("is-leaving");
      }
      // restart the column entrance each time a section comes in
      sec.classList.remove("is-current", "is-leaving");
      void sec.offsetWidth;
      sec.classList.add("is-current");
      sec.inert = false;
      var h = sec.offsetHeight + "px";
      if (!wasOpen) {
        // first open: size the panel before it shows, so only the unroll animates
        panel.style.transition = "none";
        nav.style.setProperty("--mega-h", h);
        mark(i);
        void panel.offsetHeight;
        panel.style.transition = "";
        nav.classList.add("is-open");
      } else {
        nav.style.setProperty("--mega-h", h);
        mark(i);
      }
      current = i;
    }

    function close(back) {
      if (current < 0) return;
      var sec = secOf(current);
      sec.inert = true;
      btns[current].setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      if (back) btns[current].focus();
      var was = sec;
      setTimeout(function () { if (current < 0) was.classList.remove("is-current"); }, reduce.matches ? 0 : 320);
      current = -1;
    }

    btns.forEach(function (b, n) {
      b.addEventListener("click", function () { n === current ? close(false) : open(n); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(true); });
    document.addEventListener("click", function (e) { if (!nav.contains(e.target)) close(false); });
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        if (current < 0) return;
        nav.style.setProperty("--mega-h", secOf(current).offsetHeight + "px");
        mark(current);
      }).observe(nav);
    }
  }

  function start() { document.querySelectorAll(".mega").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
