/*
 * follower.js: a dot that trails a mouse pointer inside every [data-follow] area. It grows into a
 * ring over links, buttons and anything marked [data-follow-grow].
 * Off on touch and pen (no hovering pointer), and off under reduced motion.
 */
(function () {
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var GROW = "a, button, [data-follow-grow]";

  function setup(area) {
    var dot = area.querySelector(".follow-dot");
    if (!dot) {
      dot = document.createElement("span");
      dot.className = "follow-dot";
      dot.setAttribute("aria-hidden", "true");
      area.appendChild(dot);
    }

    function move(e) {
      if (e.pointerType !== "mouse" || !fine.matches || still.matches) { hide(); return; }
      dot.style.setProperty("--follow-x", e.clientX + "px");
      dot.style.setProperty("--follow-y", e.clientY + "px");
      if (!dot.classList.contains("is-on")) {
        // first move: place it with no transition, then let it trail from there
        dot.classList.add("is-jump", "is-on");
        dot.getBoundingClientRect();
        requestAnimationFrame(function () { dot.classList.remove("is-jump"); });
      }
      var hit = e.target.closest && e.target.closest(GROW);
      dot.classList.toggle("is-over", !!(hit && area.contains(hit)));
    }

    function hide() { dot.classList.remove("is-on", "is-over", "is-down"); }

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", hide);
    area.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse") dot.classList.add("is-down"); });
    area.addEventListener("pointerup", function () { dot.classList.remove("is-down"); });
    document.addEventListener("visibilitychange", hide);
    still.addEventListener("change", hide);
  }

  function start() { document.querySelectorAll("[data-follow]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
