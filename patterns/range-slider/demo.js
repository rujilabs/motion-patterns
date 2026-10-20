/* Demo only: a made-up count of stays that match both sliders. */
(function () {
  function start() {
    var price = document.getElementById("price");
    var dist = document.getElementById("dist");
    var out = document.getElementById("matches");
    function count() {
      var p = (parseFloat(price.value) - 60) / 340;
      var d = parseFloat(dist.value) / 10;
      var n = Math.round(4 + 150 * Math.pow(p, .8) * Math.pow(d, .6));
      out.textContent = n + (n === 1 ? " stay" : " stays");
    }
    price.addEventListener("input", count);
    dist.addEventListener("input", count);
    count();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
