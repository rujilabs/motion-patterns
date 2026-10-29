// Demo only: counts the ticked tasks. Each checkbox is a plain input; the cube is all CSS plus cube.js.
(function () {
  var boxes = document.querySelectorAll(".tasks input");
  var done = document.getElementById("done");
  var bar = document.getElementById("bar");
  var tail = document.getElementById("tail");
  function count() {
    var n = 0;
    boxes.forEach(function (b) { if (b.checked) n++; });
    var all = n === boxes.length;
    done.textContent = all ? "All done." : n + " of " + boxes.length;
    tail.textContent = all ? "Box it up for 4:30 pm." : "done";
    bar.style.transform = "scaleX(" + (n / boxes.length).toFixed(3) + ")";
  }
  boxes.forEach(function (b) { b.addEventListener("change", count); });
  count();
})();
