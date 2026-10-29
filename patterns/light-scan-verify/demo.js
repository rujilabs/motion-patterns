// Demo only: the account-opening step around the scan. The scan itself is light-scan-verify.js.
(function () {
  var doc = document.getElementById("doc");
  var status = document.getElementById("status");
  var again = document.getElementById("again");
  var next = document.getElementById("next");
  function busy() {
    status.textContent = "Reading the front of your card.";
    next.disabled = true; again.disabled = true;
  }
  function done() {
    status.textContent = "All 5 checks passed. Your details are filled in on the next step.";
    next.disabled = false; again.disabled = false;
  }
  doc.addEventListener("scan", done);
  again.addEventListener("click", function () { busy(); doc.scan.run(); });
  next.addEventListener("click", function () { status.textContent = "Saved at 10:14 am. Next: a selfie to match the photo."; next.disabled = true; });
  if (doc.classList.contains("is-done")) done(); else busy();
})();
