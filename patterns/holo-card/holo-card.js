/*
 * holo-card.js: tilts every .holo toward the pointer or a finger, and on the arrow keys when it has focus.
 * The tilt rides a spring (--px, --py), and while the card is held the idle sway in style.css fades out.
 *   <div class="holo-stage"><div class="holo" tabindex="0">...</div></div>
 *   <button type="button" aria-pressed="false" data-holo-pause="card-id">Pause sway</button>
 * The sway stops while the card is off screen. Under reduced motion the script does nothing.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var K = 140, DAMP = 0.75;               // spring stiffness, and damping ratio (a little under critical)
  var C = 2 * Math.sqrt(K) * DAMP;

  function clamp(v) { return v < -1 ? -1 : v > 1 ? 1 : v; }

  function setup(card) {
    var px = 0, py = 0, vx = 0, vy = 0, gx = 0, gy = 0, raf = 0, last = 0, down = false;
    var box = card.parentNode;

    function step(now) {
      var dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      vx += (K * (gx - px) - C * vx) * dt; px += vx * dt;
      vy += (K * (gy - py) - C * vy) * dt; py += vy * dt;
      var still = Math.abs(gx - px) + Math.abs(gy - py) < 0.002 && Math.abs(vx) + Math.abs(vy) < 0.01;
      if (still) { px = gx; py = gy; vx = vy = 0; }
      card.style.setProperty("--px", px.toFixed(4));
      card.style.setProperty("--py", py.toFixed(4));
      raf = still ? 0 : requestAnimationFrame(step);
    }
    function aim(x, y) {
      gx = clamp(x); gy = clamp(y);
      card.classList.toggle("is-held", gx !== 0 || gy !== 0 || down);
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    }
    function fromPointer(e) {
      var r = box.getBoundingClientRect();   // the untilted box, so the tilt does not feed back
      aim((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
    }
    function letGo() { down = false; aim(0, 0); }

    card.addEventListener("pointermove", function (e) {
      if (e.pointerType === "mouse" || down) fromPointer(e);
    });
    card.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") { down = true; fromPointer(e); } });
    card.addEventListener("pointerleave", letGo);
    card.addEventListener("pointerup", function (e) { if (e.pointerType !== "mouse") letGo(); });
    card.addEventListener("pointercancel", letGo);
    card.addEventListener("keydown", function (e) {
      var d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] }[e.key];
      if (d) { e.preventDefault(); aim(gx + d[0], gy + d[1]); }
      else if (e.key === "Escape" || e.key === "Home") aim(0, 0);
    });
    card.addEventListener("blur", function () { aim(0, 0); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { card.classList.toggle("is-away", !en[0].isIntersecting); }).observe(card);
    }
  }

  function start() {
    if (reduce.matches) return;
    document.querySelectorAll(".holo").forEach(setup);
    document.querySelectorAll("[data-holo-pause]").forEach(function (btn) {
      var card = document.getElementById(btn.getAttribute("data-holo-pause"));
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        card.classList.toggle("is-paused", on);
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
