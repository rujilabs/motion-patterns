/*
 * morph-pay-button.js: drives .pay-morph buttons.
 *
 *   PayMorph.run(button, promise)   pill to spinner, then tick when the promise resolves,
 *                                   or a shake and back to the pill when it rejects.
 *   PayMorph.reset(button)          opens a finished button back into the pill.
 *
 * Every change fires a "pay-state" event on the button with detail.state (idle, busy, done, fail),
 * so your status text can change the moment the bank answers.
 * While a payment is in flight the button is aria-disabled and ignores presses, so a nervous
 * double tap never pays twice. Its accessible name follows the state from data-label-busy,
 * data-label-done and data-label-fail. The width change and the spin use element.animate();
 * colours and the drawn marks are CSS transitions on data-state (see style.css).
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var SPIN = 820; // one turn of the arc, ms

  function token(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
  function label(btn, state) {
    if (!btn._payLabel) btn._payLabel = btn.getAttribute("aria-label") || btn.textContent.trim();
    var l = state === "idle" ? btn._payLabel : btn.getAttribute("data-label-" + state);
    if (l) btn.setAttribute("aria-label", l);
  }
  function setState(btn, state) {
    btn.setAttribute("data-state", state);
    btn.setAttribute("aria-disabled", String(state === "busy" || state === "done"));
    label(btn, state);
    btn.dispatchEvent(new CustomEvent("pay-state", { bubbles: true, detail: { state: state } }));
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce.matches ? 0 : ms); }); }

  // pill to circle: width falls to the height, side padding to zero. The radius never changes.
  function close(btn) {
    var w = btn.offsetWidth, h = btn.offsetHeight, pad = getComputedStyle(btn).paddingLeft;
    btn._pay = { w: w, pad: pad };
    if (reduce.matches) { btn.style.width = h + "px"; btn.style.paddingInline = "0px"; return Promise.resolve(); }
    var a = btn.animate([{ width: w + "px", paddingInline: pad }, { width: h + "px", paddingInline: "0px" }],
      { duration: 420, delay: 80, easing: token("--ease-inout", "ease-in-out"), fill: "forwards" });
    btn._payClose = a;
    return a.finished.catch(function () {});
  }
  function open(btn) {
    var p = btn._pay; if (!p) return Promise.resolve();
    var h = btn.offsetHeight;
    function clear() { if (btn._payClose) btn._payClose.cancel(); btn.style.width = ""; btn.style.paddingInline = ""; btn._pay = null; }
    if (reduce.matches) { clear(); return Promise.resolve(); }
    var a = btn.animate([{ width: h + "px", paddingInline: "0px" }, { width: p.w + "px", paddingInline: p.pad }],
      { duration: 460, easing: token("--ease-out", "ease-out"), fill: "forwards" });
    return a.finished.then(function () { clear(); a.cancel(); }, clear);
  }

  function spin(btn) {
    var arc = btn.querySelector(".pay-arc");
    if (!arc || reduce.matches) return null;
    return arc.animate([{ transform: "rotate(-90deg)" }, { transform: "rotate(270deg)" }],
      { duration: SPIN, iterations: Infinity, delay: 420 });
  }
  // stop the arc where it is and let it coast a little further as it closes, instead of snapping to the top
  function settle(btn, s) {
    if (!s) return;
    var t = Math.max(0, (s.currentTime || 0) - 420), at = -90 + (t % SPIN) / SPIN * 360;
    s.cancel();
    var arc = btn.querySelector(".pay-arc");
    btn._paySettle = arc.animate([{ transform: "rotate(" + at + "deg)" }, { transform: "rotate(" + (at + 140) + "deg)" }],
      { duration: 420, easing: token("--ease-out", "ease-out"), fill: "forwards" });
  }

  function shake(btn) {
    if (reduce.matches) return Promise.resolve();
    // a damped side to side: each swing smaller than the last, like a head shaking no
    return btn.animate([
      { translate: "0 0" }, { translate: "-7px 0", offset: .14 }, { translate: "6px 0", offset: .3 },
      { translate: "-4px 0", offset: .48 }, { translate: "2px 0", offset: .66 }, { translate: "-1px 0", offset: .82 }, { translate: "0 0" }
    ], { duration: 520, easing: "linear" }).finished.catch(function () {});
  }

  function run(btn, promise) {
    if (btn.getAttribute("data-state") && btn.getAttribute("data-state") !== "idle") return Promise.resolve(false);
    if (btn._paySettle) { btn._paySettle.cancel(); btn._paySettle = null; }
    setState(btn, "busy");
    var closed = close(btn), s = spin(btn);
    return Promise.all([closed, Promise.resolve(promise).then(function () { return true; }, function () { return false; }), wait(900)])
      .then(function (r) {
        var ok = r[1];
        settle(btn, s);
        setState(btn, ok ? "done" : "fail");
        if (ok) return true;
        return wait(560).then(function () { return shake(btn); }).then(function () { return wait(500); })
          .then(function () { return reset(btn); }).then(function () { return false; });
      });
  }
  function reset(btn) {
    if (btn._paySettle) { btn._paySettle.cancel(); btn._paySettle = null; }
    setState(btn, "idle");
    return open(btn);
  }

  function init() {
    document.querySelectorAll(".pay-morph").forEach(function (b) {
      if (!b.hasAttribute("data-state")) b.setAttribute("data-state", "idle");
      // presses while busy or done do nothing; aria-disabled keeps the button focusable
      b.addEventListener("click", function (e) { if (b.getAttribute("aria-disabled") === "true") e.stopImmediatePropagation(); }, true);
    });
  }
  window.PayMorph = { run: run, reset: reset };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
