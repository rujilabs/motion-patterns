/*
 * tile-filter-flip.js: a grid of tiles that turn over to show new results. Each tile is a real card
 * with two faces; the new content is written on the face that is turned away, then the card turns
 * half a turn and the new face lands in front. The turns start in a ripple: a tile waits in
 * proportion to its distance from the point the change came from (the chip that was pressed), and
 * it tips away from that point, about the axis at right angles to it. Faces darken as they turn
 * edge on to the viewer. A tile whose content does not change stays still.
 *
 *   <ul class="tile-flip">
 *     <li class="tf-tile"><div class="tf-card"><div class="tf-face">...</div></div></li>
 *   </ul>
 *
 *   grid.tileFlip(contents, fromElement)
 *
 * contents: one entry per tile, in order. A DOM node (give it a data-key so unchanged tiles can be
 * left alone) or null for an empty tile. Extra tiles get null. fromElement: an element or {x, y}
 * in client pixels; the ripple starts there. Without it, it starts at the first tile.
 * Fires "tileflipend" on the grid when the last tile lands. Under reduced motion, faces swap at once.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function num(el, name, fallback) {
    var v = parseFloat(getComputedStyle(el).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }
  function centre(r) { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  function setup(grid) {
    if (grid.tileFlip) return;
    var tiles = Array.prototype.slice.call(grid.querySelectorAll(".tf-tile"));
    var state = tiles.map(function (tile) {
      var card = tile.querySelector(".tf-card");
      var faces = card.querySelectorAll(".tf-face");
      var front = faces[0], back = faces[1];
      if (!back) {
        back = document.createElement("div");
        back.className = "tf-face";
        card.appendChild(back);
      }
      hide(back, "rotateY(180deg)");
      return { tile: tile, card: card, shown: front, hidden: back, anim: null, key: keyOf(front) };
    });

    function keyOf(face) {
      var k = face.firstElementChild;
      return k && k.dataset ? (k.dataset.key || null) : null;
    }
    function hide(face, transform) {
      face.style.transform = transform;
      face.setAttribute("aria-hidden", "true");
      face.inert = true;
    }
    function show(face) {
      face.style.transform = "none";
      face.removeAttribute("aria-hidden");
      face.inert = false;
    }
    function fill(face, node) {
      face.replaceChildren();
      face.classList.toggle("tf-empty", !node);
      if (node) face.appendChild(node);
    }
    // the turn is over: put the card back at rest and make the new face the front one
    function settle(s, axis) {
      if (s.anim) { s.anim.cancel(); s.anim = null; }
      s.shown.getAnimations().forEach(function (a) { a.cancel(); });
      s.hidden.getAnimations().forEach(function (a) { a.cancel(); });
      var out = s.shown;
      s.shown = s.hidden;
      s.hidden = out;
      show(s.shown);
      hide(s.hidden, "rotate3d(" + axis + ",180deg)");
      s.tile.classList.remove("tf-busy");
    }

    grid.tileFlip = function (contents, from) {
      var turn = num(grid, "--tf-turn", 680);
      var spread = num(grid, "--tf-spread", 60) / 100; // ms per pixel of distance
      var lift = num(grid, "--tf-lift", 24);
      var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-spring").trim() || "ease-out";
      var o;
      if (from && from.getBoundingClientRect) o = centre(from.getBoundingClientRect());
      else if (from && typeof from.x === "number") o = from;
      else o = centre(tiles[0].getBoundingClientRect());

      var pending = 0, latest = 0;
      state.forEach(function (s, i) {
        // a turn still running lands first, so the faces are where we think they are
        if (s.anim) settle(s, s.axis);
        var node = contents[i] || null;
        var key = node && node.dataset ? (node.dataset.key || null) : null;
        if (node && key && key === s.key) return;
        if (!node && s.key === null && s.shown.classList.contains("tf-empty")) return;
        s.key = key;
        fill(s.hidden, node);

        if (reduce.matches || !s.card.animate) {
          settle(s, "0,1,0");
          return;
        }
        var c = centre(s.tile.getBoundingClientRect());
        var dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy);
        // tip away from the origin: rotate about the axis at right angles to the line from it
        var ax = d < 1 ? 0 : -dy / d, ay = d < 1 ? 1 : dx / d;
        var axis = ax.toFixed(3) + "," + ay.toFixed(3) + ",0";
        var delay = Math.round(d * spread);
        latest = Math.max(latest, delay);
        s.hidden.style.transform = "rotate3d(" + axis + ",180deg)";
        s.axis = axis;
        s.tile.classList.add("tf-busy");
        var timing = { duration: turn, delay: delay, easing: ease, fill: "both" };
        s.anim = s.card.animate([
          { transform: "translateZ(0) rotate3d(" + axis + ",0deg)" },
          { transform: "translateZ(" + lift + "px) rotate3d(" + axis + ",90deg)", offset: 0.45 },
          { transform: "translateZ(0) rotate3d(" + axis + ",180deg)" }
        ], timing);
        // shading follows the angle: a face is darkest edge on, when it turns furthest from the light
        var shade = { duration: turn * 0.6, delay: delay, easing: "linear", fill: "both" };
        s.shown.animate([{ filter: "brightness(1)" }, { filter: "brightness(.55)" }], shade);
        s.hidden.animate([{ filter: "brightness(.55)" }, { filter: "brightness(1)" }],
          { duration: turn * 0.5, delay: delay + turn * 0.3, easing: "ease-out", fill: "both" });
        pending++;
        var anim = s.anim;
        anim.onfinish = function () {
          if (s.anim !== anim) return;
          settle(s, axis);
          if (--pending === 0) grid.dispatchEvent(new CustomEvent("tileflipend"));
        };
      });
      if (!pending) grid.dispatchEvent(new CustomEvent("tileflipend"));
    };
  }

  function init() { document.querySelectorAll(".tile-flip").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
