/*
 * image-trail.js: in every .it, each time the pointer (mouse, pen or a dragging finger) travels
 * data-trail-gap px (default 80), the next image from a fixed pool of data-trail-pool (default 8)
 * pops in under it, holds, and fades over data-trail-life ms (default 1100).
 * The pool is filled from the images in .it-strip. On load it draws one short arc so the frame is
 * not empty. Off under reduced motion: the strip stays.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function num(el, name, fallback) {
    var v = parseFloat(el.getAttribute(name));
    return isNaN(v) ? fallback : v;
  }

  function setup(area) {
    var srcs = [].map.call(area.querySelectorAll(".it-strip img"), function (i) { return i.getAttribute("src"); });
    if (!srcs.length || !Element.prototype.animate) return;
    var gap = num(area, "data-trail-gap", 80);
    var life = num(area, "data-trail-life", 1100);
    var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";
    var layer = document.createElement("div");
    layer.className = "it-layer";
    layer.setAttribute("aria-hidden", "true");
    area.insertBefore(layer, area.firstChild);
    var pool = [];
    for (var i = 0; i < num(area, "data-trail-pool", 8); i++) {
      var img = document.createElement("img");
      img.className = "it-shot";
      img.alt = "";
      img.src = srcs[i % srcs.length];
      layer.appendChild(img);
      pool.push({ el: img, anim: null });
    }
    var next = 0, z = 1, lastX = null, lastY = null, travel = 0, intro = [];

    function drop(x, y, dx, dy) {
      var p = pool[next];
      next = (next + 1) % pool.length;
      if (p.anim) p.anim.cancel();
      if (z > 9999) { z = 1; pool.forEach(function (q) { q.el.style.zIndex = 1; }); }
      p.el.style.left = x + "px";
      p.el.style.top = y + "px";
      p.el.style.zIndex = ++z;
      // tilt a little, and keep drifting the way the hand moved
      var r = (Math.random() * 14 - 7).toFixed(1) + "deg";
      var len = Math.hypot(dx, dy) || 1;
      var mx = (dx / len * 14).toFixed(1) + "px", my = (dy / len * 14).toFixed(1) + "px";
      var at = "translate(-50%, -50%) ";
      p.anim = p.el.animate([
        { opacity: 0, transform: at + "scale(.55) rotate(" + r + ")", easing: ease },
        { opacity: 1, transform: at + "scale(1) rotate(" + r + ")", offset: 0.2 },
        { opacity: 1, transform: at + "translate(" + mx + ", " + my + ") scale(1) rotate(" + r + ")", offset: 0.6, easing: "ease-in" },
        { opacity: 0, transform: at + "translate(" + mx + ", " + my + ") scale(.86) rotate(" + r + ")" }
      ], { duration: life, fill: "both" });
    }

    function move(e) {
      if (still.matches) return;
      var b = area.getBoundingClientRect();
      var x = e.clientX - b.left, y = e.clientY - b.top;
      if (lastX === null) { lastX = x; lastY = y; return; }
      var dx = x - lastX, dy = y - lastY;
      travel += Math.hypot(dx, dy);
      if (travel >= gap) { travel = 0; drop(x, y, dx, dy); }
      lastX = x; lastY = y;
    }
    function reset() { lastX = null; travel = 0; }

    function playIntro() {
      var b = area.getBoundingClientRect();
      for (var k = 0; k < 6; k++) {
        (function (k) {
          intro.push(setTimeout(function () {
            var t = k / 5;
            drop(b.width * (0.18 + 0.64 * t), b.height * (0.62 - 0.3 * Math.sin(Math.PI * t)), 1, -0.2 + 0.4 * t);
          }, 300 + k * 130));
        })(k);
      }
    }

    function sync() {
      var live = !still.matches;
      area.classList.toggle("it-live", live);
      if (!live) {
        intro.forEach(clearTimeout);
        pool.forEach(function (p) { if (p.anim) p.anim.cancel(); });
      }
      return live;
    }

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerdown", reset);
    area.addEventListener("pointerleave", reset);
    area.addEventListener("pointercancel", reset);
    still.addEventListener("change", sync);
    if (sync()) playIntro();
  }

  function start() { document.querySelectorAll(".it").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
