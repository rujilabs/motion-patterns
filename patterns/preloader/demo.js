/* Demo only: fakes a load in uneven steps, the way real files arrive, and replays it on request. */
(function () {
  var el = document.querySelector("[data-preloader]");
  var replay = document.querySelector(".replay");
  var steps = [[150, .12], [380, .34], [620, .41], [900, .68], [1150, .86], [1400, 1]];
  var timers = [];
  function run() {
    timers.forEach(clearTimeout);
    el.preloader.reset();
    timers = steps.map(function (s) {
      return setTimeout(function () { if (s[1] < 1) el.preloader.set(s[1]); else el.preloader.finish(); }, s[0]);
    });
  }
  replay.addEventListener("click", run);
  // preloader.js sets el.preloader on DOMContentLoaded; this listener is added later, so it runs after
  document.addEventListener("DOMContentLoaded", run);
})();
