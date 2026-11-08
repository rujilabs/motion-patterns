// Demo only: picking a desk. The light is grid-cell-glow.js; this file listens for its "gg-pick" event.
(function () {
  var plan = document.querySelector(".ggd-plan");
  var pick = document.getElementById("pick");
  var ROWS = { A: "window row, facing Jalan Kerinchi", B: "second row, next to the window desks", C: "quiet row, by the meeting room", D: "back row, near the lockers" };
  plan.addEventListener("gg-pick", function (e) {
    var b = e.detail.cell, id = b.getAttribute("data-desk");
    if (b.getAttribute("aria-disabled") === "true") { pick.textContent = "Desk " + id + " is already booked for Wednesday."; return; }
    plan.querySelectorAll('[aria-pressed="true"]').forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
    b.setAttribute("aria-pressed", "true");
    var price = id.charAt(0) === "A" ? "RM 42.00" : "RM 36.50";
    pick.textContent = "Desk " + id + ", " + ROWS[id.charAt(0)] + ". " + price + " for Wednesday 11 November, 8:30 am to 7:00 pm.";
  });
})();
