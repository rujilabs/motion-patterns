// Demo only: "Fold it again" folds the leaflet shut (inner flap first, then the outer one) and
// plays the opening once more. The opening itself is style.css, started by play.js.
(function () {
  var tri = document.getElementById("trifold");
  var btn = document.getElementById("again");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-inout").trim() || "ease-in-out";
  btn.addEventListener("click", function () {
    if (still.matches || !tri.animate) return;
    btn.disabled = true;
    var opts = { duration: 520, easing: ease, fill: "forwards" };
    var r = tri.animate([{ "--tri-r": "0deg" }, { "--tri-r": "180deg" }], opts);
    var l = tri.animate([{ "--tri-l": "0deg" }, { "--tri-l": "180deg" }], Object.assign({ delay: 300 }, opts));
    l.onfinish = function () {
      tri.classList.remove("go");
      r.cancel(); l.cancel();
      void tri.offsetWidth; // restart the opening
      setTimeout(function () { tri.classList.add("go"); btn.disabled = false; }, 350);
    };
  });
})();
