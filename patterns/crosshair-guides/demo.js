// Demo only: which lot is under the crosshair. The guides are crosshair-guides.js; this file
// listens for its "ch-move" and "ch-pick" events and reads the lots from the plan's <rect> elements.
(function () {
  var map = document.querySelector(".chd-map");
  var RATE = 118.5;
  var lots = [].map.call(map.querySelectorAll(".ch-lot"), function (r) {
    var x = +r.getAttribute("x"), y = +r.getAttribute("y"), w = +r.getAttribute("width"), h = +r.getAttribute("height");
    return { el: r, name: r.getAttribute("data-lot"), x: x, y: y, w: w, h: h, area: w * h, sold: r.classList.contains("is-sold") };
  });
  var f = { lot: document.getElementById("f-lot"), size: document.getElementById("f-size"), price: document.getElementById("f-price"), status: document.getElementById("f-status") };
  var picked = document.getElementById("picked");
  var hit = lots.filter(function (l) { return l.el.classList.contains("is-hit"); })[0] || null, chosen = null;
  function money(n) { return "RM " + Math.round(n).toLocaleString("en-MY"); }
  function m2(n) { return n.toLocaleString("en-MY", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " m²"; }
  function at(x, y) {
    for (var i = 0; i < lots.length; i++) { var l = lots[i]; if (x >= l.x && x <= l.x + l.w && y >= l.y && y <= l.y + l.h) return l; }
    return null;
  }
  function line(l) { return l.name + ", " + m2(l.area) + ", " + money(l.area * RATE) + (l.sold ? ", sold" : ", open"); }
  map.addEventListener("ch-move", function (e) {
    var l = at(e.detail.x, e.detail.y);
    if (l === hit) return;
    if (hit) hit.el.classList.remove("is-hit");
    hit = l;
    if (!l) { f.lot.textContent = "Road or open space"; f.size.textContent = f.price.textContent = f.status.textContent = "-"; }
    else {
      l.el.classList.add("is-hit");
      f.lot.textContent = l.name; f.size.textContent = m2(l.area); f.price.textContent = money(l.area * RATE);
      f.status.textContent = l.sold ? "Sold" : "Open";
    }
    if (e.detail.by === "key") picked.textContent = l ? line(l) : "Road or open space.";
  });
  map.addEventListener("ch-pick", function () {
    if (!hit) { picked.textContent = "That is the road or open space. Pick a lot."; return; }
    if (hit.sold) { picked.textContent = hit.name + " is sold. Try the lot next to it."; return; }
    if (chosen) chosen.el.classList.remove("is-picked");
    chosen = hit;
    chosen.el.classList.add("is-picked");
    picked.textContent = "Picked " + line(chosen) + ". Site visit Saturday, 10:30 am.";
  });
})();
