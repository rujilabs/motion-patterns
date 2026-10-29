// Demo only: the stock count follows the crates as they land, and the button books in the waiting delivery.
(function () {
  var bay = document.getElementById("bay");
  var count = document.getElementById("count");
  var btn = document.getElementById("book");
  var grn2 = document.getElementById("grn2");
  bay.addEventListener("cratelanded", function (e) { count.textContent = e.detail.count; });
  btn.addEventListener("click", function () {
    if (!bay.crates) return;
    btn.disabled = true;
    bay.crates.add(6);
    grn2.classList.remove("is-waiting");
    grn2.querySelector(".mute").textContent = "6 crates, palm sugar 20 × 1 kg · booked in 11:06 am";
    btn.textContent = "Next truck Thu, 7:30 am";
  });
})();
