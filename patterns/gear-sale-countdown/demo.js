// Demo only: a simulated clock. The sale ends at 9:00:00 pm and the page opens at 8:44:51 pm.
(function () {
  var box = document.querySelector(".gear-sale-countdown");
  var run = document.getElementById("run");
  var skip = document.getElementById("skip");
  var now = document.getElementById("now");
  var END = 21 * 3600, START = 909;

  function clock(left) {
    var t = END - left, h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60;
    now.textContent = (h % 12 || 12) + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + (h < 12 ? " am" : " pm");
  }
  box.addEventListener("gsctick", function (e) { clock(e.detail.left); });
  box.addEventListener("gscend", function () {
    box.querySelector(".buy").textContent = "Sale ended at 9:00 pm";
    skip.textContent = "Start again at 8:44:51 pm";
  });
  run.addEventListener("change", function () { if (run.checked) box.gscPlay(); else box.gscPause(); });
  skip.addEventListener("click", function () {
    var ended = box.classList.contains("is-ended");
    box.gscPause();
    box.gscSet(ended ? START : 10);
    clock(ended ? START : 10);
    box.querySelector(".buy").textContent = "Buy now";
    skip.textContent = "Skip to 8:59:50 pm";
    if (run.checked) box.gscPlay();
  });
  if (run.checked) box.gscPlay();
})();
