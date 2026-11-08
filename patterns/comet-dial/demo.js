// Demo only: the Start / Pause button, the speed switch and the status line, on a simulated clock
// that starts at 3:23 pm.
(function () {
  var dial = document.getElementById("dial");
  var btn = document.getElementById("start");
  var fast = document.getElementById("fast");
  var status = document.getElementById("status");
  var NOW = 15 * 60 + 23; // 3:23 pm in minutes
  if (!dial.dial) return;
  function clock(min) {
    var h = Math.floor(min / 60) % 24, m = Math.round(min % 60);
    return (h % 12 || 12) + ":" + ("0" + m).slice(-2) + (h < 12 ? " am" : " pm");
  }
  var started = false;
  dial.addEventListener("change", function () { if (!dial.dial.running()) started = false; });
  btn.addEventListener("click", function () { started = true; if (dial.dial.running()) dial.dial.pause(); else dial.dial.start(); });
  fast.addEventListener("change", function () { dial.dial.speed(fast.checked ? 30 : 1); });
  dial.addEventListener("state", function () {
    var on = dial.dial.running(), left = dial.dial.left();
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "Pause" : "Start";
    if (on) status.textContent = "Counting down. Roti boyan out at " + clock(NOW + left / 60) + ".";
    else if (left > 0 && started) status.textContent = "Paused with " + document.querySelector(".cd-time").textContent + " left.";
    else if (left > 0) status.textContent = "Set to " + Math.ceil(left / 60) + " minutes. Press Start.";
  });
  dial.addEventListener("done", function () {
    started = false;
    status.textContent = "Done. Take the roti boyan out and let them rest 5 minutes.";
  });
})();
