// Demo only: counts the switches that are on and says when the change was saved.
(function () {
  var boxes = document.querySelectorAll(".rows input");
  var count = document.getElementById("count");
  var saved = document.getElementById("saved");
  var minute = 32;
  boxes.forEach(function (b) {
    b.addEventListener("change", function () {
      var on = 0;
      boxes.forEach(function (x) { if (x.checked) on++; });
      count.textContent = on + " of " + boxes.length;
      var title = document.getElementById(b.id + "-t").textContent;
      saved.textContent = title + (b.checked ? " on" : " off") + ". Saved 10:" + minute + " am.";
    });
  });
})();
