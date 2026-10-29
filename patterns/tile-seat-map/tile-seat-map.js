/*
 * tile-seat-map.js: a seat map you can pick from with a pointer or the keys.
 *
 *   <div class="seat-map" role="grid" aria-label="Seats" data-max="6" data-status="seat-status">
 *     <div role="row"><span role="rowheader">A</span>
 *       <span role="gridcell"><button type="button" class="seat" aria-pressed="false" aria-label="A1, RM 16.00" data-seat="A1"></button></span>
 *       <span role="gridcell"><button type="button" class="seat" aria-disabled="true" aria-label="A2, taken"></button></span>
 *     </div>
 *   </div>
 *
 * One seat is in the Tab order at a time (roving tabindex). Arrow keys move by one seat, Home and
 * End go to the ends of the row, Page Up and Page Down to the same seat in the first and last row.
 * Enter or Space picks (they are real buttons). A picked seat pops: it springs up and settles while
 * its cushion folds down. A taken seat shakes no, and the status line names the nearest free seat
 * in that row. Fires "seatchange" with detail.seats (["E7", "E8"]) on the map.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(map) {
    if (map._seats) return;
    map._seats = true;
    var rows = Array.prototype.map.call(map.querySelectorAll('[role="row"]'), function (r) {
      return Array.prototype.slice.call(r.querySelectorAll(".seat"));
    }).filter(function (r) { return r.length; });
    if (!rows.length) return;
    var max = parseInt(map.dataset.max, 10) || Infinity;
    var status = map.dataset.status ? document.getElementById(map.dataset.status) : null;
    var current = rows[0][0];
    rows.forEach(function (row) { row.forEach(function (s) { s.tabIndex = -1; }); });
    // start the Tab stop on the first free seat
    outer: for (var r = 0; r < rows.length; r++) for (var c = 0; c < rows[r].length; c++) {
      if (!taken(rows[r][c])) { current = rows[r][c]; break outer; }
    }
    current.tabIndex = 0;

    function taken(s) { return s.getAttribute("aria-disabled") === "true"; }
    function name(s) { return s.dataset.seat || s.getAttribute("aria-label").split(",")[0]; }
    function where(s) {
      for (var r = 0; r < rows.length; r++) { var c = rows[r].indexOf(s); if (c > -1) return [r, c]; }
      return [0, 0];
    }
    function picked() {
      var out = [];
      rows.forEach(function (row) { row.forEach(function (s) { if (s.getAttribute("aria-pressed") === "true") out.push(name(s)); }); });
      return out;
    }
    function say(text) { if (status) status.textContent = text; }
    function focus(s) {
      if (!s) return;
      current.tabIndex = -1;
      current = s;
      s.tabIndex = 0;
      s.focus();
    }
    function nearestFree(s) {
      var p = where(s), row = rows[p[0]];
      for (var d = 1; d < row.length; d++) {
        var a = row[p[1] + d], b = row[p[1] - d];
        if (a && !taken(a) && a.getAttribute("aria-pressed") !== "true") return a;
        if (b && !taken(b) && b.getAttribute("aria-pressed") !== "true") return b;
      }
      return null;
    }
    function pop(s) {
      if (reduce.matches || !s.animate) return;
      s.animate([
        { transform: "translateZ(0) scale(1)" },
        { transform: "translateZ(0) translateY(-3px) scale(1.22)", offset: 0.3 },
        { transform: "translateZ(0) scale(1)" }
      ], { duration: 460, easing: getEase() });
    }
    function getEase() {
      return getComputedStyle(document.documentElement).getPropertyValue("--ease-spring").trim() || "ease-out";
    }
    // a decaying side to side shake: no
    function shake(s) {
      if (reduce.matches || !s.animate) return;
      s.animate([
        { transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" },
        { transform: "translateX(-3px)" }, { transform: "translateX(2px)" }, { transform: "translateX(-1px)" },
        { transform: "translateX(0)" }
      ], { duration: 420, easing: "ease-out" });
    }

    map.addEventListener("click", function (e) {
      var s = e.target.closest(".seat");
      if (!s || !map.contains(s)) return;
      focus(s);
      if (taken(s)) {
        shake(s);
        var alt = nearestFree(s);
        say(name(s) + " is taken." + (alt ? " " + name(alt) + " is free." : " This row is full."));
        return;
      }
      var on = s.getAttribute("aria-pressed") === "true";
      if (!on && picked().length >= max) {
        shake(s);
        say("You can pick up to " + max + " seats. Tap a picked seat to free it.");
        return;
      }
      s.setAttribute("aria-pressed", on ? "false" : "true");
      if (!on) pop(s);
      var list = picked();
      say(name(s) + (on ? " freed. " : " picked. ") + (list.length ? list.length + (list.length === 1 ? " seat: " : " seats: ") + list.join(", ") + "." : "No seats picked."));
      map.dispatchEvent(new CustomEvent("seatchange", { detail: { seats: list } }));
    });

    map.addEventListener("keydown", function (e) {
      var s = e.target.closest(".seat");
      if (!s) return;
      var p = where(s), r = p[0], c = p[1], next = null;
      switch (e.key) {
        case "ArrowRight": next = rows[r][c + 1]; break;
        case "ArrowLeft": next = rows[r][c - 1]; break;
        case "ArrowDown": next = rows[r + 1] && rows[r + 1][Math.min(c, rows[r + 1].length - 1)]; break;
        case "ArrowUp": next = rows[r - 1] && rows[r - 1][Math.min(c, rows[r - 1].length - 1)]; break;
        case "Home": next = e.ctrlKey ? rows[0][0] : rows[r][0]; break;
        case "End": next = e.ctrlKey ? rows[rows.length - 1][rows[rows.length - 1].length - 1] : rows[r][rows[r].length - 1]; break;
        case "PageUp": next = rows[0][Math.min(c, rows[0].length - 1)]; break;
        case "PageDown": next = rows[rows.length - 1][Math.min(c, rows[rows.length - 1].length - 1)]; break;
        default: return;
      }
      e.preventDefault();
      focus(next);
    });
  }

  function init() { document.querySelectorAll(".seat-map").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
