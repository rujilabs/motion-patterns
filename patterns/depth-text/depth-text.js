/*
 * depth-text.js: every [data-depth] element gets that many layers behind its text (default 12),
 * swings in once, then tilts toward the pointer over its area (closest [data-depth-area], or itself)
 * and springs back to its rest pose when the pointer leaves or the finger lifts. Keyboard focus
 * tilts it to a set pose. The loop runs only while the spring is moving.
 * data-depth-tilt: largest tilt in degrees (default 22).
 * data-depth-rest: rest pose as "rotateX,rotateY" in degrees (default "10,-16").
 * Under reduced motion it stays at the rest pose.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(el) {
    var n = Math.max(2, Math.min(24, parseInt(el.getAttribute("data-depth"), 10) || 12));
    var text = el.textContent;
    // the face is a child too, so it sorts in 3D in front of the layers
    var face = document.createElement("span");
    face.className = "dt-face";
    while (el.firstChild) face.appendChild(el.firstChild);
    el.appendChild(face);
    // deepest first, so the paint order is right even where the browser flattens the 3D
    for (var i = n; i >= 1; i--) {
      var c = document.createElement("span");
      c.className = "dt-layer";
      c.setAttribute("aria-hidden", "true");
      c.textContent = text;
      c.style.setProperty("--dt-i", i);
      el.insertBefore(c, face);
    }
    var area = el.closest("[data-depth-area]") || el;
    area.classList.add("dt-area");
    var tiltMax = parseFloat(el.getAttribute("data-depth-tilt")) || 22;
    var rest = (el.getAttribute("data-depth-rest") || "10,-16").split(",").map(parseFloat);
    // spring state: x = rotateX, y = rotateY
    var x = rest[0], y = rest[1], vx = 0, vy = 0, gx = x, gy = y, frame = 0, pressed = false;

    function paint() {
      el.style.setProperty("--dt-rx", x.toFixed(2) + "deg");
      el.style.setProperty("--dt-ry", y.toFixed(2) + "deg");
    }
    function tick() {
      frame = 0;
      // a damped spring: stiffness .08, damping .78 per frame, one small overshoot on release
      vx = (vx + (gx - x) * 0.08) * 0.78;
      vy = (vy + (gy - y) * 0.08) * 0.78;
      x += vx; y += vy;
      if (Math.abs(gx - x) + Math.abs(gy - y) + Math.abs(vx) + Math.abs(vy) < 0.02) { x = gx; y = gy; vx = vy = 0; paint(); return; }
      paint();
      frame = requestAnimationFrame(tick);
    }
    function aim(ax, ay) {
      if (still.matches) return;
      gx = ax; gy = ay;
      if (!frame) frame = requestAnimationFrame(tick);
    }
    function follow(e) {
      var r = area.getBoundingClientRect();
      var nx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      var ny = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      aim(-ny * tiltMax, nx * tiltMax);
    }
    function settle() { aim(rest[0], rest[1]); }

    area.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse" || pressed) follow(e); });
    area.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") { pressed = true; follow(e); } });
    function lift(e) { if (e.pointerType !== "mouse") { pressed = false; settle(); } }
    area.addEventListener("pointerup", lift);
    area.addEventListener("pointercancel", lift);
    area.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") settle(); });
    el.addEventListener("focus", function () { if (el.matches(":focus-visible")) aim(rest[0] + 12, rest[1] + 34); });
    el.addEventListener("blur", settle);
    still.addEventListener("change", function () { if (still.matches) { gx = x = rest[0]; gy = y = rest[1]; vx = vy = 0; paint(); } });

    paint();
    el.classList.add("dt-on", "go");
  }

  function start() { document.querySelectorAll("[data-depth]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
