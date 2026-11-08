/*
 * focus-word.js: steps a focus frame across the .fw-w words of each .fw line.
 *   <p class="fw" tabindex="0"><span class="fw-w">Sharp</span> <span class="fw-w">photos</span> ...
 *     <span class="fw-frame" aria-hidden="true"></span></p>
 *   data-step   time on each word in ms (default 1800)
 * Pointing at a word moves the frame there and holds it; so does Left or Right while the line has
 * focus. A checkbox inside .fw-pause in the same .fw-group pauses the loop. Reduced motion: no loop.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(line) {
    if (line._fw) return;
    line._fw = true;
    var words = Array.prototype.slice.call(line.querySelectorAll(".fw-w"));
    var frame = line.querySelector(".fw-frame");
    var group = line.closest(".fw-group") || document;
    var pause = group.querySelector(".fw-pause input");
    var step = +line.dataset.step || 1800;
    var at = 0, held = false, timer = 0;
    if (!words.length || !frame) return;
    line.classList.add("fw-on");

    function place() {
      var w = words[at], pad = 2 * (parseFloat(getComputedStyle(line).getPropertyValue("--fw-pad")) || 0);
      frame.style.translate = w.offsetLeft + "px " + w.offsetTop + "px";
      frame.style.width = w.offsetWidth + pad + "px";
      frame.style.height = w.offsetHeight + pad + "px";
      words.forEach(function (o, i) { o.classList.toggle("is-focus", i === at); });
    }
    function go(i) { at = (i + words.length) % words.length; place(); }
    function tick() { if (!held && !(pause && pause.checked)) go(at + 1); }
    function run() {
      clearInterval(timer);
      timer = reduce.matches ? 0 : setInterval(tick, step);
    }

    words.forEach(function (w, i) {
      w.addEventListener("pointerenter", function () { held = true; go(i); });
    });
    line.addEventListener("pointerleave", function () { held = line.matches(":focus"); run(); });
    line.addEventListener("focus", function () { held = true; });
    line.addEventListener("blur", function () { held = false; run(); });
    line.addEventListener("keydown", function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === "Home") d = -at;
      if (e.key === "End") d = words.length - 1 - at;
      if (d === undefined) return;
      e.preventDefault();
      go(at + d);
    });
    window.addEventListener("resize", place);
    if (document.fonts) document.fonts.ready.then(place);
    if (reduce.addEventListener) reduce.addEventListener("change", run);
    place();
    run();
  }

  function init() { document.querySelectorAll(".fw").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
