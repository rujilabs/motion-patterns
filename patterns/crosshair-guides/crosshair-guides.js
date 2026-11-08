/*
 * crosshair-guides.js: on every .ch, a vertical and a horizontal guide line and a coordinate tag
 * follow the pointer (mouse, pen, a tap or a sideways drag), gliding the last few px so they read
 * as instruments, not as a second cursor. The coordinates are in the plan's own units:
 *   <div class="ch" tabindex="0" data-ch-width="240" data-ch-height="180" data-ch-start="108.6 43.2" data-ch-unit="m">
 *     ...your map or plan, filling the box...
 *     <span class="ch-v" aria-hidden="true"></span><span class="ch-h" aria-hidden="true"></span>
 *     <span class="ch-tag" aria-hidden="true"></span>
 *   </div>
 * The tag shows east and north (north counts up from the bottom edge). Arrow keys move 1 unit,
 * Shift with an arrow 10. Click, tap, Enter or Space fires "ch-pick"; every change fires "ch-move".
 * Both carry detail { x, y, n, by }: x east, y down from the top, n north, by "pointer" or "key".
 * The guides draw in once when the plan comes into view (Web Animations, so the gallery timeline
 * shows them). Under reduced motion they jump straight to the point, with no glide and no draw-in.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(map) {
    var v = map.querySelector(".ch-v"), hl = map.querySelector(".ch-h"), tag = map.querySelector(".ch-tag");
    if (!v || !hl || !tag) return;
    var MW = +map.getAttribute("data-ch-width") || 100, MH = +map.getAttribute("data-ch-height") || 100;
    var unit = map.getAttribute("data-ch-unit") || "";
    var start = (map.getAttribute("data-ch-start") || "").split(/\s+/).map(Number);
    var tx = isNaN(start[0]) ? MW / 2 : start[0], ty = isNaN(start[1]) ? MH / 2 : start[1];
    var x = tx, y = ty, W = 0, H = 0, raf = 0, last = 0, by = "pointer", said = "";
    var tagW = 0, tagH = 0;

    function clampX(a) { return Math.max(0, Math.min(MW, a)); }
    function clampY(a) { return Math.max(0, Math.min(MH, a)); }
    function fmt(a) { return (Math.round(a * 10) / 10).toFixed(1); }

    function place() {
      var px = x / MW * W, py = y / MH * H;
      v.style.transform = "translateX(" + Math.round(px) + "px)";    // whole px keep the dashes crisp
      hl.style.transform = "translateY(" + Math.round(py) + "px)";
      var text = "E " + fmt(x) + " " + unit + " \u00b7 N " + fmt(MH - y) + " " + unit;
      if (text !== tag.textContent) { tag.textContent = text; tagW = tag.offsetWidth; tagH = tag.offsetHeight; }
      // sit below right of the crossing; flip to the other side near an edge
      var lx = px + 10 + tagW > W - 4 ? px - 10 - tagW : px + 10;
      var ly = py + 10 + tagH > H - 4 ? py - 10 - tagH : py + 10;
      tag.style.transform = "translate(" + lx.toFixed(1) + "px, " + ly.toFixed(1) + "px)";
    }
    function report() {
      var key = fmt(tx) + "," + fmt(ty);
      if (key === said) return;
      said = key;
      map.dispatchEvent(new CustomEvent("ch-move", { bubbles: true, detail: { x: tx, y: ty, n: MH - ty, by: by } }));
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      var k = 1 - Math.exp(-dt / 55);
      x += (tx - x) * k; y += (ty - y) * k;
      var done = Math.abs(tx - x) < MW * 0.0005 && Math.abs(ty - y) < MH * 0.0005;
      if (done) { x = tx; y = ty; }
      place();
      if (!done && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function go(nx, ny, source) {
      tx = clampX(nx); ty = clampY(ny); by = source;
      report();
      if (reduce.matches || document.hidden) { x = tx; y = ty; place(); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function fromPointer(e) {
      var b = map.getBoundingClientRect();
      go((e.clientX - b.left) / b.width * MW, (e.clientY - b.top) / b.height * MH, "pointer");
    }
    function pick(source) {
      map.dispatchEvent(new CustomEvent("ch-pick", { bubbles: true, detail: { x: tx, y: ty, n: MH - ty, by: source } }));
    }
    map.addEventListener("pointermove", fromPointer);
    map.addEventListener("pointerdown", fromPointer);
    map.addEventListener("click", function () { pick("pointer"); });
    map.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 1;
      var d = { ArrowRight: [step, 0], ArrowLeft: [-step, 0], ArrowDown: [0, step], ArrowUp: [0, -step] }[e.key];
      if (d) { e.preventDefault(); go(tx + d[0], ty + d[1], "key"); return; }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick("key"); }
    });

    function fit() {
      var b = map.getBoundingClientRect();
      W = b.width; H = b.height;
      tag.textContent = ""; place();
    }
    fit();
    map.classList.add("ch-live");
    report();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(map); else window.addEventListener("resize", fit);

    // the guides draw in from the edges, once, when the plan is first seen
    if (!reduce.matches && v.animate && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";
        var opt = { duration: 700, easing: ease, fill: "backwards" };
        v.animate([{ scale: "1 0" }, { scale: "1 1" }], opt).id = "vertical guide draws in";
        hl.animate([{ scale: "0 1" }, { scale: "1 1" }], opt).id = "horizontal guide draws in";
        tag.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 450, fill: "backwards" }).id = "coordinates show";
      }, { threshold: 0.4 });
      io.observe(map);
    }
  }

  function start() { document.querySelectorAll(".ch").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
