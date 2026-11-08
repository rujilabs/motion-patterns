/*
 * cube-grid-tilt.js: in every .cg-grid, each .cg-cube turns to face a point data-cg-lamp px (default 320)
 * in front of the grid, under the pointer (mouse, pen or a dragging finger) anywhere over the grid's
 * [data-cg-area] ancestor (or the grid itself), or in front of the cube with keyboard focus. Near cubes
 * face it almost square on, far ones turn up to data-cg-max degrees (default 22). When the pointer leaves, the cubes ease back flat.
 * Clicking a cube (or Enter or Space on it) chooses it: aria-pressed turns true and it rolls to its top
 * face; the cube chosen before rolls back. Choose it again to put it back. A "cg-choose" event fires.
 * The tilt is off under reduced motion; choosing still works.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(grid) {
    var cubes = [].slice.call(grid.querySelectorAll(".cg-cube"));
    if (!cubes.length) return;
    var bodies = cubes.map(function (c) { return c.querySelector(".cg-body"); });
    var N = cubes.length, lamp = parseFloat(grid.getAttribute("data-cg-lamp")) || 320;
    var max = parseFloat(grid.getAttribute("data-cg-max")) || 22;
    var area = grid.closest("[data-cg-area]") || grid;
    var cx = new Float32Array(N), cy = new Float32Array(N), rx = new Float32Array(N), ry = new Float32Array(N);
    var aim = false, ax = 0, ay = 0, raf = 0;

    function measure() {
      for (var i = 0; i < N; i++) {
        var b = cubes[i].getBoundingClientRect();
        cx[i] = b.left + b.width / 2; cy[i] = b.top + b.height / 2;
      }
    }
    function frame() {
      raf = 0;
      var busy = false, k = 0.16;
      for (var i = 0; i < N; i++) {
        var tx = 0, ty = 0;
        if (aim) {
          tx = Math.max(-max, Math.min(max, -Math.atan2(ay - cy[i], lamp) * 57.3));
          ty = Math.max(-max, Math.min(max, Math.atan2(ax - cx[i], lamp) * 57.3));
        }
        var ex = tx - rx[i], ey = ty - ry[i];
        if (Math.abs(ex) > 0.05 || Math.abs(ey) > 0.05) busy = true;
        rx[i] += ex * k; ry[i] += ey * k;
        bodies[i].style.setProperty("--cg-rx", rx[i].toFixed(2) + "deg");
        bodies[i].style.setProperty("--cg-ry", ry[i].toFixed(2) + "deg");
      }
      if (busy) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still.matches) raf = requestAnimationFrame(frame); }
    function at(x, y) { measure(); aim = true; ax = x; ay = y; kick(); }

    area.addEventListener("pointermove", function (e) { at(e.clientX, e.clientY); });
    area.addEventListener("pointerdown", function (e) { at(e.clientX, e.clientY); });
    area.addEventListener("pointerleave", function () { aim = false; kick(); });
    grid.addEventListener("focusin", function (e) {
      var c = e.target.closest(".cg-cube");
      if (!c || !c.matches(":focus-visible")) return;
      var b = c.getBoundingClientRect();
      at(b.left + b.width / 2, b.top + b.height / 2);
    });
    grid.addEventListener("focusout", function () { aim = false; kick(); });
    cubes.forEach(function (c) {
      c.addEventListener("click", function () {
        var on = c.getAttribute("aria-pressed") !== "true";
        cubes.forEach(function (o) { if (o !== c) o.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", on ? "true" : "false");
        grid.dispatchEvent(new CustomEvent("cg-choose", { bubbles: true, detail: { cube: on ? c : null } }));
      });
    });
    still.addEventListener("change", function () {
      if (!still.matches) return;
      aim = false;
      for (var i = 0; i < N; i++) { rx[i] = ry[i] = 0; bodies[i].style.removeProperty("--cg-rx"); bodies[i].style.removeProperty("--cg-ry"); }
    });
  }

  function init() { document.querySelectorAll(".cg-grid").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
