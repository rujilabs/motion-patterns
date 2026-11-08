/* Demo only: the save count and the status line follow the button. */
document.querySelectorAll(".hbd-save").forEach(function (btn) {
  var count = document.querySelector("[data-hbd-count]");
  var status = document.querySelector("[data-hbd-status]");
  btn.addEventListener("change", function () {
    var on = btn.getAttribute("aria-pressed") === "true";
    count.textContent = on ? "1,285" : "1,284";
    status.textContent = on ? "Saved to your Raya 2027 list" : "Removed from your Raya 2027 list";
  });
});
