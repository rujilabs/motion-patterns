/*
 * tile-habit-grid.js: builds a year of day tiles from one string of levels, then style.css fills
 * them in week by week when the grid scrolls into view (play.js adds .go).
 *
 *   <div class="habit-grid" data-play data-start="2026-01-01" data-days="365"
 *        data-levels="2224220314..."
 *        role="img" aria-label="Goal hit on 231 of 302 days so far">
 *   </div>
 *
 * data-levels: one digit per day from data-start, 0 to 4. Days after the string ends are still to
 * come and show as outlines. Weeks start on Monday. Each tile gets --w (its week) and --d (its day
 * of the week); the fill delay is worked out from them in CSS. Month names are added above the
 * week where each month starts. Call el.replay() to fill it again.
 */
(function () {
  "use strict";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function setup(el) {
    if (el._habit) return;
    el._habit = true;
    var p = (el.dataset.start || "2026-01-01").split("-");
    var start = new Date(+p[0], +p[1] - 1, +p[2]);
    var levels = el.dataset.levels || "";
    var total = parseInt(el.dataset.days, 10) || 365;
    var lead = (start.getDay() + 6) % 7; // Monday = 0
    var weeks = Math.ceil((lead + total) / 7);

    var months = document.createElement("div");
    months.className = "hg-months";
    months.setAttribute("aria-hidden", "true");
    var days = document.createElement("div");
    days.className = "hg-days";
    days.setAttribute("aria-hidden", "true");
    el.style.setProperty("--hg-weeks", weeks);

    var frag = document.createDocumentFragment();
    for (var i = 0; i < weeks * 7; i++) {
      var t = document.createElement("span");
      var n = i - lead;
      var w = Math.floor(i / 7);
      t.className = "hg-day";
      t.style.setProperty("--w", w);
      t.style.setProperty("--d", i % 7);
      if (n < 0 || n >= total) t.classList.add("hg-out");
      else {
        if (n < levels.length) t.dataset.l = levels.charAt(n);
        else t.classList.add("hg-future");
        var date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + n);
        if (date.getDate() === 1 || n === 0) {
          var m = document.createElement("span");
          m.textContent = MONTHS[date.getMonth()];
          // a month that starts late in its week is labelled from the next column
          m.style.setProperty("--w", w + (i % 7 > 3 ? 2 : 1));
          months.appendChild(m);
        }
      }
      frag.appendChild(t);
    }
    days.appendChild(frag);
    var wd = document.createElement("div");
    wd.className = "hg-weekdays";
    wd.setAttribute("aria-hidden", "true");
    ["Mon", "", "Wed", "", "Fri", "", ""].forEach(function (name) {
      var s = document.createElement("span");
      s.textContent = name;
      wd.appendChild(s);
    });
    // the plain text fallback, if any, steps aside once the tiles exist
    var fallback = el.querySelector(".hg-fallback");
    if (fallback) fallback.hidden = true;
    el.appendChild(months);
    el.appendChild(wd);
    el.appendChild(days);
    el.classList.add("hg-ready");

    el.replay = function () {
      el.classList.remove("go");
      void el.offsetWidth;
      el.classList.add("go");
    };
  }

  function init() { document.querySelectorAll(".habit-grid").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
