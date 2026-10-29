// Demo only: ties the export text to the gears. GearProcessing.run does the turning.
(function () {
  var svg = document.querySelector(".gear-processing");
  var steps = document.querySelectorAll("#steps li");
  var bar = document.getElementById("bar");
  var status = document.getElementById("status");
  var size = document.getElementById("size");
  var again = document.getElementById("again");
  var ROWS = 148, KB = 41.2;

  function frame(p) {
    var rows = Math.round(p * ROWS);
    bar.style.transform = "scaleX(" + p + ")";
    var at = p < 0.18 ? 0 : p < 0.74 ? 1 : 2;
    steps.forEach(function (li, i) {
      li.className = p >= 1 || i < at ? "done" : i === at ? "now" : "";
    });
    size.textContent = (p < 0.74 ? 0 : KB * (p - 0.74) / 0.26).toFixed(1) + " KB";
    if (p < 1) status.innerHTML = at === 0 ? "Reading staff records" : at === 1 ? "Working out row <span class=\"num\">" + rows + "</span> of " + ROWS : "Writing the file";
  }
  function done() {
    status.innerHTML = "<strong>Ready.</strong> <span class=\"num\">148</span> rows, <span class=\"num\">41.2 KB</span>";
    again.disabled = false;
    again.textContent = "Export again";
  }
  function go() {
    again.disabled = true;
    again.textContent = "Exporting";
    frame(0);
    GearProcessing.run(svg, { teeth: 48, duration: 3600, onFrame: frame, onDone: done });
  }
  again.addEventListener("click", go);

  // the first export starts when the box scrolls into view
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); go(); } }, { threshold: 0.4 });
    io.observe(svg);
  } else go();
})();
