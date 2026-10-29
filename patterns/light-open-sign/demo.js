// Demo only: a simulated clock for the sign, and the opening hours written out next to it.
// The sign itself is light-open-sign.js.
(function () {
  var sign = document.getElementById("sign");
  var t = document.getElementById("t");
  var out = document.getElementById("t-out");
  var status = document.getElementById("status");
  var text = document.getElementById("status-t");
  var lunch = document.getElementById("h-lunch");
  var dinner = document.getElementById("h-dinner");

  function clock(m) {
    m = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60;
    return (h % 12 || 12) + ":" + (mm < 10 ? "0" : "") + mm + (h < 12 ? " am" : " pm");
  }
  function say(m) {
    if (m < 690) return "Closed. Opens for lunch at 11:30 am.";
    if (m < 900) return m >= 870 ? "Open now. Last orders 2:45 pm." : "Open now for lunch, until 3:00 pm.";
    if (m < 1050) return "Closed for the afternoon. Back at 5:30 pm.";
    if (m < 1425) return m >= 1395 ? "Open now. Last orders 11:15 pm." : "Open now for dinner, until 11:45 pm.";
    return "Closed. Opens tomorrow at 11:30 am.";
  }
  function set() {
    var m = +t.value, label = clock(m);
    out.textContent = label;
    t.setAttribute("aria-valuetext", label);
    if (sign.neon) sign.neon.setTime(m % 1440);
    var open = sign.neon ? sign.neon.isOpen() : true;
    status.classList.toggle("is-open", open);
    text.textContent = say(m);
    lunch.classList.toggle("is-now", m >= 690 && m < 900);
    dinner.classList.toggle("is-now", m >= 1050 && m < 1425);
  }
  t.addEventListener("input", set);
  set();
})();
