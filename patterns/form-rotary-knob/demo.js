// Demo only: reads the knob's value and updates the thermostat text. The knob itself is knob.js.
(function () {
  var ROOM = 27.4;
  var knob = document.getElementById("knob");
  var set = document.getElementById("set");
  var cost = document.getElementById("cost");
  var status = document.getElementById("status");
  function update() {
    var v = +knob.value;
    set.textContent = v.toFixed(1);
    // a 1.5 hp unit on the domestic tariff: colder costs more
    var rm = Math.max(0.09, 0.18 + (28 - v) * 0.04);
    cost.textContent = "About RM " + rm.toFixed(2) + " an hour";
    if (v < ROOM) status.textContent = "Cooling. About " + Math.max(2, Math.round((ROOM - v) * 6.2)) + " min to reach " + v.toFixed(1) + " °C.";
    else status.textContent = "Fan only. The room is already cooler than " + v.toFixed(1) + " °C.";
  }
  knob.addEventListener("input", update);
})();
