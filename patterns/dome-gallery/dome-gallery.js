/*
 * dome-gallery.js: every .dg puts its .dg-tile items on the inside of a dome around the viewer, in
 * rows: data-dg-cols tiles per row (default 10), one row per angle in data-dg-pitch, bottom row first
 * (default "10 -18"; negative is above eye level). Odd rows sit half a column over, like brickwork.
 * Drag to look around (mouse: both ways; finger: sideways, so the page still scrolls); on release it
 * coasts to the nearest tile. Arrow keys turn one tile at a time, Enter or a click opens the facing
 * tile in .dg-open, and Escape closes it. The status line [data-dg-status] names the facing tile.
 * Turns are Web Animations. Under reduced motion turns are instant and nothing coasts.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function token(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
  function wrap(a) { return ((a % 360) + 540) % 360 - 180; }

  function setup(dg) {
    var sphere = dg.querySelector(".dg-sphere");
    var tiles = [].slice.call(dg.querySelectorAll(".dg-tile"));
    if (!sphere || !tiles.length || !Element.prototype.animate) return;
    var root = dg.closest("section, article, body") || document.body;
    var status = root.querySelector("[data-dg-status]");
    var panel = root.querySelector(".dg-open");
    var cols = parseInt(dg.getAttribute("data-dg-cols"), 10) || 10;
    var pitches = (dg.getAttribute("data-dg-pitch") || "10 -18").split(/\s+/).map(Number);
    var step = 360 / cols;
    var easeOut = token("--ease-out", "ease-out");
    var yaw = 0, pitch = 0, anim = null, from = null, to = null, drag = null, facing = null, lastFocus = null;

    // where each tile sits: its turn (ty) and its height (tx)
    var spots = tiles.map(function (t, i) {
      var row = Math.floor(i / cols), col = i % cols;
      var ty = col * step + (row % 2 ? step / 2 : 0), tx = pitches[row] !== undefined ? pitches[row] : 0;
      t.style.transform = "rotateY(" + ty + "deg) rotateX(" + tx + "deg) translateZ(calc(-1 * var(--dg-r, 560px)))";
      return { ty: ty, tx: tx, row: row };
    });
    var lowest = Math.min.apply(null, pitches), highest = Math.max.apply(null, pitches);
    dg.classList.add("is-live");

    function paint(y, p) {
      sphere.style.transform = "translateZ(var(--dg-z, 360px)) rotateX(" + p.toFixed(2) + "deg) rotateY(" + y.toFixed(2) + "deg)";
    }
    // hide tiles well behind the viewer, so none is drawn from behind the camera
    function cull(ys) {
      spots.forEach(function (s, i) {
        var near = ys.some(function (y) { return Math.abs(wrap(s.ty + y)) < 100; });
        tiles[i].classList.toggle("is-away", !near);
      });
    }
    function nearest(y, p) {
      var best = 0, bestD = Infinity;
      spots.forEach(function (s, i) {
        var d = Math.abs(wrap(s.ty + y)) + Math.abs(s.tx + p) * 1.4;
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }
    function mark() {
      var i = nearest(yaw, pitch);
      if (i === facing) return;
      if (facing !== null) tiles[facing].classList.remove("is-facing");
      facing = i;
      tiles[i].classList.add("is-facing");
      var parts = [].map.call(tiles[i].querySelectorAll("figcaption > *"), function (n) { return n.textContent.trim(); });
      if (status) status.textContent = (parts.length ? parts.join(", ") : "Tile " + (i + 1)) + ". Enter to open.";
    }

    function now() {
      if (!anim) return { y: yaw, p: pitch };
      var t = anim.effect.getComputedTiming().progress;
      if (t === null) t = 1;
      return { y: from.y + (to.y - from.y) * t, p: from.p + (to.p - from.p) * t };
    }
    function halt() {
      if (!anim) return;
      var c = now();
      anim.cancel();
      anim = null;
      yaw = c.y; pitch = c.p;
      paint(yaw, pitch);
    }
    function turnTo(y, p, dur, easing) {
      halt();
      p = Math.max(-highest, Math.min(-lowest, p));
      if (still.matches || !dur) {
        yaw = y; pitch = p;
        cull([yaw]); paint(yaw, pitch); mark();
        return;
      }
      from = { y: yaw, p: pitch };
      to = { y: y, p: p };
      cull([from.y, (from.y + to.y) / 2, to.y]);
      var tf = function (v) { return "translateZ(var(--dg-z, 360px)) rotateX(" + v.p + "deg) rotateY(" + v.y + "deg)"; };
      anim = sphere.animate([{ transform: tf(from) }, { transform: tf(to) }], { duration: dur, easing: easing || easeOut });
      yaw = to.y; pitch = to.p;
      paint(yaw, pitch);
      var mine = anim;
      anim.onfinish = function () { if (anim === mine) { anim = null; cull([yaw]); } };
      mark();
    }
    // turn so tile i faces the viewer, the short way round
    function face(i, dur) {
      var s = spots[i];
      turnTo(yaw + wrap(-s.ty - yaw), -s.tx, dur === undefined ? 700 : dur);
    }

    function open(i) {
      if (!panel) return;
      var t = tiles[i], img = t.querySelector("img"), cap = t.querySelector("figcaption");
      var pImg = panel.querySelector("img"), pCap = panel.querySelector("[data-dg-caption]");
      if (pImg && img) { pImg.src = img.getAttribute("src"); pImg.alt = img.alt; pImg.className = img.className; }
      if (pCap && cap) {
        pCap.textContent = "";
        [].forEach.call(cap.cloneNode(true).childNodes, function (n) { pCap.appendChild(n); });
      }
      var note = panel.querySelector("[data-dg-note]");
      if (note) note.textContent = t.getAttribute("data-dg-note") || "";
      lastFocus = document.activeElement;
      panel.hidden = false;
      if (!still.matches) panel.animate([{ opacity: 0, transform: "scale(.82)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: easeOut });
      var close = panel.querySelector("[data-dg-close]");
      if (close) close.focus();
    }
    function shut() {
      if (!panel || panel.hidden) return;
      var done = function () { panel.hidden = true; (lastFocus && dg.contains(lastFocus) ? lastFocus : dg).focus(); };
      if (still.matches) done();
      else panel.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.9)" }], { duration: 200, easing: easeOut }).onfinish = done;
    }

    dg.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      halt();
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, y0: yaw, p0: pitch, v: 0, t: e.timeStamp, lx: e.clientX, moved: false, mouse: e.pointerType === "mouse" };
    });
    dg.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        if (!drag.mouse && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        drag.moved = true;
        dg.setPointerCapture(e.pointerId);
        dg.classList.add("is-grabbed");
      }
      var k = 70 / dg.clientWidth; // a full-width drag turns about 70 degrees
      var dt = Math.max(1, e.timeStamp - drag.t);
      drag.v = 0.7 * drag.v + 0.3 * (-(e.clientX - drag.lx) * k / dt);
      drag.lx = e.clientX; drag.t = e.timeStamp;
      yaw = drag.y0 - dx * k; // drag the wall: right brings what is on the left into view
      if (drag.mouse) pitch = Math.max(-highest - 6, Math.min(-lowest + 6, drag.p0 + dy * k));
      cull([yaw]); paint(yaw, pitch); mark();
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      dg.classList.remove("is-grabbed");
      if (!d.moved) {
        var t = e.target.closest(".dg-tile");
        if (t && e.type === "pointerup") {
          var i = tiles.indexOf(t);
          if (i === facing) open(i); else face(i);
        }
        return;
      }
      var throwTo = still.matches ? yaw : yaw + Math.max(-60, Math.min(60, d.v * 320));
      var i = nearest(throwTo, pitch);
      var s = spots[i];
      turnTo(yaw + wrap(-s.ty - yaw), -s.tx, 520 + Math.min(500, Math.abs(d.v) * 900));
    }
    dg.addEventListener("pointerup", release);
    dg.addEventListener("pointercancel", release);
    dg.addEventListener("dragstart", function (e) { e.preventDefault(); });

    dg.addEventListener("keydown", function (e) {
      var s = spots[facing === null ? 0 : facing];
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        var dir = e.key === "ArrowLeft" ? -1 : 1;
        var base = anim ? to.y : yaw;
        var cand = nearest(base + dir * step, -s.tx);
        turnTo(base + wrap(-spots[cand].ty - base), -spots[cand].tx, 560);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        var r = pitches.indexOf(s.tx) + (e.key === "ArrowUp" ? 1 : -1);
        if (r < 0 || r >= pitches.length) return;
        var y = anim ? to.y : yaw;
        turnTo(y + wrap(-spots[nearest(y, -pitches[r])].ty - y), -pitches[r], 560);
      } else if (e.key === "Enter" || e.key === " ") {
        if (facing !== null) open(facing);
      } else return;
      e.preventDefault();
    });
    if (panel) {
      panel.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { e.preventDefault(); shut(); }
        else if (e.key === "Tab") e.preventDefault(); // one control inside: keep focus on it
      });
      panel.addEventListener("click", function (e) { if (e.target === panel || e.target.closest("[data-dg-close]")) shut(); });
    }

    // a short turn into place the first time the dome comes into view
    yaw = 0;
    pitch = -(lowest + highest) / 2; // start between the rows, so both show
    var start = -1.5 * step;
    if (still.matches || !("IntersectionObserver" in window)) turnTo(0, pitch, 0);
    else {
      turnTo(start, pitch, 0);
      var io = new IntersectionObserver(function (en) {
        if (!en[en.length - 1].isIntersecting) return;
        io.disconnect();
        turnTo(0, pitch, 1400);
      }, { threshold: 0.4 });
      io.observe(dg);
    }
  }

  function start() { document.querySelectorAll(".dg").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
