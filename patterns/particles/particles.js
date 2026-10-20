/*
 * particles.js: fills each [data-particles] element with a field of small dots behind its content.
 * The value is how many (default 24). The dots are plain spans moved by CSS animations, so they show
 * on the page's animation timeline and stop with animation-play-state like anything else.
 *
 * Every dot gets its own place, size, speed, sway and strength, from a seeded random sequence:
 * the same data-seed draws the same field every time, so a screenshot or a poster is repeatable.
 * Each starts part-way through its run (a negative delay), so the field is full from the first frame.
 *
 * The field pauses while it is off screen. Under reduced motion the dots are drawn but stay still.
 */
(function () {
  document.documentElement.classList.add("js");
  var still = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var fields = [];

  function sequence(seed) {
    var s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function setup(host) {
    var count = parseInt(host.getAttribute("data-particles"), 10) || 24;
    var rand = sequence(parseInt(host.getAttribute("data-seed"), 10) || 7);
    var field = document.createElement("div");
    field.className = "particles-field";
    field.setAttribute("aria-hidden", "true");
    for (var i = 0; i < count; i++) {
      var dot = document.createElement("span");
      var dur = 9 + rand() * 9;
      dot.className = "particle";
      dot.style.setProperty("--x", (rand() * 100).toFixed(2) + "%");
      dot.style.setProperty("--y", (rand() * 100).toFixed(2) + "%");
      dot.style.setProperty("--s", (2 + rand() * 4).toFixed(1) + "px");
      dot.style.setProperty("--d", dur.toFixed(2) + "s");
      dot.style.setProperty("--delay", (-rand() * dur).toFixed(2) + "s");
      dot.style.setProperty("--dx", ((rand() - .5) * 40).toFixed(1) + "px");
      dot.style.setProperty("--dy", ((rand() - .5) * 30).toFixed(1) + "px");
      dot.style.setProperty("--o", (.25 + rand() * .5).toFixed(2));
      field.appendChild(dot);
    }
    host.insertBefore(field, host.firstChild);
    fields.push(field);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { field.classList.toggle("particles-off", !e.isIntersecting); });
      }).observe(host);
    }
  }

  function applyStill() {
    var on = !!(still && still.matches);
    fields.forEach(function (f) { f.classList.toggle("particles-still", on); });
  }

  function start() {
    document.querySelectorAll("[data-particles]").forEach(setup);
    applyStill();
    if (still && still.addEventListener) still.addEventListener("change", applyStill);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
