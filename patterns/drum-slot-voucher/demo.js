// Demo only: writes the voucher once the reels stop. The reels and lever are drum-slot-voucher.js.
(function () {
  var slot = document.getElementById("slot"), code = document.getElementById("code"), terms = document.getElementById("terms");
  var ticket = document.getElementById("ticket"), still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var drinks = { KOPI: "kopi", TEH: "teh", MILO: "Milo", CHAM: "cham", LIMAU: "limau", BARLI: "barli", SIRAP: "sirap", HALIA: "teh halia", NESLO: "Neslo", KOSONG: "kopi O kosong" };
  var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-spring").trim() || "ease-out";
  slot.addEventListener("spinstart", function () {
    ticket.classList.remove("is-won");
    code.textContent = "Spinning";
    terms.textContent = "Good luck. The reels stop left to right.";
  });
  slot.addEventListener("spinend", function (e) {
    var v = e.detail.values;
    ticket.classList.add("is-won");
    code.textContent = v.join("-");
    terms.textContent = +v[1] + "% off any " + drinks[v[0]] + ", ais or panas. Show the code at the counter by Sunday, 9 November.";
    if (!still.matches && code.animate) code.animate([{ transform: "scale(.92)" }, { transform: "none" }], { duration: 500, easing: ease });
  });
})();
