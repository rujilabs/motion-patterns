/*
 * flowing-menu-row.js: works out which edge of a .fm-row the pointer came in or went out by (top or
 * bottom half) and sets data-edge, then adds or removes .is-on so the band slides from or to that edge.
 * Keyboard focus floods the row from the top. Before a band comes in, it is moved to the right edge
 * with no transition, so it never sweeps across the row on its way there.
 */
(function () {
  function edge(row, y) {
    var r = row.getBoundingClientRect();
    return y < r.top + r.height / 2 ? "top" : "bottom";
  }
  function setup(row) {
    var band = row.querySelector(".fm-band");
    if (!band || row._fm) return;
    row._fm = true;
    var track = row.querySelector(".fm-track");
    function enter(from) {
      if (row.classList.contains("is-on")) return;
      band.style.transition = track.style.transition = "none";
      row.dataset.edge = from;
      void band.offsetWidth;
      band.style.transition = track.style.transition = "";
      row.classList.add("is-on");
    }
    function leave(to) {
      row.dataset.edge = to;
      row.classList.remove("is-on");
    }
    row.addEventListener("pointerenter", function (e) { enter(edge(row, e.clientY)); });
    row.addEventListener("pointerleave", function (e) {
      if (!row.matches(":focus-visible")) leave(edge(row, e.clientY));
    });
    row.addEventListener("focus", function () { if (row.matches(":focus-visible")) enter("top"); });
    row.addEventListener("blur", function () { if (!row.matches(":hover")) leave("bottom"); });
  }
  function init() { document.querySelectorAll(".fm-row").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
