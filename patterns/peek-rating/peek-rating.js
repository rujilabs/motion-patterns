/*
 * peek-rating.js: the face for every .peek-rating group. It sets data-show to the star under the
 * pointer (a preview) or else the checked value, lights the stars up to it, and draws the mouth from
 * --pr-mood while the CSS spring moves it. Picking a value pops the star and the face gives a small hop.
 * The radios stay the source of truth: arrow keys, Tab and screen readers work as usual.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(root) {
    if (root._peek) return;
    root._peek = true;
    root.classList.add("pr-live");
    var stars = [].slice.call(root.querySelectorAll(".pr-star"));
    var inputs = stars.map(function (s) { return s.querySelector("input"); });
    var head = root.querySelector(".pr-head");
    var mouth = root.querySelector(".pr-mouth"), open = root.querySelector(".pr-open");
    var spring = getComputedStyle(root).getPropertyValue("--ease-spring").trim() || "ease-out";
    var shown = -1, raf = 0;

    function value() {
      for (var i = 0; i < inputs.length; i++) if (inputs[i].checked) return +inputs[i].value;
      return 0;
    }
    // the mouth is a quadratic curve: it bends down to smile, up to frown, and fills when delighted
    function drawMouth() {
      var m = parseFloat(getComputedStyle(root).getPropertyValue("--pr-mood")) || 0;
      var w = 7 + Math.max(0, m) * 5, c = m * 11, y = 55 - Math.max(0, m) * 2;
      var d = "M" + (44 - w).toFixed(2) + " " + y.toFixed(2) + "Q44 " + (y + c).toFixed(2) + " " + (44 + w).toFixed(2) + " " + y.toFixed(2);
      mouth.setAttribute("d", d);
      if (open) {
        open.setAttribute("d", d + "Z");
        open.setAttribute("opacity", Math.max(0, Math.min(1, (m - 0.72) * 4)).toFixed(2));
      }
    }
    function follow() {
      cancelAnimationFrame(raf);
      (function frame() {
        drawMouth();
        if (root.getAnimations().length) raf = requestAnimationFrame(frame);
      })();
    }
    function show(n) {
      if (n === shown) return;
      shown = n;
      root.setAttribute("data-show", n);
      stars.forEach(function (s, i) { s.classList.toggle("is-lit", i < n); });
      follow();
    }
    function starOf(e) { var s = e.target.closest && e.target.closest(".pr-star"); return s ? stars.indexOf(s) + 1 : 0; }

    var row = root.querySelector(".pr-stars");
    row.addEventListener("pointerover", function (e) { var n = starOf(e); if (n && e.pointerType !== "touch") show(n); });
    row.addEventListener("pointerdown", function (e) { var n = starOf(e); if (n) show(n); });
    row.addEventListener("pointerleave", function () { show(value()); });
    root.addEventListener("change", function () {
      var n = value();
      show(n);
      if (reduce.matches || !n || !head.animate) return;
      stars[n - 1].querySelector("svg").animate([{ scale: "1" }, { scale: "1.28" }, { scale: "1" }], { duration: 420, easing: spring });
      head.animate([{ translate: "0 0" }, { translate: "0 -6px", offset: 0.35 }, { translate: "0 0" }], { duration: 460, easing: "ease-out" });
    });
    show(value());
    drawMouth();
  }

  function init() { document.querySelectorAll(".peek-rating").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
