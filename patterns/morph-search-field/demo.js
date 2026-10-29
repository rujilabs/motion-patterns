// Demo only: a bookshop header. Typing filters a small catalogue into the drop down.
(function () {
  var books = [
    ["Rain on Armenian Street", "Tan Mei Ling", "59.90", "#2f4858"],
    ["Kopi, Kaya, Kampung", "Rosnah Idris", "79.00", "#c8963e"],
    ["The Ferry at Weld Quay", "Arjun Pillai", "49.90", "#8c2f2b"],
    ["Little Trishaw", "Aimee Ong", "28.90", "#e7d8bf"],
    ["Pantun untuk Anak", "Zainab Hamid", "32.00", "#6b8f71"],
    ["Shophouse Mornings", "Lee Kah Wai", "64.00", "#3d3a4b"],
    ["Penang Before the Bridge, 1786 to 1985", "Haris Ismail", "88.00", "#7a5c3e"],
    ["Nasi Kandar Nights", "Farid Kamal", "45.00", "#b5562f"],
    ["The Clan Jetties", "Ooi Siew Pheng", "54.90", "#456b78"]
  ];
  var form = document.getElementById("search"), q = document.getElementById("q");
  var drop = document.getElementById("drop"), head = document.getElementById("drop-head"), hits = document.getElementById("hits");
  var mast = document.querySelector(".masthead");

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mark(s, term) {
    var i = s.toLowerCase().indexOf(term);
    return i < 0 ? esc(s) : esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + term.length)) + "</mark>" + esc(s.slice(i + term.length));
  }
  function render() {
    var term = q.value.trim().toLowerCase();
    hits.textContent = "";
    if (!term) {
      head.textContent = "Searched often this week";
      var li = document.createElement("li"); li.className = "chips";
      ["Penang", "kaya", "ferry", "pantun"].forEach(function (w) {
        var b = document.createElement("button"); b.type = "button"; b.textContent = w;
        b.addEventListener("click", function () { q.value = w; render(); q.focus(); });
        li.appendChild(b);
      });
      hits.appendChild(li);
      return;
    }
    var found = books.filter(function (b) { return (b[0] + " " + b[1]).toLowerCase().indexOf(term) > -1; });
    head.textContent = found.length ? found.length + (found.length === 1 ? " book" : " books") + " in stock" : "Nothing in stock for “" + q.value.trim() + "”. We can order it in, about 10 days.";
    found.slice(0, 4).forEach(function (b) {
      var li = document.createElement("li");
      li.innerHTML = '<a href="#shelf-h"><span class="thumb"></span><span>' + mark(b[0], term) + "<small>" + mark(b[1], term) + '</small></span><span class="num">RM ' + b[2] + "</span></a>";
      li.querySelector(".thumb").style.background = b[3];
      hits.appendChild(li);
    });
  }
  q.addEventListener("input", render);
  form.addEventListener("submit", function (e) { e.preventDefault(); var a = hits.querySelector("a"); if (a) a.focus(); });
  form.addEventListener("search-morph", function (e) {
    mast.classList.toggle("searching", e.detail.open);
    if (e.detail.open) { render(); drop.hidden = false; } else drop.hidden = true;
  });
  // leaving the header for the page closes an empty search; clicks inside the drop keep it open
  document.addEventListener("pointerdown", function (e) {
    if (form.classList.contains("is-open") && !mast.contains(e.target) && !q.value) SearchMorph.close(form);
  });
  drop.addEventListener("keydown", function (e) { if (e.key === "Escape") { q.value = ""; SearchMorph.close(form); } });
})();
