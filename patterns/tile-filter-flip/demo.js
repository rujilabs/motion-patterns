// Demo only: the filter chips. Reads the 12 projects from the page once, then hands each filtered
// list to grid.tileFlip() with the pressed chip as the origin of the ripple.
(function () {
  var grid = document.getElementById("grid");
  var status = document.getElementById("status");
  var chips = document.querySelectorAll(".chip");
  if (!grid || !grid.tileFlip) return;
  var projects = Array.prototype.map.call(grid.querySelectorAll(".pj"), function (p) { return p.cloneNode(true); });
  var names = { home: ["home", "homes"], shop: ["shophouse", "shophouses"], cafe: ["cafe", "cafes"], civic: ["civic building", "civic buildings"] };

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (chip.getAttribute("aria-pressed") === "true") return;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      var kind = chip.dataset.kind;
      var list = projects.filter(function (p) { return kind === "all" || p.dataset.kind === kind; })
        .map(function (p) { return p.cloneNode(true); });
      grid.tileFlip(list, chip);
      var n = list.length;
      status.textContent = kind === "all"
        ? "Showing all 12 projects, newest first."
        : "Showing " + n + " " + names[kind][n === 1 ? 0 : 1] + ", newest first.";
    });
  });
  // the project links are placeholders in this demo
  grid.addEventListener("click", function (e) { if (e.target.closest(".pj")) e.preventDefault(); });
})();
