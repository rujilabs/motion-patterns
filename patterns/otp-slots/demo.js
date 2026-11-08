// Demo only: a pretend bank check. Any 6 digits ending in 7 count as right. The control itself is otp.js.
(function () {
  var otp = document.getElementById("otp");
  var status = document.getElementById("tac-status");
  var again = document.getElementById("again");
  var left = 3;
  otp.addEventListener("complete", function (e) {
    status.textContent = "Checking the code.";
    setTimeout(function () {
      if (/7$/.test(e.detail.value)) {
        otp.accept("Code accepted. RM 1,250.00 is on its way to Hafiz Rosli, reference SM 0421 7783.");
        again.hidden = false;
        return;
      }
      left = Math.max(0, left - 1);
      otp.reject(left ? "That code is wrong. " + left + (left === 1 ? " try" : " tries") + " left." :
        "That code is wrong. A real bank would lock this for 30 minutes now; the demo lets you keep going.");
    }, 420);
  });
  again.addEventListener("click", function () {
    left = 3;
    again.hidden = true;
    otp.reset();
    document.getElementById("tac").focus();
  });
})();
