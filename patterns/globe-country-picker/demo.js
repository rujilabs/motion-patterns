// Demo only: a single-select listbox that sets data-lon, data-lat, data-label and data-spots on the globe.
(function () {
  var list = document.getElementById("countries");
  var globe = document.getElementById("globe");
  var opts = Array.prototype.slice.call(list.querySelectorAll("[role=option]"));
  var GOODS = 76;
  var i = opts.findIndex(function (o) { return o.getAttribute("aria-selected") === "true"; });

  function select(n, turn) {
    n = Math.max(0, Math.min(opts.length - 1, n));
    if (n === i && turn) return;
    opts[i].setAttribute("aria-selected", "false");
    i = n;
    var o = opts[i], name = o.firstElementChild.textContent, fee = +o.dataset.fee;
    o.setAttribute("aria-selected", "true");
    list.setAttribute("aria-activedescendant", o.id);
    o.scrollIntoView({ block: "nearest" });
    document.getElementById("fee").textContent = "RM " + fee.toFixed(2);
    document.getElementById("days").textContent = o.dataset.days;
    document.getElementById("total").textContent = "RM " + (GOODS + fee).toFixed(2);
    globe.setAttribute("aria-label", "Globe turned to " + name + ". Drag or use the arrow keys to turn it, Home to come back.");
    globe.dataset.label = name;
    globe.dataset.spots = o.dataset.spots;
    globe.dataset.lat = o.dataset.lat;
    globe.dataset.lon = o.dataset.lon;
  }

  list.addEventListener("click", function (e) {
    var o = e.target.closest("[role=option]");
    if (o) select(opts.indexOf(o), true);
  });
  list.addEventListener("keydown", function (e) {
    var n = i;
    if (e.key === "ArrowDown") n = i + 1;
    else if (e.key === "ArrowUp") n = i - 1;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = opts.length - 1;
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      // type a letter to jump to the next country starting with it
      var k = e.key.toLowerCase();
      for (var s = 1; s <= opts.length; s++) {
        var c = opts[(i + s) % opts.length];
        if (c.textContent.trim().toLowerCase()[0] === k) { n = (i + s) % opts.length; break; }
      }
    } else return;
    e.preventDefault();
    select(n, true);
  });
})();
