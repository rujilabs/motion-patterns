// Demo only: swaps the line under the headline with each word, and wires the pause switch.
(function () {
  var prism = document.querySelector(".prism"), lede = document.getElementById("lede");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var lines = {
    "cafes": "Split bills by seat, send drinks to the bar printer and close the day in 4 minutes.",
    "clinics": "Panel claims, MC slips and the dispensary counter, on one till.",
    "tuition centres": "Fees by student, sibling discounts, and a reminder to parents on the 25th.",
    "bakeries": "Pre-orders with a deposit, and a 6 pm button that halves the bread.",
    "car workshops": "Job sheets by plate number, parts from stock, a WhatsApp when the car is ready."
  };
  prism.addEventListener("turn", function (e) {
    var text = lines[e.detail.word];
    if (still.matches || !lede.animate) { lede.textContent = text; return; }
    var out = lede.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, delay: 260, fill: "forwards" });
    out.onfinish = function () {
      lede.textContent = text;
      lede.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
      out.cancel();
    };
  });
  document.getElementById("hold").addEventListener("change", function (e) {
    if (prism.pause) prism.pause(e.target.checked);
  });
})();
