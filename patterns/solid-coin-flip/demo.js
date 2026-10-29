// Demo only: each scan sets the amount on the coin, tosses it, and adds the points when it lands.
(function () {
  var tray = document.getElementById("tray");
  var amount = document.getElementById("amount");
  var receipt = document.getElementById("receipt");
  var balance = document.getElementById("balance");
  var bar = document.getElementById("bar");
  var note = document.getElementById("goal-note");
  var btn = document.getElementById("scan");
  var scans = [
    { rm: "12.90", pts: 12, when: "Sun 3 Nov, 9:40 am", no: "#SM-88407" },
    { rm: "88.60", pts: 88, when: "Wed 6 Nov, 7:55 pm", no: "#SM-89112" },
    { rm: "6.50", pts: 6, when: "Thu 7 Nov, 8:03 am", no: "#SM-89236" },
    { rm: "47.35", pts: 47, when: "Sat 2 Nov, 6:12 pm", no: "#SM-88213" }
  ];
  var total = 1239, pending = 47, i = 0;
  function show() {
    balance.textContent = total.toLocaleString("en-MY");
    var left = 1500 - total;
    note.textContent = left > 0 ? left + " more for RM 15 off your next shop" : "RM 15 off is ready to use";
    bar.style.transform = "scaleX(" + Math.min(1, total / 1500).toFixed(3) + ")";
  }
  // before the first toss lands, the balance shows what it was
  balance.textContent = total.toLocaleString("en-MY");
  bar.style.transform = "scaleX(" + (total / 1500).toFixed(3) + ")";
  note.textContent = 1500 - total + " more for RM 15 off your next shop";
  tray.addEventListener("coinlanded", function () {
    total += pending; pending = 0;
    show();
    btn.disabled = false;
  });
  btn.addEventListener("click", function () {
    if (!tray.coin) return;
    var s = scans[i++ % scans.length];
    if (total > 1490) total = 1239;
    pending = s.pts;
    amount.textContent = "+" + s.pts;
    tray.setAttribute("aria-label", "A points coin showing plus " + s.pts + " points");
    receipt.textContent = "RM " + s.rm + " · " + s.when + " · " + s.no;
    btn.disabled = true;
    tray.coin.toss();
  });
})();
