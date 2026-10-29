/*
 * data-bars-3d.js: sets each bar's height from its number. Markup:
 *
 *   <figure class="bars3d" data-play data-max="60"> ... <li class="b3" data-value="38.6"> ...
 *
 * --v = value / data-max and --i = the bar's place (for the stagger). play.js adds .go when the chart
 * is in view and the CSS grows the bars. To show other numbers, call el.bars3d.set([41.3, ...]): each
 * bar eases from the height it has to the new one. Without this script the numbers still show as text.
 */
(function () {
  function setup(el) {
    var bars = [].slice.call(el.querySelectorAll(".b3[data-value]"));
    function set(values) {
      var max = +el.dataset.max || Math.max.apply(null, values);
      bars.forEach(function (b, i) {
        if (values[i] === undefined) return;
        b.dataset.value = values[i];
        b.style.setProperty("--v", Math.min(1, Math.max(0, values[i] / max)).toFixed(4));
        b.style.setProperty("--i", i);
      });
    }
    set(bars.map(function (b) { return +b.dataset.value; }));
    el.bars3d = { set: set };
  }
  function init() { document.querySelectorAll(".bars3d").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
