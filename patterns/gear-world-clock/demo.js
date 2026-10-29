// Demo only: writes each city's time and office status from the train's clockchange event.
(function () {
  var box = document.querySelector(".gear-world-clock");
  var rows = document.querySelectorAll("#cities li");
  var verdict = document.getElementById("verdict");
  var fmt = window.GearWorldClock.format;
  var DAYS = ["Wed", "Thu", "Fri"];
  var OPEN = 9 * 60, SHUT = 18 * 60, MEETING = 45;

  function render(cities) {
    var open = 0, waits = [];
    // the list is shown west to east, the order of the wheels
    cities.forEach(function (c, i) {
      var li = rows[i], m = c.minutes;
      var inOffice = m >= OPEN && m + MEETING <= SHUT;
      var state = inOffice ? "in office" : m < OPEN ? (m < 6 * 60 ? "asleep" : "before work") : "after hours";
      if (inOffice) open++;
      else if (m < OPEN) waits.push(c.name + " opens in " + hours(OPEN - m));
      else waits.push(c.name + " has gone home");
      li.querySelector(".t").textContent = fmt(m);
      var s = li.querySelector(".s");
      s.textContent = DAYS[c.dayShift + 1] + ", " + state;
      s.classList.toggle("open", inOffice);
    });
    verdict.textContent = open === cities.length
      ? "All 3 offices are open for the full 45 minutes. Book it."
      : open + " of 3 offices are open. " + waits[0] + ".";
  }
  function hours(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h ? h + (h === 1 ? " hour" : " hours") : "") + (h && m ? " " : "") + (m ? m + " min" : "");
  }
  box.addEventListener("clockchange", function (e) { render(e.detail.cities); });
  document.getElementById("earlier").addEventListener("click", function () { box.setTime(+box.getAttribute("aria-valuenow") - 15); });
  document.getElementById("later").addEventListener("click", function () { box.setTime(+box.getAttribute("aria-valuenow") + 15); });
  if (box.getAttribute("aria-valuenow")) {
    // the train already announced its start time before this script listened: render it once
    var v = +box.getAttribute("aria-valuenow");
    render([["London", -480], ["Dubai", -240], ["Kuala Lumpur", 0]].map(function (c) {
      return { name: c[0], minutes: ((v + c[1]) % 1440 + 1440) % 1440, dayShift: Math.floor((v + c[1]) / 1440) };
    }));
  }
})();
