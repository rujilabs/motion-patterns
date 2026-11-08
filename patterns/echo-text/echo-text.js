/*
 * echo-text.js: gives every [data-echo] element that many outlined copies behind its text
 * (default 4), then rings them out once on load and again on pointer enter or keyboard focus.
 * The copies are aria-hidden; the real text is untouched. Under reduced motion the trail
 * still shows, it just never moves.
 */
(function () {
  function setup(el) {
    var n = Math.max(1, Math.min(8, parseInt(el.getAttribute("data-echo"), 10) || 4));
    var text = el.textContent;
    el.style.setProperty("--echo-n", n);
    for (var i = n; i >= 1; i--) {
      var c = document.createElement("span");
      c.className = "echo-copy";
      c.setAttribute("aria-hidden", "true");
      c.textContent = text;
      c.style.setProperty("--echo-i", i);
      el.appendChild(c);
    }
    function ring() {
      el.classList.remove("go");
      void el.offsetWidth; // restart the animation
      el.classList.add("go");
    }
    el.addEventListener("pointerenter", ring);
    el.addEventListener("focus", function () { if (el.matches(":focus-visible")) ring(); });
    ring();
  }
  function start() { document.querySelectorAll("[data-echo]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
