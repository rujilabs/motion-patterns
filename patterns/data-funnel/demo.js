// Demo only: switches between two quarters. funnel.update() rereads the numbers and plays the fill again.
(function () {
  var el = document.querySelector(".funnel");
  var stages = el.querySelectorAll(".fn-stage");
  var NAMES = ["enquiry to survey", "survey to quotation", "quotation to contract"];
  var Q = {
    q2: { v: [1047, 534, 368, 121], value: "Average 5.8 kWp system at RM 22,900" },
    q3: { v: [1284, 612, 437, 163], value: "Average 6.1 kWp system at RM 23,800" }
  };
  var buttons = document.querySelectorAll(".qtr button");
  function show(k) {
    var d = Q[k];
    stages.forEach(function (s, i) { s.dataset.value = d.v[i]; });
    el.funnel.update();
    document.getElementById("rate").textContent = (d.v[3] / d.v[0] * 100).toFixed(1) + "%";
    var worst = 0, rate = 0;
    for (var i = 1; i < 4; i++) { var r = 1 - d.v[i] / d.v[i - 1]; if (r > rate) { rate = r; worst = i - 1; } }
    document.getElementById("leak").textContent = NAMES[worst];
    document.getElementById("value").textContent = d.value;
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.q === k ? "true" : "false");
      b.textContent = b.dataset.q === k ? b.dataset.q.toUpperCase() + " 2026" : b.dataset.q.toUpperCase();
    });
  }
  buttons.forEach(function (b) { b.addEventListener("click", function () { if (b.getAttribute("aria-pressed") !== "true") show(b.dataset.q); }); });
})();
