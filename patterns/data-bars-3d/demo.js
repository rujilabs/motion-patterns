// Demo only: switches the chart between two financial years. bars3d.set() does the growing.
(function () {
  var chart = document.querySelector(".bars3d");
  var YEARS = {
    2024: { q: [34.1, 37.9, 33.2, 47.5], note: "Up 6.4% on FY2023. The new Kuala Perlis jetty opened in March and took Q2 past Q1." },
    2025: { q: [38.6, 41.3, 36.8, 52.9], note: "Up 11.1% on FY2024. Q4 carried the year: the December school holidays and the Langkawi year-end crowd." }
  };
  var buttons = document.querySelectorAll(".year button");
  var vals = document.querySelectorAll(".b3-val");
  function show(y) {
    var d = YEARS[y];
    chart.bars3d.set(d.q);
    vals.forEach(function (v, i) { v.childNodes[1].nodeValue = d.q[i].toFixed(1); });
    var total = d.q.reduce(function (s, v) { return s + v; }, 0);
    document.getElementById("total").textContent = "RM " + total.toFixed(1) + "m";
    document.getElementById("note").textContent = d.note;
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.year === y ? "true" : "false"); });
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () { if (b.getAttribute("aria-pressed") !== "true") show(b.dataset.year); });
  });
})();
