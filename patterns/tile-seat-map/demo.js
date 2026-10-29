// Demo only: totals the picked seats. The seat map itself is tile-seat-map.js.
(function () {
  var map = document.getElementById("map");
  var picked = document.getElementById("picked");
  var fare = document.getElementById("fare");
  var pay = document.getElementById("pay");
  var left = document.getElementById("left");
  var free = map.querySelectorAll('.seat[aria-pressed]').length;
  function rm(n) { return "RM " + n.toFixed(2); }
  map.addEventListener("seatchange", function (e) {
    var seats = e.detail.seats;
    var total = 0;
    seats.forEach(function (s) { total += /^[GH]/.test(s) ? 21 : 16; });
    left.textContent = free - seats.length;
    if (!seats.length) {
      picked.textContent = "Pick up to 6 seats";
      fare.textContent = "Standard RM 16.00, recliner RM 21.00";
      pay.disabled = true;
      pay.textContent = "Continue";
      return;
    }
    picked.textContent = seats.length + (seats.length === 1 ? " seat: " : " seats: ") + seats.join(", ");
    fare.textContent = "Tickets " + rm(total) + ", booking fee " + rm(seats.length * 1.5);
    pay.disabled = false;
    pay.textContent = "Pay " + rm(total + seats.length * 1.5);
  });
})();
