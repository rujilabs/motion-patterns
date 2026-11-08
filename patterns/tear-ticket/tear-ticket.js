/*
 * tear-ticket.js: tear the .tt-stub off a .tt ticket.
 *   Drag the stub down or to the right: it turns on its bottom corner as the tear runs down the
 *   perforation. Past data-tear px (default 110) it comes off and drops away; let go before that and
 *   it springs back. Enter, Space or a plain click tears it in one go.
 *   A [data-tt-reset] button in the same .tt-group puts the stub back; .tt-status there is told.
 * The ticket gets .is-torn and fires "tickettear"; reset fires "ticketreset".
 * Reduced motion: dragging still turns the stub, but it vanishes instead of falling and snaps back.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var MAXR = 16;

  function token(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function setup(t) {
    var stub = t.querySelector(".tt-stub");
    if (!stub || t._tt) return;
    t._tt = true;
    var group = t.closest(".tt-group") || t.parentNode;
    var reset = group.querySelector("[data-tt-reset]");
    var status = group.querySelector(".tt-status");
    var DIST = +t.dataset.tear || 110;
    var p = 0, start = null, moved = false, torn = false, anim = null;

    function pose(q) {
      p = q;
      stub.style.transform = "rotate(" + (q * MAXR).toFixed(2) + "deg) translateX(" + (q * 6).toFixed(1) + "px)";
    }
    function say(msg) { if (status) status.textContent = msg; }
    function stop() { if (anim) { anim.cancel(); anim = null; } }

    function tear() {
      if (torn) return;
      torn = true;
      start = null;
      stop();
      var from = stub.style.transform;
      function done() {
        anim = null;
        t.classList.add("is-torn");
        stub.style.transform = "";
        if (reset) { reset.hidden = false; reset.focus(); }
        say(t.dataset.done || "Stub torn off.");
        t.dispatchEvent(new CustomEvent("tickettear", { bubbles: true }));
      }
      if (reduce.matches) return done();
      anim = stub.animate([
        { transform: from, opacity: 1 },
        { transform: "translate(40px, 60px) rotate(30deg)", opacity: 1, offset: .35 },
        { transform: "translate(70px, 340px) rotate(58deg)", opacity: 0 }
      ], { duration: 900, easing: token("--ease-in", "ease-in") });
      anim.onfinish = done;
    }
    function springBack() {
      var from = stub.style.transform;
      pose(0);
      if (reduce.matches || !from) return;
      stop();
      anim = stub.animate([{ transform: from }, { transform: stub.style.transform }],
        { duration: 600, easing: token("--ease-spring", "ease-out") });
    }
    function tearByKey() {
      if (torn) return;
      stop();
      if (reduce.matches) return tear();
      anim = stub.animate([{ transform: "none" }, { transform: "rotate(" + MAXR + "deg) translateX(6px)" }],
        { duration: 380, easing: token("--ease-inout", "ease-in-out") });
      anim.onfinish = function () { pose(1); tear(); };
    }

    stub.addEventListener("pointerdown", function (e) {
      if (torn || e.button > 0) return;
      stop();
      start = { x: e.clientX, y: e.clientY };
      moved = false;
      stub.setPointerCapture(e.pointerId);
    });
    stub.addEventListener("pointermove", function (e) {
      if (!start) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      var q = Math.max(0, dx, dy) / DIST;
      if (q >= 1) { pose(1); tear(); } else pose(q);
    });
    function release() {
      if (!start) return;
      start = null;
      if (!torn) springBack();
    }
    stub.addEventListener("pointerup", release);
    stub.addEventListener("pointercancel", release);
    stub.addEventListener("click", function () {
      if (moved) { moved = false; return; }
      tearByKey();
    });

    if (reset) {
      reset.hidden = true;
      reset.addEventListener("click", function () {
        stop();
        torn = false;
        pose(0);
        t.classList.remove("is-torn");
        reset.hidden = true;
        say(t.dataset.reset || "Stub is back on.");
        stub.focus();
        if (!reduce.matches) anim = stub.animate([{ opacity: 0, transform: "translateY(-14px)" }, { opacity: 1, transform: "none" }],
          { duration: 450, easing: token("--ease-out", "ease-out") });
        t.dispatchEvent(new CustomEvent("ticketreset", { bubbles: true }));
      });
    }
  }

  function init() { document.querySelectorAll(".tt").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
