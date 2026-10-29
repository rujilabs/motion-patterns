// Demo only: houses for the map, and the address under the pin. The pin and its ripple are wave-pin-ripple.js.
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var map = document.getElementById("map");
  var lotsG = document.getElementById("lots");
  var addr = document.getElementById("addr");
  var BLOCKS = [[6, 93], [107, 229], [243, 345], [359, 418]];
  // each street: its y, the row of houses above it (facing down onto it) and below it (facing up)
  var STREETS = [
    { name: "Jalan SS 2/21", y: 54, above: [10, 44], below: [64, 100] },
    { name: "Jalan SS 2/24", y: 150, above: [104, 140], below: [160, 196] },
    { name: "Jalan SS 2/30", y: 246, above: [200, 236], below: [256, 292] }
  ];
  var PARK = { x0: 243, x1: 345, y0: 157, y1: 239 };
  var lots = [];
  STREETS.forEach(function (s) {
    ["above", "below"].forEach(function (side) {
      var i = 0, r = s[side];
      BLOCKS.forEach(function (b) {
        if (b[0] < PARK.x1 && b[1] > PARK.x0 && r[1] > PARK.y0 && r[0] < PARK.y1) return;
        var n = Math.floor((b[1] - b[0] + 2) / 18), x = b[0] + (b[1] - b[0] - (n * 18 - 2)) / 2;
        for (var k = 0; k < n; k++, i++) {
          var lot = { x: x + k * 18, y: r[0], w: 16, h: r[1] - r[0], street: s.name, no: side === "above" ? 2 * i + 1 : 2 * i + 2 };
          lot.gx = lot.x + 8; lot.gy = side === "above" ? r[1] + 1 : r[0] - 1;
          lots.push(lot);
          var rect = document.createElementNS(NS, "rect");
          ["x", "y", "width", "height"].forEach(function (a, j) { rect.setAttribute(a, [lot.x, lot.y, lot.w, lot.h][j]); });
          rect.setAttribute("rx", "1.5");
          lotsG.appendChild(rect);
          lot.el = rect;
        }
      });
    });
  });

  var picked = null;
  function where(x, y) {
    if (x > PARK.x0 && x < PARK.x1 && y > PARK.y0 && y < PARK.y1) return { park: true };
    var best = null, bd = Infinity;
    lots.forEach(function (l) {
      var dx = Math.max(l.x - x, 0, x - l.x - l.w), dy = Math.max(l.y - y, 0, y - l.y - l.h), d = Math.hypot(dx, dy);
      if (d < bd) { bd = d; best = l; }
    });
    return { lot: best, near: bd > 3 };
  }
  function show(final) {
    var w = where(+map.dataset.x, +map.dataset.y);
    if (picked) picked.el.classList.remove("is-picked");
    picked = null;
    var main, sub = "SS 2, 47300 Petaling Jaya, Selangor";
    if (w.park) { main = "Padang SS 2, the field"; sub = "Riders cannot stop here. Move the pin to a house."; }
    else {
      picked = w.lot;
      picked.el.classList.add("is-picked");
      main = (w.near ? "Near No. " : "No. ") + w.lot.no + ", " + w.lot.street;
    }
    addr.innerHTML = "<strong></strong><span></span>";
    addr.firstChild.textContent = main;
    addr.lastChild.textContent = sub;
    addr.classList.toggle("is-moving", !final);
    document.getElementById("confirm").disabled = !!w.park;
  }
  map.addEventListener("move", function () { show(false); });
  map.addEventListener("drop", function () { show(true); });
  document.getElementById("confirm").addEventListener("click", function () {
    addr.lastChild.textContent = "Saved. Your rider will stop at this gate.";
  });
  show(true);
})();
