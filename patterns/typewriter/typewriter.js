/*
 * typewriter.js: splits the text of each [data-type] element into one span per character and
 * gives each its own start time (--t) and how long it stays the newest character (--d).
 * The CSS does the rest with animations, so the whole run shows on the page's animation timeline.
 *
 * [data-type-group] types its [data-type] children one after another, as one run.
 * A [data-type] outside a group types on its own.
 * data-type-speed: ms per character (default 40). data-type-delay: ms before the first character.
 * Commas wait a little longer and full stops longer still, the way a person types.
 *
 * Screen readers get the whole text at once from a hidden copy; the typed copy is aria-hidden.
 * Under reduced motion nothing is split: the text is simply there.
 */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pauseAfter(ch) {
    if (ch === "," || ch === ";" || ch === ":") return 3;
    if (ch === "." || ch === "!" || ch === "?") return 6;
    return 0;
  }

  // types one element starting at time t (ms); returns the time after its last character
  function split(el, t, speed, isLast) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    var sr = document.createElement("span");
    sr.className = "type-sr";
    sr.textContent = text;
    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    var chars = [];
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "type-ch";
      span.textContent = text[i];
      span.style.setProperty("--t", t + "ms");
      var step = speed * (1 + pauseAfter(text[i]));
      span.style.setProperty("--d", step + "ms");
      t += step;
      chars.push(span);
      shown.appendChild(span);
    }
    if (isLast && chars.length) chars[chars.length - 1].classList.add("type-end");
    el.textContent = "";
    el.appendChild(sr);
    el.appendChild(shown);
    el.classList.add("type-ready");
    return t;
  }

  function run(group) {
    var lines = group.hasAttribute("data-type") ? [group] : Array.prototype.slice.call(group.querySelectorAll("[data-type]"));
    if (reduce) { lines.forEach(function (el) { el.classList.add("type-ready"); }); return; }
    var speed = parseFloat(group.getAttribute("data-type-speed")) || 40;
    var t = parseFloat(group.getAttribute("data-type-delay")) || 0;
    lines.forEach(function (el, n) {
      // each new line starts after a short breath, like moving the cursor down
      if (n > 0) t += speed * 4;
      t = split(el, t, speed, n === lines.length - 1);
    });
  }

  function start() {
    document.querySelectorAll("[data-type-group]").forEach(run);
    document.querySelectorAll("[data-type]").forEach(function (el) {
      if (!el.closest("[data-type-group]")) run(el);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
