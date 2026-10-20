/* Demo only: the ticket total rolls with the same rollTo as the steppers. */
(function () {
  function start() {
    var total = document.getElementById("total");
    var price = { adult: 45, child: 25 };
    var last = 0;
    function sum() {
      var t = 0;
      document.querySelectorAll("[data-stepper]").forEach(function (s) {
        t += price[s.dataset.kind] * parseFloat(s.querySelector(".roll").dataset.shown || 0);
      });
      return t;
    }
    last = sum();
    window.rollTo(total, last, "up");
    document.addEventListener("stepper:change", function () {
      var t = sum();
      window.rollTo(total, t, t > last ? "up" : "down");
      last = t;
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
