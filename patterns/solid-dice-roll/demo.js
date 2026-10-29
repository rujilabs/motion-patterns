// Demo only: the button throws the die, and the finalist with the rolled number is marked the winner.
(function () {
  var tray = document.getElementById("tray");
  var btn = document.getElementById("roll");
  var result = document.getElementById("result");
  var rows = document.querySelectorAll("#finalists li");
  btn.addEventListener("click", function () {
    if (!tray.dice || tray.dice.busy()) return;
    rows.forEach(function (r) { r.classList.remove("is-winner"); });
    btn.disabled = true;
    result.textContent = "Rolling...";
    tray.dice.roll().then(function (v) {
      if (!v) return;
      var row = document.querySelector('#finalists li[data-n="' + v + '"]');
      row.classList.add("is-winner");
      result.textContent = "Rolled a " + v + ": " + row.querySelector(".who").textContent + " wins 365 cups.";
      btn.disabled = false;
      btn.textContent = "Roll again";
    });
  });
})();
