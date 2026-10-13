/* Demo only: pretends the order arrives after 1.6 s, and the Replay button loads it again. */
(function () {
  var card = document.querySelector("[data-skeleton]");
  var replay = document.querySelector(".replay");
  var timer;
  function load() {
    clearTimeout(timer);
    card.setAttribute("aria-busy", "true");
    replay.disabled = true;
    timer = setTimeout(function () {
      card.setAttribute("aria-busy", "false");
      replay.disabled = false;
    }, 1600);
  }
  replay.addEventListener("click", load);
  load();
})();
