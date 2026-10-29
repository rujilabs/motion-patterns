/*
 * data-funnel.js: sets the widths and writes the drop-off for a funnel. Markup:
 *
 *   <figure class="funnel" data-play> <ol> <li class="fn-stage" data-value="1284"> ...
 *
 * Each stage gets --w (its share of the first stage), --from (the previous stage's width over its
 * own, where its bar starts) and --i (its place, for the delay). Any .fn-drop inside a stage gets the
 * number lost since the stage before and that as a percentage. play.js adds .go and the CSS plays.
 * el.funnel.update() rereads the data-value attributes and plays the fill again.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function n(v) { return v.toLocaleString("en-MY"); }
  function setup(el) {
    function update(replay) {
      var stages = [].slice.call(el.querySelectorAll(".fn-stage[data-value]"));
      var top = +stages[0].dataset.value || 1;
      stages.forEach(function (s, i) {
        var v = +s.dataset.value;
        var prev = i ? +stages[i - 1].dataset.value : 0;
        s.style.setProperty("--w", (v / top).toFixed(4));
        s.style.setProperty("--from", i ? (prev / Math.max(v, 1)).toFixed(4) : "0");
        s.style.setProperty("--i", i);
        var count = s.querySelector(".fn-count");
        if (count) count.textContent = n(v);
        var drop = s.querySelector(".fn-drop");
        if (drop && i) {
          var lost = prev - v;
          drop.querySelector(".fn-lost-n").textContent = n(lost);
          drop.querySelector(".fn-lost-p").textContent = (lost / prev * 100).toFixed(1) + "%";
        }
      });
      if (replay && el.classList.contains("go") && !reduce.matches) {
        el.classList.remove("go");
        void el.offsetWidth; // restart the CSS animations
        el.classList.add("go");
      }
    }
    update(false);
    el.funnel = { update: function () { update(true); } };
  }
  function init() { document.querySelectorAll(".funnel").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
