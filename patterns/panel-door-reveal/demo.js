// Demo only: says whether the doors are open. The doors are doors.js.
(function () {
  var way = document.getElementById("doorway"), state = document.getElementById("state");
  way.addEventListener("doorsopen", function () { state.textContent = "Open: ANANDA12, RM 12 off a box over RM 80"; });
  way.addEventListener("doorsclose", function () { state.textContent = "Doors shut"; });
})();
