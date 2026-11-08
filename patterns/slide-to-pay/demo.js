// Demo only: what the bill screen does once the payment goes through. The control itself is slide.js.
(function () {
  var pay = document.getElementById("pay");
  var status = document.getElementById("pay-status");
  var help = document.getElementById("pay-help");
  var again = document.getElementById("again");
  var helpText = help.textContent;
  var receipt = 5521;
  pay.addEventListener("confirm", function () {
    status.textContent = "Paid at 8:48 pm. Receipt BK-" + receipt + " 0937. Show this screen at the counter.";
    help.textContent = "Balance left: RM 127.35.";
    again.hidden = false;
    receipt += 13;
  });
  again.addEventListener("click", function () {
    help.textContent = helpText;
    again.hidden = true;
    pay.reset();
    pay.focus();
  });
})();
