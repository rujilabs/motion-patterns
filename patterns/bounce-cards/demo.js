/* Demo only: name the print in focus or tapped, and replay the entrance. */
(function () {
  var fan = document.querySelector(".bc");
  var cap = document.querySelector("[data-bc-caption]");
  var replay = document.querySelector("[data-bc-replay]");
  var prints = [].slice.call(fan.querySelectorAll(".bc-print"));
  function name(b) { cap.textContent = "Print " + (prints.indexOf(b) + 1) + " of " + prints.length + ". " + b.getAttribute("data-caption"); }
  fan.addEventListener("focusin", function (e) { var b = e.target.closest(".bc-print"); if (b) name(b); });
  fan.addEventListener("click", function (e) { var b = e.target.closest(".bc-print"); if (b) name(b); });
  replay.hidden = false;
  replay.addEventListener("click", function () {
    fan.classList.remove("go", "is-open");
    void fan.offsetWidth;
    fan.classList.add("go");
  });
})();
