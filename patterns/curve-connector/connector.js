/*
 * connector.js: nodes you drag on a board, joined by curved connectors that stay attached at both ends.
 *   <div class="curve-connector">
 *     <svg class="cc-wires" aria-hidden="true">
 *       <path class="cc-wire" data-from="order" data-to="slot"/>
 *     </svg>
 *     <div class="cc-node" id="order" tabindex="0" data-x="24" data-y="40">...</div>
 *     <div class="cc-node" id="slot" tabindex="0" data-x="260" data-y="120">...</div>
 *   </div>
 * A connector leaves the right edge of one node and enters the left edge of the next, as a cubic curve
 * with level tangents at both ports (data-flow="down" on the board: bottom edge to top edge instead). The ends follow the nodes exactly; the two control points follow on
 * springs, so a fast drag swings the belly of the curve and it settles a moment later, like a cable
 * with some weight. Drag a node with the mouse, pen or touch, or focus it and use the arrow keys
 * (Shift for bigger steps). "nodemove" fires with detail { id, x, y }. el.pulse(wire, ms) sends a dot
 * along one connector and returns its Animation.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var css = getComputedStyle(document.documentElement);
  var EASE_INOUT = css.getPropertyValue("--ease-inout").trim() || "ease-in-out";
  var K = 170, C = 16;       // spring stiffness and damping for the control points (damping ratio about 0.6)
  var STEP = 8, BIG = 32;    // keyboard steps in px

  function setup(el) {
    if (el._cc) return;
    el._cc = true;
    var nodes = {};
    el.querySelectorAll(".cc-node").forEach(function (n) {
      nodes[n.id] = { el: n, x: +n.dataset.x || 0, y: +n.dataset.y || 0 };
    });
    var wires = [].slice.call(el.querySelectorAll(".cc-wire[data-from][data-to]")).map(function (p) {
      return { el: p, from: nodes[p.dataset.from], to: nodes[p.dataset.to], c: null, v: [0, 0, 0, 0] };
    }).filter(function (w) { return w.from && w.to; });
    var raf = 0, top = 1;

    function clampNode(n) {
      var maxX = el.clientWidth - n.el.offsetWidth, maxY = el.clientHeight - n.el.offsetHeight;
      n.x = Math.round(Math.max(0, Math.min(maxX, n.x)));
      n.y = Math.round(Math.max(0, Math.min(maxY, n.y)));
    }
    function placeNode(n) {
      clampNode(n);
      n.el.style.left = n.x + "px";
      n.el.style.top = n.y + "px";
      n.el.dataset.x = n.x;
      n.el.dataset.y = n.y;
    }
    // ends exactly on the ports; control points pushed out level from each port
    function target(w) {
      var a = w.from, b = w.to, p0, p3, t;
      if (el.dataset.flow === "down") {
        // top to bottom: out of the bottom edge, into the top edge, tangents upright
        p0 = [a.x + a.el.offsetWidth / 2, a.y + a.el.offsetHeight];
        p3 = [b.x + b.el.offsetWidth / 2, b.y];
        var dy = p3[1] - p0[1];
        var reachY = Math.max(30, Math.abs(dy) * 0.5, dy < 0 ? Math.min(160, Math.abs(p3[0] - p0[0]) * 0.5 + 60) : 0);
        t = [p0[0], p0[1] + reachY, p3[0], p3[1] - reachY];
      } else {
        p0 = [a.x + a.el.offsetWidth, a.y + a.el.offsetHeight / 2];
        p3 = [b.x, b.y + b.el.offsetHeight / 2];
        var dx = p3[0] - p0[0];
        // reach grows with the gap; a node placed behind its source gets a wider loop so the curve never kinks
        var reach = Math.max(36, Math.abs(dx) * 0.5, dx < 0 ? Math.min(160, Math.abs(p3[1] - p0[1]) * 0.5 + 60) : 0);
        t = [p0[0] + reach, p0[1], p3[0] - reach, p3[1]];
      }
      return { p0: p0, p3: p3, t: t };
    }
    function draw(w, g) {
      var c = w.c;
      w.el.setAttribute("d", "M" + g.p0[0] + " " + g.p0[1] + " C" + c[0].toFixed(1) + " " + c[1].toFixed(1) + " " + c[2].toFixed(1) + " " + c[3].toFixed(1) + " " + g.p3[0] + " " + g.p3[1]);
    }
    function settleAll() {
      wires.forEach(function (w) { var g = target(w); w.c = g.t.slice(); w.v = [0, 0, 0, 0]; draw(w, g); });
    }
    var last = 0;
    function tick(now) {
      var dt = Math.min(0.032, (now - (last || now)) / 1000) || 0.016;
      last = now;
      var moving = false;
      wires.forEach(function (w) {
        var g = target(w);
        if (!w.c || reduce.matches) { w.c = g.t.slice(); w.v = [0, 0, 0, 0]; }
        for (var i = 0; i < 4; i++) {
          var f = K * (g.t[i] - w.c[i]) - C * w.v[i];
          w.v[i] += f * dt;
          w.c[i] += w.v[i] * dt;
          if (Math.abs(g.t[i] - w.c[i]) > 0.15 || Math.abs(w.v[i]) > 0.5) moving = true;
          else { w.c[i] = g.t[i]; w.v[i] = 0; }
        }
        draw(w, g);
      });
      raf = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) last = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    function moveTo(n, x, y) {
      n.x = x; n.y = y;
      placeNode(n);
      kick();
      el.dispatchEvent(new CustomEvent("nodemove", { bubbles: true, detail: { id: n.el.id, x: n.x, y: n.y } }));
    }

    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id], drag = null;
      placeNode(n);
      n.el.addEventListener("pointerdown", function (e) {
        if (e.button !== 0 || e.target.closest("button, a, input, select, textarea")) return;
        e.preventDefault();
        n.el.focus({ preventScroll: true, focusVisible: false });
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: n.x, y: n.y };
        n.el.setPointerCapture(e.pointerId);
        n.el.classList.add("is-dragging");
        n.el.style.zIndex = ++top;                  // the node you hold sits on top; tab order stays as written
      });
      n.el.addEventListener("pointermove", function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        moveTo(n, drag.x + e.clientX - drag.sx, drag.y + e.clientY - drag.sy);
      });
      function end(e) {
        if (!drag || e.pointerId !== drag.id) return;
        drag = null;
        n.el.classList.remove("is-dragging");
        el.dispatchEvent(new CustomEvent("nodedrop", { bubbles: true, detail: { id: n.el.id, x: n.x, y: n.y } }));
      }
      n.el.addEventListener("pointerup", end);
      n.el.addEventListener("pointercancel", end);
      n.el.addEventListener("keydown", function (e) {
        var s = e.shiftKey ? BIG : STEP, x = n.x, y = n.y;
        switch (e.key) {
          case "ArrowLeft": x -= s; break;
          case "ArrowRight": x += s; break;
          case "ArrowUp": y -= s; break;
          case "ArrowDown": y += s; break;
          default: return;
        }
        e.preventDefault();
        moveTo(n, x, y);
        el.dispatchEvent(new CustomEvent("nodedrop", { bubbles: true, detail: { id: n.el.id, x: n.x, y: n.y } }));
      });
    });

    // a dot that runs along one connector, start port to end port
    el.pulse = function (wire, ms) {
      var dot = document.createElement("span");
      dot.className = "cc-token";
      dot.setAttribute("aria-hidden", "true");
      dot.style.offsetPath = "path('" + wire.getAttribute("d") + "')";
      el.appendChild(dot);
      var a = dot.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }], { duration: reduce.matches ? 1 : ms || 700, easing: EASE_INOUT });
      a.finished.then(function () { dot.remove(); }, function () { dot.remove(); });
      return a;
    };
    el.relayout = settleAll;
    el.place = function (id, x, y) { var n = nodes[id]; if (n) { n.x = x; n.y = y; placeNode(n); settleAll(); } };

    settleAll();
    el.classList.add("is-ready");
    // the board can change size (a phone turning, a panel opening): keep every node inside it
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () { Object.keys(nodes).forEach(function (id) { placeNode(nodes[id]); }); settleAll(); }).observe(el);
    }
  }

  function init() { document.querySelectorAll(".curve-connector").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
