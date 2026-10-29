// Demo only: a bakery checkout. The bank is simulated: it answers after 1.6 s with the choice in the radio group.
(function () {
  var btn = document.getElementById("pay"), note = document.getElementById("note"), again = document.getElementById("again");
  var orderNo = 20417;
  btn.addEventListener("click", function () {
    var ok = document.querySelector("input[name=bank]:checked").value === "ok";
    note.className = "note";
    note.textContent = "Waiting for your bank.";
    var bank = new Promise(function (yes, no) { setTimeout(ok ? yes : no, 1600); });
    PayMorph.run(btn, bank).then(function (paid) { if (paid) again.hidden = false; });
  });
  btn.addEventListener("pay-state", function (e) {
    if (e.detail.state === "done") {
      note.className = "note ok";
      note.textContent = "Paid. Order KLD-" + orderNo + " is confirmed, receipt sent to 012-388 5106.";
    } else if (e.detail.state === "fail") {
      note.className = "note no";
      note.textContent = "Your bank declined card ending 4417. No money was taken.";
    }
  });
  again.addEventListener("click", function () {
    again.hidden = true;
    orderNo++;
    note.className = "note";
    note.textContent = "You will not be charged until the bakery confirms the slot.";
    PayMorph.reset(btn).then(function () { btn.focus(); });
  });
})();
