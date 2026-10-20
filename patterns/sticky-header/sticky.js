/*
 * sticky.js: watches the page scroll for every .sticky-header.
 *   .is-scrolled  once the page is more than 8px from the top
 *   .is-hidden    after 6px or more of scrolling down, once past twice the header's height;
 *                 removed by 6px or more of scrolling up, at the top, or when focus moves into it
 * Under reduced motion the header never hides: a header that jumps away with no movement is
 * more confusing than one that stays.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(header) {
    var last = window.scrollY;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 8);
      var dy = y - last;
      if (Math.abs(dy) < 6) return;
      var hide = dy > 0 && y > header.offsetHeight * 2 && !reduce.matches && !header.contains(document.activeElement);
      header.classList.toggle("is-hidden", hide);
      last = y;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
    update();
  }

  function start() { document.querySelectorAll(".sticky-header").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
