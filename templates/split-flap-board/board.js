/*
 * Split-flap board: drives the flaps. Each .c cell gets four halves (fixed top, fixed bottom, a
 * top flap and a bottom flap). A flip shows the next character on the fixed top, drops the top
 * flap (current character) on its hinge, then brings the bottom flap (next character) down after
 * it. Characters come from one drum, in order, like the real thing: a cell can only reach "N" by
 * passing "M". The last flip of a run is slower and bounces where it lands.
 * One requestAnimationFrame scheduler starts every flip and stops when nothing is left to turn.
 * After the board fills, the clock ticks every second and a remark changes every few seconds;
 * the Pause toggle stops both. Under reduced motion none of this runs: the board stays as written.
 */
(function () {
  var board = document.querySelector(".pier");
  if (!board) return;
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  if ((reduce && reduce.matches) || !Element.prototype.animate) return;

  var DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-";
  var STEP = 72;            // ms between flips while a cell rattles through the drum
  var HALF = 34;            // ms for each half of a quick flip
  var LAST_TOP = 70, LAST_BOTTOM = 190;
  var pause = board.querySelector(".pause input");
  var cs = getComputedStyle(document.documentElement);
  var EASE_IN = cs.getPropertyValue("--ease-in").trim() || "ease-in";
  var EASE_OUT = cs.getPropertyValue("--ease-out").trim() || "ease-out";
  var pending = [], raf = 0;

  function glyph(ch) { return ch === " " ? " " : ch; }
  function half(cls, ch) {
    var h = document.createElement("span");
    h.className = "h " + cls;
    var i = document.createElement("i");
    i.textContent = glyph(ch);
    h.appendChild(i);
    return h;
  }
  function put(h, ch) { h.firstChild.textContent = glyph(ch); }
  function index(ch, drum) { var i = (drum || DRUM).indexOf(ch); return i < 0 ? 0 : i; }

  // replace each cell's text with the four halves, showing `start`
  function build(c, start, drum) {
    c.textContent = "";
    var parts = { u: half("u", start), d: half("d", start), fu: half("u fu", start), fd: half("d fd", start) };
    c.appendChild(parts.u); c.appendChild(parts.d); c.appendChild(parts.fu); c.appendChild(parts.fd);
    return { el: c, parts: parts, drum: drum || DRUM, cur: start, target: start, next: 0, anims: null };
  }

  function flip(cell, to, last) {
    var p = cell.parts, from = cell.cur;
    if (cell.anims) { cell.anims[0].cancel(); cell.anims[1].cancel(); }
    put(p.u, to); put(p.fd, to); put(p.fu, from); put(p.d, from);
    var top = p.fu.animate(
      [{ transform: "rotateX(0deg)", filter: "brightness(1)" }, { transform: "rotateX(-90deg)", filter: "brightness(.42)" }],
      { duration: last ? LAST_TOP : HALF, easing: EASE_IN, fill: "forwards" });
    var bottomFrames = last
      ? [{ transform: "rotateX(90deg)", filter: "brightness(.5)", easing: EASE_IN },
         { transform: "rotateX(0deg)", filter: "brightness(1)", offset: 0.5, easing: EASE_OUT },
         { transform: "rotateX(16deg)", filter: "brightness(.92)", offset: 0.72, easing: EASE_IN },
         { transform: "rotateX(0deg)", filter: "brightness(1)" }]
      : [{ transform: "rotateX(90deg)", filter: "brightness(.5)" }, { transform: "rotateX(0deg)", filter: "brightness(1)" }];
    var bottom = p.fd.animate(bottomFrames, {
      duration: last ? LAST_BOTTOM : HALF, delay: last ? LAST_TOP : HALF,
      easing: last ? "linear" : EASE_OUT, fill: "both" });
    cell.anims = [top, bottom];
    bottom.onfinish = function () {
      put(p.d, to); put(p.fu, to);
      top.cancel(); bottom.cancel();
      cell.anims = null;
    };
    cell.cur = to;
  }

  function tick(now) {
    var still = [];
    for (var i = 0; i < pending.length; i++) {
      var cell = pending[i];
      if (now >= cell.next) {
        var n = cell.drum.charAt((index(cell.cur, cell.drum) + 1) % cell.drum.length);
        var last = n === cell.target;
        flip(cell, n, last);
        cell.next = now + STEP;
        if (last) continue;
      }
      still.push(cell);
    }
    pending = still;
    raf = pending.length ? requestAnimationFrame(tick) : 0;
  }
  // send a cell to a new character, starting no earlier than `at`
  function send(cell, target, at) {
    if (cell.cur === target) return;
    cell.target = target;
    cell.next = at;
    if (pending.indexOf(cell) < 0) pending.push(cell);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function sendText(cells, text, at, spacing) {
    for (var i = 0; i < cells.length; i++) send(cells[i], text.charAt(i) || " ", at + i * spacing);
  }

  // ---------- the board fills, row by row ----------
  var rows = [].slice.call(board.querySelectorAll("tbody tr"));
  var fields = {};
  var t0 = performance.now() + 120;
  rows.forEach(function (tr, r) {
    var col = 0;
    [].forEach.call(tr.querySelectorAll("td"), function (td) {
      var cells = [].map.call(td.querySelectorAll(".c"), function (c) {
        var target = c.textContent.replace(/ /g, " ").toUpperCase();
        // each cell starts a few characters behind its target, so the run lengths differ
        var behind = target === " " ? Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 11);
        var cell = build(c, DRUM.charAt((index(target) - behind + DRUM.length * 2) % DRUM.length));
        send(cell, target, t0 + r * 170 + col * 26 + Math.random() * 50);
        col += 1;
        return cell;
      });
      fields[r + ":" + td.className.split(" ")[0]] = { td: td, cells: cells };
    });
  });

  // ---------- the clock ----------
  // clock cells carry digits only, so 9 turns straight to 0
  var clockCells = [].map.call(board.querySelectorAll(".clock .c"), function (c) { return build(c, c.textContent, "0123456789"); });
  var spoken = board.querySelector(".clock .sr-only");
  var seconds = 8 * 3600 + 14 * 60 + 52;
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function clockText(s) { return two(Math.floor(s / 3600) % 24) + two(Math.floor(s / 60) % 60) + two(s % 60); }

  // ---------- remarks that change while you watch ----------
  var updates = [
    [0, "GATE CLOSED", "grey"], [1, "BOARDING", "amber"], [2, "DELAYED 20", "red"],
    [0, "DEPARTED", "grey"], [3, "BOARDING", "amber"], [1, "GATE CLOSED", "grey"]
  ];
  var u = 0;
  function remark() {
    var up = updates[u % updates.length], f = fields[up[0] + ":f-status"];
    u += 1;
    if (!f) return;
    f.td.classList.remove("amber", "red", "grey");
    if (up[2]) f.td.classList.add(up[2]);
    var label = f.td.querySelector(".sr-only");
    if (label) label.textContent = up[1].charAt(0) + up[1].slice(1).toLowerCase();
    sendText(f.cells, up[1], performance.now(), 30);
  }

  var timer = 0, beat = 0;
  function run() {
    if (pause && pause.checked) return;
    seconds += 1;
    beat += 1;
    var text = clockText(seconds);
    sendText(clockCells, text, performance.now(), 0);
    if (spoken && seconds % 60 === 0) spoken.textContent = (Math.floor(seconds / 3600) % 12 || 12) + ":" + two(Math.floor(seconds / 60) % 60) + " am";
    if (beat % 7 === 0) remark();
  }
  // start ticking once the board has filled
  setTimeout(function () { timer = setInterval(run, 1000); }, 3200);
  if (pause) pause.addEventListener("change", function () { if (!pause.checked) beat = 0; });
  if (reduce && reduce.addEventListener) {
    reduce.addEventListener("change", function () { if (reduce.matches) clearInterval(timer); });
  }
})();
