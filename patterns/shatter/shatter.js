/*
 * shatter.js: breaks the current view of a [data-shatter] stack into shards that fall away,
 * showing the next view. Buttons with data-shatter-go and aria-controls="<stack id>" start it
 * from a point near the middle; a click on the stack itself starts it from the pointer.
 * Shards are copies of the old view cut with clip-path and moved with element.animate().
 * The stack fires "shatterchange" with the new index. Reduced motion swaps the views at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAYS = 10;

  function token(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  // Shards around an impact point: a ring of small triangles, then two rings of larger pieces.
  function shards(x, y, w, h) {
    var d = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
    var rings = [0, d * (0.16 + Math.random() * 0.06), d * (0.45 + Math.random() * 0.1), d * 1.6];
    var start = Math.random() * Math.PI * 2;
    var angles = [];
    for (var k = 0; k < RAYS; k++) angles.push(start + (k + (Math.random() - 0.5) * 0.6) * (Math.PI * 2 / RAYS));
    function pt(r, k) {
      var a = angles[k % RAYS], wob = r ? 1 + (Math.random() - 0.5) * 0.25 : 0;
      return [x + Math.cos(a) * r * wob, y + Math.sin(a) * r * wob];
    }
    var grid = rings.map(function (r) { return angles.map(function (_, k) { return pt(r, k); }); });
    var out = [];
    for (var ring = 0; ring < rings.length - 1; ring++) {
      for (var k = 0; k < RAYS; k++) {
        var n = (k + 1) % RAYS;
        var poly = ring === 0 ? [grid[0][0], grid[1][k], grid[1][n]] : [grid[ring][k], grid[ring + 1][k], grid[ring + 1][n], grid[ring][n]];
        out.push({ poly: poly, ring: ring });
      }
    }
    return out;
  }

  function setup(stack) {
    var views = Array.prototype.filter.call(stack.children, function (c) { return !c.classList.contains("shatter-shards"); });
    var i = Math.max(0, views.findIndex(function (v) { return v.classList.contains("is-current"); }));
    var busy = false;
    views.forEach(function (v, n) { v.classList.toggle("is-current", n === i); v.inert = n !== i; });

    function swap() {
      var next = (i + 1) % views.length;
      views[i].classList.remove("is-current"); views[i].inert = true;
      views[next].classList.add("is-current"); views[next].inert = false;
      i = next;
      stack.dispatchEvent(new CustomEvent("shatterchange", { detail: { index: i } }));
    }

    function go(px, py) {
      if (busy) return;
      if (reduce.matches) { swap(); return; }
      busy = true;
      var r = stack.getBoundingClientRect(), w = r.width, h = r.height;
      var x = px == null ? w * 0.56 : px, y = py == null ? h * 0.42 : py;
      var old = views[i];
      var layer = document.createElement("div");
      layer.className = "shatter-shards";
      layer.setAttribute("aria-hidden", "true");
      var easeOut = token("--ease-out", "ease-out"), easeIn = token("--ease-in", "ease-in");
      var runs = [];
      var d = Math.hypot(w, h);
      shards(x, y, w, h).forEach(function (s) {
        var piece = document.createElement("div");
        piece.className = "shatter-shard";
        var copy = old.cloneNode(true);
        copy.removeAttribute("id");
        copy.inert = true;
        copy.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
        piece.appendChild(copy);
        piece.style.clipPath = "polygon(" + s.poly.map(function (p) { return p[0].toFixed(1) + "px " + p[1].toFixed(1) + "px"; }).join(",") + ")";
        var cx = 0, cy = 0;
        s.poly.forEach(function (p) { cx += p[0]; cy += p[1]; });
        cx /= s.poly.length; cy /= s.poly.length;
        piece.style.transformOrigin = cx.toFixed(1) + "px " + cy.toFixed(1) + "px";
        var dx = cx - x, dy = cy - y, len = Math.hypot(dx, dy) || 1;
        var ux = dx / len, uy = dy / len;
        var spin = (Math.random() - 0.5) * 70;
        var fall = h * 1.15 + Math.random() * h * 0.3 - cy * 0.2;
        var jolt = 3 + s.ring * 2;
        layer.appendChild(piece);
        runs.push({ el: piece, delay: (len / d) * 320, frames: [
          { transform: "none", offset: 0, easing: easeOut },
          { transform: "translate(" + (ux * jolt).toFixed(1) + "px," + (uy * jolt).toFixed(1) + "px)", offset: 0.14, easing: easeIn },
          { transform: "translate(" + (ux * (40 + s.ring * 30)).toFixed(1) + "px," + fall.toFixed(1) + "px) rotate(" + spin.toFixed(1) + "deg)", offset: 1 }
        ] });
      });
      stack.appendChild(layer);
      swap();
      var dur = parseFloat(token("--dur-slow", "900ms")) * 1.3 || 1170;
      var anims = runs.map(function (r) {
        return r.el.animate(r.frames, { duration: dur, delay: r.delay, fill: "both" });
      });
      Promise.all(anims.map(function (a) { return a.finished; })).catch(function () {}).then(function () {
        layer.remove();
        busy = false;
      });
    }

    document.querySelectorAll('[data-shatter-go][aria-controls="' + stack.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function () { go(); });
    });
    stack.addEventListener("click", function (e) {
      var r = stack.getBoundingClientRect();
      go(e.clientX - r.left, e.clientY - r.top);
    });
  }

  function start() { document.querySelectorAll("[data-shatter]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
