// Demo only: what the wallet screen does when the hold completes. The control itself is hold.js.
(function () {
  var hold = document.getElementById("hold");
  var card = document.getElementById("card");
  var status = document.getElementById("hold-status");
  var help = document.getElementById("hold-help");
  var again = document.getElementById("again");
  var helpText = help.textContent;
  hold.addEventListener("confirm", function () {
    card.classList.add("is-gone");
    status.textContent = "Visa ending 4417 removed at 9:14 pm. Auto top-up is off.";
    help.textContent = "Top-ups now come from your Bank Seri Meranti account ending 9052.";
    again.hidden = false;
  });
  again.addEventListener("click", function () {
    card.classList.remove("is-gone");
    help.textContent = helpText;
    again.hidden = true;
    hold.reset();
    hold.focus();
  });
})();
