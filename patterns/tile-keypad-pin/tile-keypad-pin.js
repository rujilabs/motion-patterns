/*
 * tile-keypad-pin.js: a PIN keypad whose keys press in 3D, with dots that fill, shake on a wrong
 * code and ripple on a right one. The digits are never shown or written to the page.
 *
 *   <div class="pin-pad" data-length="6" data-status="pin-status">
 *     <div class="pin-dots" role="img" aria-label="PIN, 0 of 6 digits entered"></div>
 *     <div class="pin-keys" role="group" aria-label="PIN keypad">
 *       <button type="button" class="pin-key" data-key="1">1</button> ... <button ... data-key="0">0</button>
 *       <button type="button" class="pin-key" data-key="del" aria-label="Delete last digit">...</button>
 *     </div>
 *   </div>
 *   <p id="pin-status" role="status"></p>
 *
 * The script adds one dot per digit. A key tips toward the point where it was pressed and sinks; the
 * keyboard presses it straight down. Number keys and Backspace work while focus is in the pad.
 * When the last digit goes in, the pad fires "pinentry" with detail.pin; answer with
 * pad.pinResult(true, "message") or pad.pinResult(false, "message"). The status line says how many
 * digits are in and what happened, never which digits.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(pad) {
    if (pad._pin) return;
    pad._pin = true;
    var length = parseInt(pad.dataset.length, 10) || 6;
    var dotsBox = pad.querySelector(".pin-dots");
    var keys = Array.prototype.slice.call(pad.querySelectorAll(".pin-key"));
    var status = pad.dataset.status ? document.getElementById(pad.dataset.status) : null;
    var digits = "", busy = false;

    var dots = [];
    for (var i = 0; i < length; i++) {
      var d = document.createElement("span");
      d.className = "pin-dot";
      dotsBox.appendChild(d);
      dots.push(d);
    }
    function ease() { return getComputedStyle(document.documentElement).getPropertyValue("--ease-spring").trim() || "ease-out"; }
    function say(t) { if (status) status.textContent = t; }
    function count() { return digits.length + " of " + length + " digits entered"; }
    function paint() {
      dots.forEach(function (d, i) { d.classList.toggle("is-on", i < digits.length); });
      dotsBox.setAttribute("aria-label", "PIN, " + count());
    }

    // ---- the press: tilt toward the touch point and sink, spring back on release
    function press(key, x, y) {
      key.style.setProperty("--tilt-x", (-y * 12).toFixed(2) + "deg");
      key.style.setProperty("--tilt-y", (x * 12).toFixed(2) + "deg");
      key.classList.add("is-down");
    }
    function release(key) { key.classList.remove("is-down"); }
    keys.forEach(function (key) {
      key.addEventListener("pointerdown", function (e) {
        var r = key.getBoundingClientRect();
        press(key, ((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
      });
      ["pointerup", "pointerleave", "pointercancel", "blur"].forEach(function (t) { key.addEventListener(t, function () { release(key); }); });
      key.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") press(key, 0, 0); });
      key.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") release(key); });
      key.addEventListener("click", function () { enter(key.dataset.key); });
    });
    // number keys and Backspace typed while focus is anywhere in the pad press the matching tile
    pad.addEventListener("keydown", function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = /^[0-9]$/.test(e.key) ? e.key : (e.key === "Backspace" ? "del" : null);
      if (!k) return;
      e.preventDefault();
      var key = pad.querySelector('.pin-key[data-key="' + k + '"]');
      if (!key || key.disabled) return;
      if (!e.repeat) { press(key, 0, 0); setTimeout(function () { release(key); }, 120); }
      enter(k);
    });

    function enter(k) {
      if (busy || !k) return;
      if (k === "del") {
        if (!digits) { say("Nothing to delete. " + count() + "."); return; }
        digits = digits.slice(0, -1);
        paint();
        say("Deleted one. " + count() + ".");
        return;
      }
      if (digits.length >= length) return;
      digits += k;
      paint();
      var dot = dots[digits.length - 1];
      if (!reduce.matches && dot.animate) {
        dot.animate([{ transform: "scale(.4)" }, { transform: "scale(1)" }], { duration: 380, easing: ease() });
      }
      if (digits.length < length) { say(count() + "."); return; }
      busy = true;
      say("Checking your PIN.");
      var pin = digits;
      pad.dispatchEvent(new CustomEvent("pinentry", { detail: { pin: pin } }));
    }

    pad.pinResult = function (ok, message) {
      digits = "";
      if (ok) {
        dotsBox.classList.add("is-ok");
        dotsBox.setAttribute("aria-label", "PIN accepted");
        say(message || "PIN accepted.");
        if (!reduce.matches && dotsBox.animate) {
          // a ripple of small hops from left to right: yes
          dots.forEach(function (d, i) {
            d.animate([{ transform: "translateY(0)" }, { transform: "translateY(-7px)", offset: 0.4 }, { transform: "translateY(0)" }],
              { duration: 420, delay: i * 55, easing: "ease-in-out" });
          });
        }
        return;
      }
      dotsBox.classList.add("is-wrong");
      say(message || "Wrong PIN. Try again.");
      var done = function () {
        dotsBox.classList.remove("is-wrong");
        paint();
        busy = false;
      };
      if (reduce.matches || !dotsBox.animate) { setTimeout(done, 700); return; }
      // a decaying shake: no. Each swing is smaller and they slow down, as a real head shake does
      dotsBox.animate([
        { transform: "translateX(0)" }, { transform: "translateX(-14px)", offset: 0.1 }, { transform: "translateX(12px)", offset: 0.25 },
        { transform: "translateX(-8px)", offset: 0.42 }, { transform: "translateX(5px)", offset: 0.6 }, { transform: "translateX(-2px)", offset: 0.78 },
        { transform: "translateX(0)" }
      ], { duration: 560, easing: "linear" }).finished.then(function () { setTimeout(done, 200); }, done);
    };
    pad.pinReset = function () {
      digits = "";
      busy = false;
      dotsBox.classList.remove("is-ok", "is-wrong");
      paint();
    };
    paint();
  }

  function init() { document.querySelectorAll(".pin-pad").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
