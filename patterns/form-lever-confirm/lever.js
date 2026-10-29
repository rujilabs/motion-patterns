/*
 * lever.js: a pull-to-confirm lever for an action that must not happen by accident.
 * Pull the handle all the way down and it latches and fires "confirm" on the element. Let go
 * early and its spring throws it back up against the rest stop, where it knocks back a little.
 * The arm has mass: while you pull it trails your hand on a stiff spring.
 *   Pointer: drag anywhere on the lever; the arm turns by how far you turn about the pivot,
 *            so a tap never jumps it.
 *   Keys:    hold Space, Enter or Arrow Down to pull at a steady pace; let go early and it springs back.
 *   A tap or a screen reader click (no drag): the first one pulls it halfway and arms it, a second
 *            one within 5 seconds sends. The status text (data-status="id") says what to do.
 * Markup: an SVG inside <button class="lever" data-pivot="52 110" data-length="140" data-rest="-38"
 * data-end="38">, with .lever-rod, .lever-shine, .lever-ball, .lever-gloss, .lever-shadow and
 * .lever-fill (an arc path with pathLength="1"). el.reset() lets the latch go.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAD = Math.PI / 180;

  function setup(el) {
    if (el._lever) return;
    el._lever = true;
    var pv = (el.dataset.pivot || "52 110").split(/\s+/).map(Number);
    var L = +el.dataset.length || 140;
    var REST = +(el.dataset.rest || -38), END = +(el.dataset.end || 38);
    var q = function (s) { return el.querySelector(s); };
    var rod = q(".lever-rod"), shine = q(".lever-shine"), ball = q(".lever-ball"), gloss = q(".lever-gloss"),
        shadow = q(".lever-shadow"), fill = q(".lever-fill");
    var status = el.dataset.status ? document.getElementById(el.dataset.status) : null;
    var idle = status ? status.textContent : "";

    var a = REST, v = 0, target = REST;    // angle (deg, clockwise from pointing right), velocity (deg/s)
    var mode = "rest";                     // rest | drag | key | armed | latched
    var raf = 0, last = 0, drag = null, keyDown = null, armTimer = 0;

    function say(t) { if (status) status.textContent = t; }
    function draw() {
      var x = pv[0] + L * Math.cos(a * RAD), y = pv[1] + L * Math.sin(a * RAD);
      var r = +ball.getAttribute("r");
      rod.setAttribute("x2", x.toFixed(2)); rod.setAttribute("y2", y.toFixed(2));
      shine.setAttribute("x2", x.toFixed(2)); shine.setAttribute("y2", (y - 2).toFixed(2));
      ball.setAttribute("cx", x.toFixed(2)); ball.setAttribute("cy", y.toFixed(2));
      gloss.setAttribute("cx", (x - r * .32).toFixed(2)); gloss.setAttribute("cy", (y - r * .36).toFixed(2));
      shadow.setAttribute("cx", (x + 2).toFixed(2)); shadow.setAttribute("cy", (y + r * .9).toFixed(2));
      var k = Math.max(0, Math.min(1, (a - REST) / (END - REST)));
      if (fill) fill.style.strokeDasharray = k.toFixed(4) + " 2";
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(step); } }

    // one frame of the arm: a spring toward the target, with hard stops at both ends
    function step(t) {
      var dt = last ? Math.min(0.032, (t - last) / 1000) : 1 / 60; last = t;
      if (mode === "key") target = Math.min(END, target + 72 * dt);   // a steady pull, about a second to the end
      var held = mode === "drag" || mode === "key" || mode === "armed";
      var k = held ? 520 : 170, c = held ? 2 * Math.sqrt(k) * 0.9 : 2 * Math.sqrt(k) * 0.32;
      if (reduce.matches) { a = target; v = 0; }
      else {
        // substeps keep the stiff spring stable
        for (var i = 0; i < 4; i++) {
          var h = dt / 4;
          v += (k * (target - a) - c * v) * h;
          a += v * h;
          if (a < REST) { a = REST; v = v < 0 ? -v * 0.32 : v; if (Math.abs(v) < 8) v = 0; }   // the rest stop: a dull knock
          if (a > END) { a = END; v = 0; }
        }
      }
      draw();
      if (held && a >= END - 0.6) { latch(); return; }
      if (!held && Math.abs(a - target) < 0.05 && Math.abs(v) < 0.5) { a = target; v = 0; draw(); raf = 0; return; }
      raf = requestAnimationFrame(step);
    }

    function latch() {
      raf = 0; a = END; v = 0; draw();
      mode = "latched";
      clearTimeout(armTimer);
      el.classList.remove("is-armed", "is-pulling");
      el.classList.add("is-latched");
      el.setAttribute("aria-disabled", "true");
      if (!reduce.matches && ball.animate) {
        // the latch catches: the handle jolts against it
        ball.animate([{ transform: "translateY(0)" }, { transform: "translateY(3px)" }, { transform: "translateY(0)" }], { duration: 160, easing: "ease-out" });
      }
      el.dispatchEvent(new CustomEvent("confirm", { bubbles: true }));
    }
    function letGo(msg) {
      if (mode === "latched") return;
      mode = "rest"; target = REST;
      el.classList.remove("is-armed", "is-pulling");
      clearTimeout(armTimer);
      if (msg) say(msg);
      kick();
    }

    // pointer: relative drag about the pivot
    function angleAt(e) {
      var box = el.querySelector("svg").getBoundingClientRect();
      var vb = el.querySelector("svg").viewBox.baseVal;
      var sx = box.width / vb.width, sy = box.height / vb.height;
      var px = box.left + pv[0] * sx, py = box.top + pv[1] * sy;
      return Math.atan2(e.clientY - py, e.clientX - px) / RAD;
    }
    el.addEventListener("pointerdown", function (e) {
      if (mode === "latched" || e.button !== 0) return;
      e.preventDefault();
      el.focus({ preventScroll: true, focusVisible: false });
      drag = { id: e.pointerId, from: angleAt(e), start: mode === "armed" ? target : a, x: e.clientX, y: e.clientY, moved: false };
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });
    el.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      if (!drag.moved) { drag.moved = true; mode = "drag"; clearTimeout(armTimer); el.classList.remove("is-armed"); el.classList.add("is-pulling"); say("Keep pulling, all the way down."); }
      var d = angleAt(e) - drag.from;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      target = Math.max(REST, Math.min(END, drag.start + d));
      kick();
    });
    function up(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var moved = drag.moved;
      drag = null;
      if (moved) { el._skipClick = true; setTimeout(function () { el._skipClick = false; }, 0); }
      if (moved && mode === "drag") letGo("Let go too early. Nothing was sent.");
    }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    // keys: hold to pull
    el.addEventListener("keydown", function (e) {
      if (mode === "latched") return;
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        if (e.repeat || keyDown) return;
        keyDown = e.key;
        mode = "key"; target = Math.max(a, target);
        clearTimeout(armTimer);
        el.classList.remove("is-armed"); el.classList.add("is-pulling");
        say("Keep holding.");
        kick();
      }
    });
    el.addEventListener("keyup", function (e) {
      if (e.key !== keyDown) return;
      e.preventDefault();
      keyDown = null;
      el._skipClick = true;
      setTimeout(function () { el._skipClick = false; }, 0);
      if (mode === "key") letGo("Let go too early. Nothing was sent.");
    });
    el.addEventListener("blur", function () { if (keyDown) { keyDown = null; letGo(idle); } });

    // a tap or an assistive technology click: two steps
    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (el._skipClick) { el._skipClick = false; return; }
      if (mode === "latched") return;
      if (mode === "armed") { target = END; kick(); return; }   // second step: it finishes the pull and latches
      mode = "armed";
      target = REST + (END - REST) * 0.5;
      el.classList.add("is-armed");
      say("Halfway. Press again within 5 seconds to send.");
      clearTimeout(armTimer);
      armTimer = setTimeout(function () { letGo("Timed out. Nothing was sent."); }, 5000);
      kick();
    });

    el.reset = function () {
      if (mode !== "latched") return;
      mode = "rest"; target = REST; v = 0;
      el.classList.remove("is-latched", "is-pulling");
      el.removeAttribute("aria-disabled");
      say(idle);
      kick();
    };
    draw();
    el.classList.add("is-ready");
  }

  function init() { document.querySelectorAll(".lever").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
