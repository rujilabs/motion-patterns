/*
 * jelly-radio.js: one dot of jelly for every .jelly-radio group. The radios stay the source of truth;
 * on "change" the dot travels from where it is now to the checked option's ring.
 * The path is a damped spring (one overshoot, then still). The dot's stretch comes from its speed in
 * pixels a second, along the direction of travel, and it thins across by the same factor so it keeps
 * its volume. On arrival a short decaying squash makes the wobble. The keyframes are worked out once
 * per move and played with the Web Animations API, so they show on a page timeline and can be paused.
 * Reduced motion: the dot jumps.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var K = 260, C = 17;        // spring stiffness and damping (damping ratio about .53)
  var FPS = 60;

  // progress 0 to 1 and its speed per second, sampled at 60 fps, plus the time it first arrives
  function springFrames() {
    var p = 0, v = 0, t = 0, dt = 1 / (FPS * 4), out = [{ p: 0, v: 0, t: 0 }], arrive = -1;
    while (t < 1.4) {
      for (var i = 0; i < 4; i++) {
        var a = K * (1 - p) - C * v;
        v += a * dt; p += v * dt; t += dt;
        if (arrive < 0 && p >= 1) arrive = t;
      }
      out.push({ p: p, v: v, t: t });
      if (arrive > 0 && t - arrive > 0.5 && Math.abs(1 - p) < 0.002 && Math.abs(v) < 0.03) break;
    }
    out.arrive = arrive;
    return out;
  }
  var FRAMES = springFrames();

  function tf(x, y, a, along, across) {
    return "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) rotate(" + a.toFixed(4) + "rad) scale(" +
      along.toFixed(3) + "," + across.toFixed(3) + ") rotate(" + (-a).toFixed(4) + "rad)";
  }

  function setup(group) {
    if (group._jelly) return;
    group._jelly = true;
    var dot = document.createElement("span");
    dot.className = "jr-dot";
    dot.setAttribute("aria-hidden", "true");
    group.appendChild(dot);
    group.classList.add("jr-live");
    var anim = null, at = null;

    // measured from the dot's own untransformed box, so a fieldset legend or border cannot shift it
    function spot(input) {
      var ring = input.parentNode.querySelector(".jr-ring") || input.parentNode;
      var keep = dot.style.transform;
      dot.style.transform = "none";
      var r = ring.getBoundingClientRect(), o = dot.getBoundingClientRect();
      dot.style.transform = keep;
      return { x: r.left + r.width / 2 - o.left - o.width / 2, y: r.top + r.height / 2 - o.top - o.height / 2 };
    }
    function checked() { return group.querySelector("input[type=radio]:checked"); }

    function place(animate) {
      var input = checked();
      if (!input) { dot.hidden = true; at = null; return; }
      var wasHidden = dot.hidden;
      dot.hidden = false;
      var from = at;
      if (anim && animate) {
        // start from where the dot is right now, mid flight
        var m = new DOMMatrixReadOnly(getComputedStyle(dot).transform);
        from = { x: m.e, y: m.f };
      }
      if (anim) { anim.cancel(); anim = null; }
      var to = spot(input);
      at = to;
      dot.style.transform = tf(to.x, to.y, 0, 1, 1);
      if (!animate || reduce.matches || !dot.animate) return;
      if (wasHidden || !from) {
        anim = dot.animate([{ transform: tf(to.x, to.y, 0, 0, 0) }, { transform: tf(to.x, to.y, 0, 1, 1) }],
          { duration: 380, easing: getComputedStyle(group).getPropertyValue("--ease-spring").trim() || "ease-out" });
        anim.onfinish = function () { anim = null; };
        return;
      }
      var dx = to.x - from.x, dy = to.y - from.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.5) return;
      var ang = Math.atan2(dy, dx), amp = 0.3 * Math.min(1, dist / 70), keys = [];
      for (var i = 0; i < FRAMES.length; i++) {
        var f = FRAMES[i];
        var stretch = 1 + Math.min(0.7, Math.abs(f.v) * dist / 1600);
        var w = 0;
        if (FRAMES.arrive > 0 && f.t >= FRAMES.arrive) {
          var s = f.t - FRAMES.arrive;
          w = amp * Math.exp(-s / 0.13) * Math.sin(2 * Math.PI * 7 * s);
        }
        keys.push({ transform: tf(from.x + dx * f.p, from.y + dy * f.p, ang, stretch * (1 - w), (1 + w) / stretch) });
      }
      keys[keys.length - 1] = { transform: tf(to.x, to.y, ang, 1, 1) };
      anim = dot.animate(keys, { duration: (FRAMES.length - 1) * 1000 / FPS, easing: "linear" });
      anim.id = "jelly-radio";
      anim.onfinish = function () { anim = null; };
    }

    group.addEventListener("change", function (e) { if (e.target.type === "radio") place(true); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { if (!anim) place(false); }).observe(group);
    place(false);
  }

  function init() { document.querySelectorAll(".jelly-radio").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
