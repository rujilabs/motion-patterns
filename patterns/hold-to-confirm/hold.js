/*
 * hold.js: press and hold to confirm an action that is hard to undo.
 * Hold the button for data-hold milliseconds (1500 by default): the fill and the ring grow at a
 * steady pace, then the button pops, shows data-done and fires "confirm" on the element.
 * Let go early and the fill drains back while the button springs out of its press.
 *   Pointer: press and hold. Sliding into a scroll or off the button lets go.
 *   Keys:    hold Space or Enter.
 *   A click with no hold (a screen reader or a switch): the first one asks, a second one within
 *            5 seconds confirms.
 * Every step is said in the element named by data-status="id". el.reset() starts over.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function token(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function setup(el) {
    if (el._hold) return;
    el._hold = true;
    var dur = +el.dataset.hold || 1500;
    var fill = el.querySelector(".hold-fill"), arc = el.querySelector(".hold-arc"), label = el.querySelector(".hold-label");
    var status = el.dataset.status ? document.getElementById(el.dataset.status) : null;
    var idleLabel = label.textContent, idleStatus = status ? status.textContent : "";
    var secs = (dur / 1000).toString().replace(/\.0$/, "");
    var holding = false, done = false, t0 = 0, from = 0, timer = 0, armed = 0, pointer = null, key = null, skipClick = false;
    var anims = [];

    function say(t) { if (status) status.textContent = t; }
    // where the fill is right now, read back from the screen so a new hold picks up mid-drain
    function now() {
      var m = getComputedStyle(fill).transform;
      var a = m && m !== "none" ? parseFloat(m.slice(m.indexOf("(") + 1)) : 0;
      return Math.max(0, Math.min(1, a || 0));
    }
    function show(a, b, ms, easing) {
      anims.forEach(function (x) { x.cancel(); });
      var o = { duration: Math.max(0, ms), easing: easing, fill: "forwards" };
      anims = [fill.animate([{ transform: "scaleX(" + a + ")" }, { transform: "scaleX(" + b + ")" }], o)];
      if (arc) anims.push(arc.animate([{ strokeDashoffset: 1 - a }, { strokeDashoffset: 1 - b }], o));
    }

    function start() {
      if (done || holding) return;
      clearTimeout(armed); armed = 0;
      holding = true;
      from = now(); t0 = performance.now();
      var left = (1 - from) * dur;
      el.classList.add("is-holding");
      show(from, 1, left, "linear");
      timer = setTimeout(finish, left);
      say("Keep holding.");
    }
    function release() {
      if (!holding) return;
      holding = false;
      clearTimeout(timer);
      el.classList.remove("is-holding");
      var k = Math.min(1, from + (performance.now() - t0) / dur);
      if (reduce.matches) show(0, 0, 0, "linear");
      else {
        show(k, 0, 220 + 260 * k, token("--ease-out", "ease-out"));
        el.animate([{ scale: .97 }, { scale: 1 }], { duration: 520, easing: token("--ease-spring", "ease-out") });
      }
      say("Let go at " + Math.round(k * 100) + " percent. Nothing was removed. Hold for the full " + secs + " seconds.");
    }
    function finish() {
      holding = false; done = true;
      clearTimeout(timer); clearTimeout(armed); armed = 0;
      el.classList.remove("is-holding");
      el.classList.add("is-done");
      el.setAttribute("aria-disabled", "true");
      label.textContent = el.dataset.done || "Done";
      if (!reduce.matches) el.animate([{ scale: .97 }, { scale: 1.04 }, { scale: 1 }], { duration: 560, easing: token("--ease-out", "ease-out") });
      el.dispatchEvent(new CustomEvent("confirm", { bubbles: true }));
    }

    el.addEventListener("pointerdown", function (e) {
      if (done || e.button !== 0) return;
      pointer = e.pointerId;
      el.focus({ preventScroll: true, focusVisible: false });
      start();
    });
    function up(e) {
      if (e.pointerId !== pointer) return;
      pointer = null;
      skipClick = true;
      setTimeout(function () { skipClick = false; }, 0);
      release();
    }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", up);
    el.addEventListener("contextmenu", function (e) { if (pointer !== null || holding) e.preventDefault(); });

    el.addEventListener("keydown", function (e) {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (done || e.repeat || key) return;
      key = e.key;
      start();
    });
    el.addEventListener("keyup", function (e) {
      if (e.key !== key) return;
      e.preventDefault();
      key = null;
      release();
    });
    el.addEventListener("blur", function () { if (key) { key = null; release(); } });

    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (skipClick || done) return;
      if (armed) { show(now(), 1, reduce.matches ? 0 : 260, token("--ease-out", "ease-out")); finish(); return; }
      say("Press again within 5 seconds to confirm.");
      armed = setTimeout(function () { armed = 0; say(idleStatus); }, 5000);
    });

    el.reset = function () {
      done = false;
      el.classList.remove("is-done");
      el.removeAttribute("aria-disabled");
      label.textContent = idleLabel;
      show(0, 0, 0, "linear");
      say(idleStatus);
    };
    el.classList.add("is-ready");
  }

  function init() { document.querySelectorAll(".hold").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
