/*
 * stepper.js: [data-stepper] holds two buttons with data-step="-1" and data-step="1" and an
 * <output class="roll"> with the value. data-min, data-max on [data-stepper] bound it. Each change
 * fires a "stepper:change" event (detail.value) on [data-stepper].
 * window.rollTo(el, text, dir) rolls any .roll element to new text; use it for totals too.
 */
(function () {
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");

  function span(cls, text, hidden) {
    var s = document.createElement("span");
    if (cls) s.className = cls;
    s.textContent = text;
    if (hidden) s.setAttribute("aria-hidden", "true");
    return s;
  }

  function rollTo(el, text, dir) {
    text = String(text);
    var old = el.dataset.shown != null ? el.dataset.shown : el.textContent.trim();
    el.dataset.shown = text;
    el.dataset.dir = dir || "up";
    el.textContent = "";
    // one plain copy for screen readers; the rolling digits are aria-hidden
    el.appendChild(span("roll-sr", text));
    var animate = !(still && still.matches) && old !== text;
    // different lengths: roll the whole number as one piece; same length: only the changed digits
    var pairs = [];
    if (old.length !== text.length) pairs.push([old, text]);
    else for (var i = 0; i < text.length; i++) pairs.push([old[i], text[i]]);
    pairs.forEach(function (p) {
      var slot = span("roll-slot", "", true);
      if (!animate || p[0] === p[1]) slot.appendChild(span("", p[1]));
      else {
        slot.appendChild(span("roll-out", p[0]));
        var inn = span("roll-in", p[1]);
        inn.addEventListener("animationend", function () {
          if (!slot.isConnected) return;
          slot.textContent = "";
          slot.appendChild(span("", p[1]));
        });
        slot.appendChild(inn);
      }
      el.appendChild(slot);
    });
  }
  window.rollTo = rollTo;

  function setup(root) {
    var out = root.querySelector(".roll");
    var min = root.dataset.min != null ? parseFloat(root.dataset.min) : -Infinity;
    var max = root.dataset.max != null ? parseFloat(root.dataset.max) : Infinity;
    var value = parseFloat(out.textContent) || 0;
    var btns = root.querySelectorAll("[data-step]");

    function sync() {
      btns.forEach(function (b) {
        var s = parseFloat(b.dataset.step);
        b.disabled = s < 0 ? value <= min : value >= max;
      });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var s = parseFloat(b.dataset.step);
        var next = Math.min(max, Math.max(min, value + s));
        if (next === value) return;
        rollTo(out, next, next > value ? "up" : "down");
        value = next;
        sync();
        root.dispatchEvent(new CustomEvent("stepper:change", { bubbles: true, detail: { value: value } }));
      });
    });
    rollTo(out, value, "up");
    sync();
  }

  function start() { document.querySelectorAll("[data-stepper]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
