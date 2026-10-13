/*
 * Paper diorama hero: pointer depth. Sets --mx and --my (each -1 to 1) on .scene; every layer
 * moves by its own --d in CSS, so near layers travel further than far ones. The values ease
 * towards the pointer on requestAnimationFrame and the loop stops as soon as they arrive.
 * Does nothing under reduced motion.
 */
(function () {
  var scene = document.querySelector(".scene");
  if (!scene) return;
  var host = scene.closest(".hero") || document.body;
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var tx = 0, ty = 0, x = 0, y = 0, raf = 0;

  function write() {
    scene.style.setProperty("--mx", x.toFixed(4));
    scene.style.setProperty("--my", y.toFixed(4));
  }
  function tick() {
    x += (tx - x) * 0.07;
    y += (ty - y) * 0.07;
    if (Math.abs(tx - x) < 0.0008 && Math.abs(ty - y) < 0.0008) {
      x = tx; y = ty; raf = 0;
    } else {
      raf = requestAnimationFrame(tick);
    }
    write();
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  host.addEventListener("pointermove", function (e) {
    if (reduce && reduce.matches) return;
    var r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    kick();
  }, { passive: true });
  host.addEventListener("pointerleave", function () { tx = 0; ty = 0; kick(); });

  if (reduce && reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (!reduce.matches) return;
      if (raf) cancelAnimationFrame(raf);
      raf = 0; tx = ty = x = y = 0;
      scene.style.removeProperty("--mx");
      scene.style.removeProperty("--my");
    });
  }
})();
