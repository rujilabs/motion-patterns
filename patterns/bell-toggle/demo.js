// Demo only: counts the alerts that are on and says what changed.
(function () {
  var boxes = document.querySelectorAll(".prayers input");
  var status = document.getElementById("status");
  boxes.forEach(function (b) {
    b.addEventListener("change", function () {
      var on = 0;
      boxes.forEach(function (x) { if (x.checked) on++; });
      var name = document.getElementById(b.id + "-n").firstChild.textContent.trim();
      status.textContent = name + " alert " + (b.checked ? "on" : "off") + ". " + on + " of " + boxes.length + " alerts on.";
    });
  });
})();
