/*
 * slide.js: slide a knob to the end of a track to pay, so a stray tap never pays.
 * Drag the knob past data-commit (0.85 of the way by default) and let go: it runs to the end, turns
 * into a tick, shows data-done and fires "confirm" on the element. Let go short of that and it
 * springs back and knocks against the start.
 *   Pointer: drag the knob sideways. A tap on the track nudges the knob to show which way it goes.
 *   Keys:    it is an ARIA slider. Arrows move it in tenths, Home goes back, End or Enter pays.
 *            Leave it short of the end and it goes back when focus leaves.
 * Markup: <div class="slide" role="slider" tabindex="0"> with .slide-fill, .slide-label and
 * .slide-knob, followed by a .slide-alt button for when the script does not run. el.reset() starts over.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function token(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function setup(el) {
    if (el._slide) return;
    el._slide = true;
    var knob = el.querySelector(".slide-knob"), fill = el.querySelector(".slide-fill"), label = el.querySelector(".slide-label");
    var commit = +el.dataset.commit || 0.85;
    var status = el.dataset.status ? document.getElementById(el.dataset.status) : null;
    var idleLabel = label.textContent;
    var x = 0, done = false, drag = null, anims = [];

    function say(t) { if (status) status.textContent = t; }
    function max() { return Math.max(1, el.clientWidth - knob.offsetWidth - 2 * knob.offsetLeft); }
    // the three moving parts at knob offset v, as style values
    function look(v) {
      var m = max(), k = Math.max(0, Math.min(1, v / m));
      return {
        knob: "translateX(" + v.toFixed(1) + "px)",
        fill: "translateX(" + (v + knob.offsetWidth - fill.offsetWidth).toFixed(1) + "px)",
        label: done ? "1" : Math.max(0, 1 - k * 1.8).toFixed(3)
      };
    }
    function aria(v) {
      var pct = Math.round(Math.max(0, Math.min(1, v / max())) * 100);
      el.setAttribute("aria-valuenow", done ? 100 : pct);
      el.setAttribute("aria-valuetext", done ? "Paid" : pct ? pct + " percent" : "Not paid");
    }
    function stop() { anims.forEach(function (a) { a.cancel(); }); anims = []; }
    function set(v) {
      stop();
      x = v;
      var s = look(v);
      knob.style.transform = s.knob; fill.style.transform = s.fill; label.style.opacity = s.label;
      aria(v);
    }
    // animate the knob through a list of offsets (with optional offsets in time), then hold the last one
    function run(stops, times, ms, easing, then) {
      if (reduce.matches || ms <= 0) { set(stops[stops.length - 1]); if (then) then(); return; }
      stop();
      var o = { duration: ms, easing: easing };
      var kf = function (key, prop) {
        return stops.map(function (v, i) { var f = {}; f[prop] = look(v)[key]; if (times) f.offset = times[i]; return f; });
      };
      anims = [knob.animate(kf("knob", "transform"), o), fill.animate(kf("fill", "transform"), o), label.animate(kf("label", "opacity"), o)];
      var end = stops[stops.length - 1];
      x = end;
      anims[0].onfinish = function () { set(end); if (then) then(); };
      aria(end);
    }
    // where the knob is on screen now, so a grab mid-spring picks it up where it is
    function here() {
      var m = getComputedStyle(knob).transform;
      if (!m || m === "none") return x;
      var n = m.slice(m.indexOf("(") + 1, -1).split(",");
      return parseFloat(n[n.length === 6 ? 4 : 12]) || 0;
    }

    function back(msg) {
      var from = here();
      run([from, -Math.min(5, from * 0.04), 0], [0, 0.8, 1], Math.min(560, 260 + from * 0.9), token("--ease-out", "ease-out"));
      if (msg) say(msg);
    }
    function pay() {
      if (done) return;
      var from = here(), m = max();
      el.classList.remove("is-dragging");
      run([from, m], null, Math.max(120, (m - from) * 1.4), token("--ease-out", "ease-out"), function () {
        done = true;
        el.classList.add("is-done");
        label.textContent = el.dataset.done || "Done";
        set(m);
        if (!reduce.matches) knob.animate([{ scale: .6 }, { scale: 1 }], { duration: 520, easing: token("--ease-spring", "ease-out") });
        el.dispatchEvent(new CustomEvent("confirm", { bubbles: true }));
      });
    }

    knob.addEventListener("pointerdown", function (e) {
      if (done || e.button !== 0) return;
      e.preventDefault();
      el.focus({ preventScroll: true, focusVisible: false });
      var from = here();
      set(from);
      drag = { id: e.pointerId, x0: e.clientX, from: from };
      el.classList.add("is-dragging");
      try { knob.setPointerCapture(e.pointerId); } catch (err) {}
    });
    knob.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      set(Math.max(0, Math.min(max(), drag.from + e.clientX - drag.x0)));
    });
    function up(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      el.classList.remove("is-dragging");
      if (e.type !== "pointercancel" && x >= max() * commit) pay();
      else if (x > 2) back("Not paid. Slide it all the way to the end to pay.");
      else set(0);
    }
    knob.addEventListener("pointerup", up);
    knob.addEventListener("pointercancel", up);
    el.addEventListener("pointerdown", function (e) {
      if (done || knob.contains(e.target) || e.button !== 0) return;
      el.focus({ preventScroll: true, focusVisible: false });
      run([x, x + 22, 0], [0, 0.35, 1], 620, token("--ease-out", "ease-out"));
      say("Drag the round button to the right.");
    });

    el.addEventListener("keydown", function (e) {
      if (done) return;
      var m = max(), step = m / 10, v = null;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") v = x + step;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") v = x - step;
      else if (e.key === "PageUp") v = x + step * 3;
      else if (e.key === "PageDown") v = x - step * 3;
      else if (e.key === "Home") v = 0;
      else if (e.key === "End" || e.key === "Enter") { e.preventDefault(); pay(); return; }
      if (v === null) return;
      e.preventDefault();
      v = Math.max(0, Math.min(m, v));
      if (v >= m - 0.5) { pay(); return; }
      run([here(), v], null, 160, token("--ease-out", "ease-out"));
    });
    el.addEventListener("blur", function () { if (!done && !drag && x > 0) back(); });
    window.addEventListener("resize", function () { if (!drag) set(done ? max() : 0); });

    el.reset = function () {
      done = false;
      el.classList.remove("is-done");
      label.textContent = idleLabel;
      set(0);
      say("");
    };
    el.classList.add("is-ready");
    set(0);
  }

  function init() { document.querySelectorAll(".slide").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
