// Demo only: checks the PIN against a made-up one and counts tries. The keypad is tile-keypad-pin.js.
(function () {
  var pad = document.getElementById("pad");
  var again = document.getElementById("again");
  var keys = pad.querySelectorAll(".pin-key");
  var tries = 3;
  function lock(on) { keys.forEach(function (k) { k.disabled = on; }); again.hidden = !on; }
  pad.addEventListener("pinentry", function (e) {
    // a real app sends the PIN to the bank here; the demo waits as if it did
    setTimeout(function () {
      if (e.detail.pin === "240619") {
        pad.pinResult(true, "PIN accepted. RM 1,250.00 is on its way to Tan Mei Ling.");
        lock(true);
        again.focus();
        return;
      }
      tries--;
      if (tries > 0) {
        pad.pinResult(false, "Wrong PIN. " + tries + (tries === 1 ? " try" : " tries") + " left.");
      } else {
        pad.pinResult(false, "Wrong PIN three times. Transfers are locked for 30 minutes.");
        lock(true);
        again.focus();
      }
    }, 420);
  });
  again.addEventListener("click", function () {
    tries = 3;
    pad.pinReset();
    lock(false);
    document.getElementById("pin-status").textContent = "3 tries left";
    keys[0].focus();
  });
})();
