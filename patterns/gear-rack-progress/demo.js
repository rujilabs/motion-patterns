// Demo only: turns the bar's progress into minutes left. The bar itself needs no demo code.
(function () {
  var bar = document.querySelector(".gear-rack-progress");
  var left = document.getElementById("left");
  var MIN = 7, shown = "";
  bar.addEventListener("rackprogress", function (e) {
    var p = e.detail.progress;
    var rest = Math.ceil(MIN * (1 - p) - 0.05);
    var text = p > 0.985 ? "Finished" : p < 0.02 ? MIN + " min read" : rest + " min left";
    if (text !== shown) {
      shown = text;
      left.innerHTML = text.replace(/^(\d+ min)/, "<span class=\"num\">$1</span>").replace("Finished", "<span class=\"num\">Finished</span>");
    }
  });
})();
