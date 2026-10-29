/*
 * morph-mic-record.js: turns every button.mic-record into a record toggle.
 *
 * A click flips aria-pressed (true = recording), swaps the accessible name between
 * data-label-off and data-label-on, and fires a "mic-record" event on the button with
 * detail.recording. Stop it from your own code (silence, a time limit) with:
 *
 *   MicRecord.set(button, false)
 *
 * The morph itself is in style.css (the CSS d property). Browsers without it (Safari) get the
 * same tween here: the shapes are read from the custom properties in style.css, so they are only
 * written once, and every pair has matched commands, so the numbers interpolate one to one.
 */
(function () {
  var hasD = window.CSS && CSS.supports && CSS.supports("d", 'path("M0 0")');
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function nums(s) { return (s.match(/-?\d*\.?\d+/g) || []).map(Number); }
  function shape(el, name) {
    var v = getComputedStyle(el).getPropertyValue(name).trim();
    var m = v.match(/path\(\s*["'](.*)["']\s*\)/);
    return m ? m[1] : "";
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  // Tween the d attribute from the shape it shows to the target one. Commands stay, numbers move.
  function tween(path, to, delay) {
    var from = path.getAttribute("d"), a = nums(from), b = nums(to), i = 0;
    var tpl = to.split(/-?\d*\.?\d+/);
    cancelAnimationFrame(path._micRaf);
    if (reduce.matches || a.length !== b.length) { path.setAttribute("d", to); return; }
    var dur = 420, t0 = performance.now() + (delay || 0);
    (function frame(now) {
      var t = Math.min(1, Math.max(0, (now - t0) / dur)), e = ease(t), out = tpl[0];
      for (i = 0; i < b.length; i++) out += (a[i] + (b[i] - a[i]) * e).toFixed(2) + tpl[i + 1];
      path.setAttribute("d", out);
      if (t < 1) path._micRaf = requestAnimationFrame(frame);
    })(performance.now());
  }

  function set(btn, on) {
    on = !!on;
    if ((btn.getAttribute("aria-pressed") === "true") === on) return;
    btn.setAttribute("aria-pressed", String(on));
    var label = btn.getAttribute(on ? "data-label-on" : "data-label-off");
    if (label) btn.setAttribute("aria-label", label);
    if (!hasD) {
      var cap = btn.querySelector(".mic-capsule"), hold = btn.querySelector(".mic-holder");
      var key = on ? "-on" : "-off";
      if (cap) tween(cap, shape(btn, "--mic-capsule" + key), 0);
      if (hold) tween(hold, shape(btn, "--mic-holder" + key), on ? 63 : 0);
    }
    btn.dispatchEvent(new CustomEvent("mic-record", { bubbles: true, detail: { recording: on } }));
  }

  function init() {
    document.querySelectorAll(".mic-record").forEach(function (btn) {
      if (btn._mic) return;
      btn._mic = true;
      if (!btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () { set(btn, btn.getAttribute("aria-pressed") !== "true"); });
    });
  }
  window.MicRecord = { set: set };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
