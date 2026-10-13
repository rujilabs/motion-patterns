/*
 * odometer.js: turns <span class="odometer" data-value="1284">1,284</span> into counter wheels.
 * The first roll starts from zero when the number scrolls into view. After that, change
 * data-value (el.dataset.value = 1500) and it rolls from the number it shows to the new one.
 * Optional: data-decimals="2". The plain number stays in the markup for screen readers and copy.
 */
(function () {
  var CELLS = 50; // each strip holds 0 to 9 five times: room for three extra turns and a wrap
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var css = getComputedStyle(document.documentElement);
  function token(name, fallback) { return css.getPropertyValue(name).trim() || fallback; }
  var EASE_OUT = token("--ease-out", "ease-out");
  var EASE_SETTLE = token("--ease-spring", "ease-out");

  function format(el, v) {
    var d = +(el.dataset.decimals || 0);
    return v.toLocaleString("en-MY", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function pos(i) { return "translateY(" + (-i * 100 / CELLS) + "%)"; }

  function wheel(digit) {
    var w = document.createElement("span");
    w.className = "odo-wheel";
    var s = document.createElement("span");
    s.className = "odo-strip";
    for (var i = 0; i < CELLS; i++) {
      var c = document.createElement("span");
      c.textContent = i % 10;
      s.appendChild(c);
    }
    s.style.transform = pos(digit);
    w.appendChild(s);
    w.digit = digit;
    return w;
  }

  // Build the face for a formatted string. Wheels start at the digits in `from` (same shape, zero padded).
  function face(el, text, from) {
    var f = document.createElement("span");
    f.className = "odo-face";
    f.setAttribute("aria-hidden", "true");
    var k = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch >= "0" && ch <= "9") f.appendChild(wheel(+from[k++]));
      else {
        var sep = document.createElement("span");
        sep.className = "odo-sep";
        sep.textContent = ch;
        f.appendChild(sep);
      }
    }
    var old = el.querySelector(".odo-face");
    if (old) old.replaceWith(f); else el.appendChild(f);
    return f;
  }

  function digits(text) { return text.replace(/\D/g, ""); }

  function roll(el, value, fromValue) {
    var text = format(el, value);
    var oldText = format(el, fromValue);
    var to = digits(text);
    var was = digits(oldText);
    while (was.length < to.length) was = "0" + was;
    was = was.slice(-to.length);
    el.querySelector(".odo-text").textContent = text;

    var f = el.querySelector(".odo-face");
    if (!f || f.dataset.shape !== text.replace(/\d/g, "0")) {
      f = face(el, text, was);
      f.dataset.shape = text.replace(/\d/g, "0");
    }
    el.shown = value;

    var wheels = f.querySelectorAll(".odo-wheel");
    var scale = Math.pow(10, +(el.dataset.decimals || 0));
    var delta = Math.round(Math.abs(value - fromValue) * scale);
    var up = value >= fromValue;
    wheels.forEach(function (w, i) {
      var strip = w.firstChild;
      var a = w.digit, b = +to[i];
      var place = wheels.length - 1 - i; // 0 for the last digit
      // Lower digits spin extra full turns, as many as the change really passed through, at most 3.
      var turns = Math.max(0, Math.min(3 - place, Math.floor(delta / Math.pow(10, place + 1))));
      if (strip.anim) strip.anim.cancel();
      w.digit = b;
      strip.style.transform = pos(b);
      if (a === b && turns === 0) return;
      if (reduce.matches || !strip.animate) return;
      var s, e;
      if (up) { s = a; e = b + 10 * (turns + (b < a ? 1 : 0)); }
      else { s = a + 10 * (turns + (b > a ? 1 : 0)); e = b; }
      var nudge = up ? 0.14 : -0.14;
      var frames = [
        { transform: pos(s), easing: EASE_OUT },
        { transform: pos(e + nudge), offset: 0.8, easing: EASE_SETTLE },
        { transform: pos(e) }
      ];
      var timing = { duration: 700 + 260 * turns, delay: i * 70, fill: "both" };
      try { strip.anim = strip.animate(frames, timing); }
      catch (err) { frames[0].easing = "ease-out"; frames[1].easing = "ease-in-out"; strip.anim = strip.animate(frames, timing); }
    });
  }

  function setup(el) {
    var value = +el.dataset.value;
    var label = document.createElement("span");
    label.className = "odo-text";
    label.textContent = el.textContent.trim() || format(el, value);
    el.textContent = "";
    el.appendChild(label);
    // Until the first roll the wheels sit on zero, in the shape of the final number.
    var text = format(el, value);
    face(el, text, digits(text).replace(/\d/g, "0")).dataset.shape = text.replace(/\d/g, "0");
    el.shown = 0;
    el.classList.add("is-ready");

    var started = false;
    function start() { if (!started) { started = true; roll(el, +el.dataset.value, 0); } }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { io.disconnect(); start(); }
      }, { threshold: 0.3 });
      io.observe(el);
    } else start();

    new MutationObserver(function () {
      var v = +el.dataset.value;
      if (!started) { started = true; roll(el, v, 0); return; }
      if (v !== el.shown) roll(el, v, el.shown);
    }).observe(el, { attributes: true, attributeFilter: ["data-value"] });
  }

  function init() { document.querySelectorAll(".odometer[data-value]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
