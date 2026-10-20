/*
 * ripple.js: on every .ripple element, a press adds a .ripple-wave centred on the press point,
 * big enough to cover the farthest corner. Keyboard clicks start it from the centre.
 * Under reduced motion no wave is added.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var lastPress = 0;

  function wave(el, x, y) {
    if (still.matches) return;
    var r = el.getBoundingClientRect();
    // distance from the press point to the farthest corner, times two for the diameter
    var dx = Math.max(x, r.width - x);
    var dy = Math.max(y, r.height - y);
    var d = Math.ceil(Math.sqrt(dx * dx + dy * dy) * 2);
    var w = document.createElement("span");
    w.className = "ripple-wave";
    w.setAttribute("aria-hidden", "true");
    w.style.setProperty("--ripple-x", x + "px");
    w.style.setProperty("--ripple-y", y + "px");
    w.style.setProperty("--ripple-d", d + "px");
    el.appendChild(w);
    // remove after the longest of its animations (the fade)
    w.addEventListener("animationend", function (e) {
      if (e.animationName === "ripple-fade") w.remove();
    });
  }

  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest && e.target.closest(".ripple");
    if (!el || e.button > 0 || el.disabled) return;
    lastPress = e.timeStamp;
    var r = el.getBoundingClientRect();
    wave(el, e.clientX - r.left, e.clientY - r.top);
  });

  document.addEventListener("pointerup", function (e) { lastPress = e.timeStamp; });

  // keyboard activation fires click with detail 0 and no pointerdown before it.
  // A label passes its click on to its input with detail 0 too: skip that one, the press already rippled.
  document.addEventListener("click", function (e) {
    if (e.detail !== 0 || e.timeStamp - lastPress < 800) return;
    var el = e.target.closest && e.target.closest(".ripple");
    if (!el) return;
    var r = el.getBoundingClientRect();
    wave(el, r.width / 2, r.height / 2);
  });
})();
