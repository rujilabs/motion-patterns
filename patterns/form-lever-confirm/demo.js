// Demo only: what the bank screen does when the lever latches. The lever itself is lever.js.
(function () {
  var lever = document.getElementById("lever");
  var status = document.getElementById("lever-status");
  var again = document.getElementById("again");
  var help = document.getElementById("lever-help");
  var ref = 4471;
  lever.addEventListener("confirm", function () {
    status.textContent = "Sent at 3:42 pm. Reference CDN 2910 " + ref + ".";
    help.textContent = "RM 12,480.00 is on its way to Lim Bina Kabinet Sdn Bhd.";
    again.hidden = false;
    ref += 37;
  });
  again.addEventListener("click", function () {
    help.textContent = "Over RM 10,000, so pull the handle all the way down to send. Or hold Space or Enter.";
    again.hidden = true;
    lever.reset();
    lever.focus();
  });
})();
