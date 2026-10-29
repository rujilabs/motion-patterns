// Demo only: the status reads "Out for delivery" until the box touches down, then "Delivered".
(function () {
  var parcel = document.getElementById("parcel");
  var status = document.getElementById("status");
  var note = document.getElementById("status-note");
  var last = document.getElementById("step-last");
  var btn = document.getElementById("replay");
  function waiting() {
    status.textContent = "Arriving now";
    note.textContent = "Your rider Faris is at the gate.";
    last.classList.remove("done");
  }
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) waiting();
  parcel.addEventListener("parceldelivered", function () {
    status.textContent = "Delivered";
    note.textContent = "Handed to you at the door, Fri 1 Nov, 2:17 pm.";
    last.classList.add("done");
  });
  btn.addEventListener("click", function () {
    if (!parcel.parcel) return;
    waiting();
    parcel.parcel.open();
  });
})();
