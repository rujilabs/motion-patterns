/* Bars scale to the largest value so the row always fits. */
(function () {
  var bars = [].slice.call(document.querySelectorAll(".cb-bar"));
  var max = Math.max.apply(null, bars.map(function (b) { return +b.dataset.value; }));
  bars.forEach(function (b, i) {
    b.style.setProperty("--h", Math.round(+b.dataset.value / max * Math.min(150, document.querySelector(".frame").clientHeight * .3)) + "px");
    b.style.setProperty("--i", i);
  });
})();
/* Restarts every CSS animation in the demo: hiding the frame for one layout drops them, showing it starts them again. */
document.querySelectorAll("[data-replay]").forEach(function (b) {
  b.addEventListener("click", function () {
    var f = b.closest(".frame");
    f.style.display = "none";
    void f.offsetWidth;
    f.style.display = "";
  });
});
