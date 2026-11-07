/* Finds the pick, centres the zoom on it, and orders the neighbours by how far they are from it. */
(function () {
  var world = document.querySelector(".pb-world"), pick = document.querySelector(".is-pick");
  var W = world.getBoundingClientRect(), P = pick.getBoundingClientRect();
  var cx = P.left + P.width / 2, cy = P.top + P.height / 2;
  world.style.setProperty("--ox", (cx - W.left) + "px");
  world.style.setProperty("--oy", (cy - W.top) + "px");
  world.style.setProperty("--from", (W.height / P.height).toFixed(2));
  var items = [].slice.call(document.querySelectorAll(".pb-item")), far = 1;
  var ds = items.map(function (el) { var r = el.getBoundingClientRect(); var d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy); far = Math.max(far, d); return d; });
  items.forEach(function (el, i) { el.style.setProperty("--d", (ds[i] / far).toFixed(2)); });
})();
/* Restarts every CSS animation in the demo: hiding the frame for one layout drops them, showing it starts them again. */
document.querySelectorAll("[data-replay]").forEach(function (b) {
  b.addEventListener("click", function () {
    var f = b.closest(".frame");
    f.style.display = "none";
    void f.offsetWidth;
    f.style.display = "";
  });
});
