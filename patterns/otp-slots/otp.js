/*
 * otp.js: a one-time code in a row of boxes, on top of one real input.
 * The input (inputmode="numeric", autocomplete="one-time-code") keeps every native behaviour: typing,
 * Backspace, paste, SMS autofill and the screen reader. This script hides it over the boxes and draws
 * its value: each new digit pops into its box, the caret sits in the next empty one, a pasted code
 * fills the boxes in a quick run. With all boxes full it fires "complete" (detail.value) and waits:
 *   el.reject(message)  shakes the row, shows it red, then clears it for another try
 *   el.accept(message)  turns the boxes green and locks the input
 *   el.reset()          empties it
 * Messages go to the element named by data-status="id".
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function token(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function setup(el) {
    if (el._otp) return;
    el._otp = true;
    var input = el.querySelector(".otp-input"), row = el.querySelector(".otp-slots");
    var slots = [].slice.call(el.querySelectorAll(".otp-slot"));
    var n = slots.length, prev = "", busy = false;
    var status = el.dataset.status ? document.getElementById(el.dataset.status) : null;
    var digits = slots.map(function (s) { var d = document.createElement("span"); s.appendChild(d); return d; });
    input.maxLength = n;

    function say(t) { if (status) status.textContent = t; }
    function end() { var l = input.value.length; try { input.setSelectionRange(l, l); } catch (e) {} }
    function render() {
      var v = input.value, on = document.activeElement === input && !busy && !input.readOnly;
      slots.forEach(function (s, i) {
        if (digits[i].textContent !== v.charAt(i)) digits[i].textContent = v.charAt(i);
        s.classList.toggle("is-active", on && i === v.length);
      });
    }
    function pop(i, delay) {
      if (reduce.matches) return;
      digits[i].animate([{ transform: "translateY(6px) scale(.5)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 420, delay: delay, easing: token("--ease-spring", "ease-out"), fill: "backwards" });
    }

    input.addEventListener("input", function () {
      if (busy || input.readOnly) return;
      var v = input.value.replace(/\D/g, "").slice(0, n);
      if (v !== input.value) input.value = v;
      var same = 0;
      while (same < v.length && v.charAt(same) === prev.charAt(same)) same++;
      for (var i = same; i < v.length; i++) pop(i, (i - same) * 45);
      prev = v;
      if (el.classList.contains("is-bad")) el.classList.remove("is-bad");
      end();
      render();
      if (v.length === n) {
        busy = true;
        render();
        el.dispatchEvent(new CustomEvent("complete", { bubbles: true, detail: { value: v } }));
      }
    });
    // the caret always sits after the last digit, so typing never lands in the middle
    ["focus", "click", "keyup"].forEach(function (t) { input.addEventListener(t, function () { end(); render(); }); });
    input.addEventListener("keydown", function (e) {
      if (/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) e.preventDefault();
    });
    input.addEventListener("blur", render);

    el.reject = function (msg) {
      el.classList.add("is-bad");
      if (msg) say(msg);
      if (!reduce.matches) row.animate([{ transform: "none" }, { transform: "translateX(-10px)" }, { transform: "translateX(9px)" }, { transform: "translateX(-6px)" }, { transform: "translateX(4px)" }, { transform: "none" }], { duration: 420, easing: token("--ease-out", "ease-out") });
      setTimeout(function () {
        input.value = ""; prev = ""; busy = false;
        el.classList.remove("is-bad");
        render();
        input.focus();
      }, 700);
    };
    el.accept = function (msg) {
      busy = false;
      input.readOnly = true;
      el.classList.add("is-ok");
      if (msg) say(msg);
      render();
      if (!reduce.matches) slots.forEach(function (s, i) {
        s.animate([{ transform: "none" }, { transform: "translateY(-5px)" }, { transform: "none" }], { duration: 360, delay: i * 50, easing: token("--ease-out", "ease-out") });
      });
    };
    el.reset = function () {
      input.readOnly = false;
      input.value = ""; prev = ""; busy = false;
      el.classList.remove("is-ok", "is-bad");
      say("");
      render();
    };
    el.classList.add("is-ready");
    render();
  }

  function init() { document.querySelectorAll(".otp").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
