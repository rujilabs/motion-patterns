/*
 * Demo only: a futsal league table driven by reorder.js. Not part of the pattern.
 * The # column is the league position (points, then goal difference), whatever the sort, so a
 * matchday can roll it and mark who climbed. Results after matchday 6 come from a seeded
 * generator, so every visit plays the same season.
 */
(function () {
  var table = document.querySelector("[data-league]");
  if (!table || !window.reorder) return;
  var say = document.querySelector("[data-say]");
  var playBtn = document.querySelector("[data-matchday]");
  var topFour = document.querySelector("[data-top]");
  var sortBtns = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
  var LAST = 14;
  var SORT_NAME = { pts: "points", gd: "goal difference", name: "name" };

  var teams = {}, ids = [];
  Array.prototype.forEach.call(table.children, function (row) {
    var id = row.getAttribute("data-team");
    ids.push(id);
    teams[id] = {
      id: id, row: row,
      name: row.querySelector(".team strong").textContent,
      p: +row.querySelector(".p").textContent,
      gd: +row.querySelector(".gd").textContent.replace("+", ""),
      pts: +row.querySelector(".pts").textContent
    };
  });
  var start = ids.map(function (id) { var t = teams[id]; return [t.p, t.gd, t.pts]; });
  var matchday = 5, sortBy = "pts";

  function byLeague(a, b) { return b.pts - a.pts || b.gd - a.gd || a.name.localeCompare(b.name); }
  var order = {
    pts: byLeague,
    gd: function (a, b) { return b.gd - a.gd || b.pts - a.pts || a.name.localeCompare(b.name); },
    name: function (a, b) { return a.name.localeCompare(b.name); }
  };
  function list() { return ids.map(function (id) { return teams[id]; }); }
  function standings() {
    var pos = {};
    list().sort(byLeague).forEach(function (t, i) { pos[t.id] = i + 1; });
    return pos;
  }
  var position = standings();

  // Matchday 6 is written out so the first play has a story: the leaders lose to the bottom side.
  var SCRIPT = [["amh", 6, "bmr", 1], ["srs", 3, "skb", 1], ["tml", 4, "btc", 2], ["pdl", 3, "kbr", 2]];
  var seed = 20261013;
  function rand() { // mulberry32
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function fixtures() {
    if (matchday === 5) return SCRIPT;
    var pool = ids.slice(), games = [];
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var s = pool[i]; pool[i] = pool[j]; pool[j] = s; }
    for (var k = 0; k < pool.length; k += 2) games.push([pool[k], Math.floor(rand() * 6), pool[k + 1], Math.floor(rand() * 6)]);
    return games;
  }
  function result(id, gf, ga) {
    var t = teams[id];
    t.p += 1; t.gd += gf - ga; t.pts += gf > ga ? 3 : gf === ga ? 1 : 0;
  }

  function signed(n) { return n > 0 ? "+" + n : String(n); }
  function paint(moves) {
    var next = standings();
    list().forEach(function (t) {
      var r = t.row;
      r.querySelector(".p").textContent = t.p;
      r.querySelector(".gd").textContent = signed(t.gd);
      r.querySelector(".pts").textContent = t.pts;
      var was = position[t.id], now = next[t.id];
      window.reorder.roll(r.querySelector(".rank"), now, now < was ? 1 : -1);
      r.classList.toggle("zone", now <= 2);
      r.hidden = topFour.checked && now > 4;
      var mark = r.querySelector(".move");
      mark.getAnimations().forEach(function (a) { a.cancel(); });
      mark.className = "move";
      mark.textContent = "";
      if (moves && now !== was) {
        mark.classList.add(now < was ? "up" : "down");
        mark.textContent = Math.abs(was - now);
        if (mark.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
          mark.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .78 }, { opacity: 0 }],
            { duration: 3200, delay: 350, easing: "linear", fill: "both" });
        }
      }
    });
    var sorted = list().sort(order[sortBy]);
    sorted.forEach(function (t) { table.appendChild(t.row); });
    var before = position;
    position = next;
    return { before: before, sorted: sorted };
  }

  function update(moves, words) {
    var out;
    window.reorder.flip(table, function () { out = paint(moves); });
    say.textContent = words(out);
  }

  function leaderLine(out) {
    var lead = list().sort(byLeague)[0];
    var climb = out.before[lead.id] - 1;
    return lead.name + " top" + (climb > 0 ? ", up " + climb : "") + ".";
  }

  function playMatchday() {
    if (matchday >= LAST) {
      matchday = 5;
      ids.forEach(function (id, i) { var t = teams[id]; t.p = start[i][0]; t.gd = start[i][1]; t.pts = start[i][2]; });
      seed = 20261013;
      update(false, function () { return "Back to matchday 5."; });
    } else {
      fixtures().forEach(function (g) { result(g[0], g[1], g[3]); result(g[2], g[3], g[1]); });
      matchday += 1;
      update(true, function (out) { return "Matchday " + matchday + " played. " + leaderLine(out); });
    }
    document.querySelector("[data-md]").textContent = matchday;
    playBtn.textContent = matchday >= LAST ? "Start the season again" : "Play matchday " + (matchday + 1);
  }

  var auto = 0;
  function user(fn) { return function (e) { clearTimeout(auto); fn(e); }; }
  playBtn.addEventListener("click", user(playMatchday));
  sortBtns.forEach(function (b) {
    b.addEventListener("click", user(function () {
      sortBy = b.getAttribute("data-sort");
      sortBtns.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      update(false, function (out) { return "Sorted by " + SORT_NAME[sortBy] + ". " + out.sorted[0].name + " first."; });
    }));
  });
  topFour.addEventListener("change", user(function () {
    update(false, function () { return topFour.checked ? "Showing the top four." : "Showing all eight teams."; });
  }));

  // The demo plays its first matchday on its own, so the move shows without a click.
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) auto = setTimeout(playMatchday, 900);
})();
