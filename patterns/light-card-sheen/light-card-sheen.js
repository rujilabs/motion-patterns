/*
 * light-card-sheen.js: a card that tilts under the pointer and reflects a strip light that hangs in the room.
 *   <div class="sheen-card" tabindex="0"> ... <svg class="sheen-foil">...</svg> </div>
 * The sheen is not a band slid across on a timer. The script places a long tube light overhead, a little
 * to the left and treats the card as a mirror: it reflects the light in the card's plane and finds where
 * the line from the eye to that reflection meets the card. That point is the middle of the highlight, and
 * the reflected tube gives the band its angle. Tilt the card and both follow, as on a real laminated card.
 * The face also darkens as it turns away from the light (Lambert), and the tilt rides a spring.
 *   data-max       largest tilt in degrees (default 14)
 *   data-rest      the tilt it settles back to, "rx ry" in degrees (default "0 0"), like a card held in a hand
 *   data-light     the tube's position, "x y z" in px from the card centre, y down, z toward you
 *                  (default "-120 -260 420": overhead, a little to the left, in front of the card)
 *   data-tube      the tube's long axis, "x y z" (default "0.35 0 1": a ceiling batten running away from you,
 *                  so the band leans one way or the other as the card turns)
 * Wrap the card in .sheen-stage, which holds the perspective; the stage gets --rx and --ry as well.
 * Writes on the card: --rx, --ry (deg), --sheen-angle (deg), --sheen-pos (%), --sheen-band (%), --shade (0 to 1).
 * A <linearGradient class="sheen-foil-light"> inside the card, in a 0 0 W H viewBox the card's size,
 * gets its x1 y1 x2 y2 moved too, so foil can catch the light sharper than the laminate.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var D2R = Math.PI / 180;

  function setup(card) {
    if (card._sheen) return;
    card._sheen = true;
    var MAX = +card.dataset.max || 14;
    var lp = (card.dataset.light || "-120 -260 420").split(/\s+/).map(Number);
    var grad = card.querySelector(".sheen-foil-light");
    var svg = grad ? grad.ownerSVGElement : null;
    var persp = 900;
    var stage = card.parentElement && card.parentElement.classList.contains("sheen-stage") ? card.parentElement : null;
    var rest = (card.dataset.rest || "0 0").split(/\s+/).map(Number);
    var rx = rest[0] || 0, ry = rest[1] || 0, vx = 0, vy = 0, tx = rx, ty = ry, raf = 0, last = 0, keys = {};
    var tube = norm((card.dataset.tube || "0.35 0 1").split(/\s+/).map(Number));   // the tube's long axis

    function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
    function mirror(p, n) { var k = 2 * dot(p, n); return [p[0] - k * n[0], p[1] - k * n[1], p[2] - k * n[2]]; }

    function paint() {
      var W = card.offsetWidth, H = card.offsetHeight;
      var a = rx * D2R, b = ry * D2R;
      // the card's axes after rotateX(rx) rotateY(ry), y down, z toward the viewer
      var n = [Math.sin(b), -Math.cos(b) * Math.sin(a), Math.cos(b) * Math.cos(a)];
      var u = [Math.cos(b), Math.sin(b) * Math.sin(a), -Math.sin(b) * Math.cos(a)];
      var v = [0, Math.cos(a), Math.sin(a)];
      var eye = [0, 0, persp];
      // reflect the light in the card plane, then run a line from the eye to the reflection
      var m = mirror(lp, n);
      var d = [m[0] - eye[0], m[1] - eye[1], m[2] - eye[2]];
      var t = -dot(n, eye) / (dot(n, d) || -1e-6);
      var hit = [eye[0] + d[0] * t, eye[1] + d[1] * t, eye[2] + d[2] * t];
      var hu = dot(hit, u), hv = dot(hit, v);
      // the band is where the plane through the eye and the reflected tube cuts the card, so its
      // direction is the cross product of the card normal and that plane's normal
      var am = mirror(tube, n), pn = cross(am, d), bd = cross(n, pn);
      var bu = dot(bd, u), bv = dot(bd, v), bl = Math.hypot(bu, bv) || 1;
      var gx = -bv / bl, gy = bu / bl;                      // across the band
      var ang = Math.atan2(gx, -gy);                        // CSS gradient angle: 0 is up, clockwise
      var len = Math.abs(W * Math.sin(ang)) + Math.abs(H * Math.cos(ang));
      var off = hu * gx + hv * gy;                          // band centre from card centre, across the band
      card.style.setProperty("--rx", rx.toFixed(2) + "deg");
      card.style.setProperty("--ry", ry.toFixed(2) + "deg");
      if (stage) {   // the stage gets the tilt too, for a contact shadow under the card
        stage.style.setProperty("--rx", rx.toFixed(2) + "deg");
        stage.style.setProperty("--ry", ry.toFixed(2) + "deg");
      }
      card.style.setProperty("--sheen-angle", (ang / D2R).toFixed(1) + "deg");
      card.style.setProperty("--sheen-pos", (50 + off / len * 100).toFixed(2) + "%");
      card.style.setProperty("--sheen-band", (W * 0.22 / len * 100).toFixed(2) + "%");
      // Lambert: compare the face's light with the flat card's, and shade only what turned away
      var L = norm(lp);
      var flat = L[2], now = dot(n, L);
      card.style.setProperty("--shade", Math.max(0, Math.min(1, (flat - now) * 3.2)).toFixed(3));
      card.style.setProperty("--lift", Math.max(0, Math.min(1, (now - flat) * 3.2)).toFixed(3));
      if (grad && svg) {
        var vb = svg.viewBox.baseVal, k = vb.width / W;
        var cx = vb.width / 2 + hu * k, cy = vb.height / 2 + hv * k, s = W * 0.16 * k;
        grad.setAttribute("x1", (cx - gx * s).toFixed(1));
        grad.setAttribute("y1", (cy - gy * s).toFixed(1));
        grad.setAttribute("x2", (cx + gx * s).toFixed(1));
        grad.setAttribute("y2", (cy + gy * s).toFixed(1));
      }
    }

    function frame(t) {
      var dt = Math.min(0.04, last ? (t - last) / 1000 : 0.016);
      last = t;
      if (reduce.matches) { rx = tx; ry = ty; vx = vy = 0; paint(); raf = 0; last = 0; return; }
      // an underdamped spring per axis (damping ratio about 0.5): a held card that settles with one small wobble
      var w = 16, z = 0.5, steps = 4, h = dt / steps;
      for (var i = 0; i < steps; i++) {
        vx += (-w * w * (rx - tx) - 2 * z * w * vx) * h; rx += vx * h;
        vy += (-w * w * (ry - ty) - 2 * z * w * vy) * h; ry += vy * h;
      }
      paint();
      if (Math.abs(rx - tx) + Math.abs(ry - ty) + Math.abs(vx) * 0.02 + Math.abs(vy) * 0.02 > 0.01) raf = requestAnimationFrame(frame);
      else { rx = tx; ry = ty; vx = vy = 0; paint(); raf = 0; last = 0; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function aim(px, py) {
      // the side under the pointer is pressed down, away from you
      tx = (0.5 - py) * 2 * MAX;
      ty = (px - 0.5) * 2 * MAX;
      kick();
    }
    function fromEvent(e) {
      var r = card.getBoundingClientRect();
      aim(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)));
    }
    var held = false;
    card.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse" || held) fromEvent(e); });
    card.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") { held = true; card.setPointerCapture(e.pointerId); }
      fromEvent(e);
    });
    function letGo() { held = false; tx = rest[0] || 0; ty = rest[1] || 0; kick(); }
    card.addEventListener("pointerup", function (e) { if (e.pointerType !== "mouse") letGo(); });
    card.addEventListener("pointercancel", letGo);
    card.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") letGo(); });

    // keys: hold an arrow to tip that edge away, Home to let it settle
    var KEYS = { ArrowUp: [1, 0], ArrowDown: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    function fromKeys() {
      var x = 0, y = 0;
      Object.keys(keys).forEach(function (k) { if (keys[k]) { x += KEYS[k][0]; y += KEYS[k][1]; } });
      tx = x || y ? Math.max(-1, Math.min(1, x)) * MAX : rest[0] || 0;
      ty = x || y ? Math.max(-1, Math.min(1, y)) * MAX : rest[1] || 0;
      kick();
    }
    card.addEventListener("keydown", function (e) {
      if (KEYS[e.key]) { e.preventDefault(); keys[e.key] = true; fromKeys(); }
      else if (e.key === "Home") { e.preventDefault(); keys = {}; fromKeys(); }
    });
    card.addEventListener("keyup", function (e) { if (KEYS[e.key]) { keys[e.key] = false; fromKeys(); } });
    card.addEventListener("blur", function () { keys = {}; fromKeys(); });

    card.sheen = { tilt: function (x, y) { tx = x; ty = y; kick(); } };
    var p = card.parentElement && getComputedStyle(card.parentElement).perspective;
    if (p && p !== "none") persp = parseFloat(p);
    paint();
    window.addEventListener("resize", paint);
  }

  function init() { document.querySelectorAll(".sheen-card").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
