/*
 * flying-button.js: for every .fly-btn submit button. On a valid submit the button's paper folds into a
 * paper plane (its clip path moves from a rectangle to a plane, the wing fold darkens), dips back a
 * touch as if thrown, then flies up and away. The button comes back as a Sent state and stays so until
 * the form is edited. It fires a "fly" event on the form at the start: send the data from there (fetch).
 * The native submit is cancelled only when this script runs; without it the form submits as usual.
 * Reduced motion: straight to Sent.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RECT = "polygon(0% 0%, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)";
  var PLANE = "polygon(2% 8%, 50% 32%, 100% 50%, 100% 50%, 26% 92%, 22% 56%)";
  function tf(x, y, r, sx, sy) { return "translate(" + x + "px," + y + "px) rotate(" + r + "deg) scale(" + sx + "," + sy + ")"; }

  function setup(btn) {
    var form = btn.form, paper = btn.querySelector(".fly-paper"), label = btn.querySelector(".fly-label");
    if (!form || !paper || btn._fly) return;
    btn._fly = true;
    var css = getComputedStyle(document.documentElement);
    var SPRING = css.getPropertyValue("--ease-spring").trim() || "ease-out";
    var EASE_IN = css.getPropertyValue("--ease-in").trim() || "ease-in";
    var EASE_OUT = css.getPropertyValue("--ease-out").trim() || "ease-out";
    var flying = false, anims = [];

    function clear() { anims.forEach(function (a) { a.cancel(); }); anims = []; }
    function sent() {
      clear();
      flying = false;
      btn.classList.add("is-sent");
      btn.setAttribute("aria-disabled", "true");
      if (reduce.matches) return;
      anims.push(paper.animate([{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 520, easing: SPRING }));
      var done = btn.querySelector(".fly-done");
      if (done) anims.push(done.animate([{ transform: "scale(.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 480, delay: 90, easing: SPRING, fill: "backwards" }));
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (flying || btn.classList.contains("is-sent")) return;
      form.dispatchEvent(new CustomEvent("fly", { bubbles: true }));
      if (reduce.matches || !paper.animate) { sent(); return; }
      flying = true;
      // the plane flies up and to the right, a distance set by the button's size
      var w = btn.offsetWidth, dx = Math.round(w * 1.6), dy = -Math.round(w * 1.15);
      anims.push(label.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px) scale(.9)" }], { duration: 180, easing: EASE_OUT, fill: "forwards" }));
      var flight = paper.animate([
        { clipPath: RECT, transform: tf(0, 0, 0, 1, 1), opacity: 1, easing: EASE_OUT },
        { clipPath: RECT, transform: tf(0, 0, 0, 0.94, 0.94), opacity: 1, offset: 0.14, easing: EASE_OUT },
        { clipPath: PLANE, transform: tf(0, 0, -6, 0.62, 0.86), opacity: 1, offset: 0.4, easing: EASE_OUT },
        { clipPath: PLANE, transform: tf(-10, 6, 5, 0.62, 0.86), opacity: 1, offset: 0.5, easing: EASE_IN },
        { clipPath: PLANE, transform: tf(dx, dy, -26, 0.2, 0.28), opacity: 0 }
      ], { duration: 1150 });
      flight.id = "flying-button";
      anims.push(flight);
      // the wing fold darkens as it folds (browsers without pseudo-element animation skip it)
      try { anims.push(paper.animate([{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1 }], { duration: 1150, pseudoElement: "::after" })); } catch (err) {}
      flight.onfinish = sent;
    });
    form.addEventListener("input", function () {
      if (!btn.classList.contains("is-sent")) return;
      clear();
      btn.classList.remove("is-sent");
      btn.removeAttribute("aria-disabled");
    });
  }
  function init() { document.querySelectorAll(".fly-btn").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
