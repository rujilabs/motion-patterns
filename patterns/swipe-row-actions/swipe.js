/*
 * swipe.js: swipe a list row left to show the actions behind it.
 *   Pointer: drag a row sideways. Let go past half the actions and it snaps open, short of that it
 *            snaps shut. Past either end it stretches like rubber. Past 55 percent of the row, Archive
 *            widens across it and letting go archives the row. Only one row is open at a time; a tap
 *            on an open row shuts it.
 *   Keys and screen readers: the dots button (.swipe-more) opens and shuts the row and moves focus to
 *            Archive. Arrow Left opens, Arrow Right and Escape shut.
 * Archive or Delete slides the row away and collapses its height, then hides the <li> and fires
 * "action" on it (detail.action is "archive" or "delete"). Focus moves to the next row's dots button.
 * Markup: <li class="swipe"> with .swipe-face (holding .swipe-more) and .swipe-actions
 * (.swipe-archive, .swipe-delete).
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var openRow = null;
  function token(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
  // rubber: the further past a stop you pull, the less it gives, never more than lim
  function rubber(over, lim) { return lim * (1 - 1 / (over / lim * 0.6 + 1)); }

  function setup(li) {
    if (li._swipe) return;
    li._swipe = true;
    var face = li.querySelector(".swipe-face"), acts = li.querySelector(".swipe-actions");
    var more = li.querySelector(".swipe-more"), archive = li.querySelector(".swipe-archive"), del = li.querySelector(".swipe-delete");
    var x = 0, drag = null, anims = [], gone = false, skipClick = false;

    function open() { return parseFloat(getComputedStyle(li).getPropertyValue("--swipe-open")) || 160; }
    function full() { return li.offsetWidth * 0.55; }
    function stop() { anims.forEach(function (a) { a.cancel(); }); anims = []; }
    function paint(v) {
      face.style.transform = "translateX(" + v.toFixed(1) + "px)";
      acts.style.width = Math.max(open(), -v).toFixed(1) + "px";
    }
    function set(v) { stop(); x = v; paint(v); li.classList.toggle("is-full", -v > full()); }
    function here() {
      var m = getComputedStyle(face).transform;
      return m && m !== "none" ? parseFloat(m.slice(m.indexOf("(") + 1, -1).split(",")[4]) || 0 : x;
    }
    function glide(to, ms, easing, then) {
      var from = here();
      x = to;
      if (reduce.matches) { set(to); if (then) then(); return; }
      stop();
      var o = { duration: ms, easing: easing };
      var w = function (v) { return Math.max(open(), -v) + "px"; };
      anims = [
        face.animate([{ transform: "translateX(" + from + "px)" }, { transform: "translateX(" + to + "px)" }], o),
        acts.animate([{ width: w(from) }, { width: w(to) }], o)
      ];
      paint(to);
      anims[0].onfinish = function () { stop(); if (then) then(); };
    }
    function state(isOpen) {
      more.setAttribute("aria-expanded", isOpen ? "true" : "false");
      acts.inert = !isOpen;
      if (isOpen && openRow && openRow !== li) openRow._shut();
      if (isOpen) openRow = li; else if (openRow === li) openRow = null;
    }
    function snapOpen() { li.classList.remove("is-full"); state(true); glide(-open(), 520, token("--ease-spring", "ease-out")); }
    function shut() { li.classList.remove("is-full"); state(false); glide(0, 280, token("--ease-out", "ease-out")); }
    li._shut = shut;

    function act(kind) {
      if (gone) return;
      gone = true;
      state(false);
      var next = li.nextElementSibling;
      while (next && (next.hidden || !next.querySelector(".swipe-more"))) next = next.nextElementSibling;
      var prev = li.previousElementSibling;
      while (prev && prev.hidden) prev = prev.previousElementSibling;
      var hadFocus = li.contains(document.activeElement);
      if (kind === "archive") li.classList.add("is-full");
      function done() {
        li.hidden = true;
        if (hadFocus) { var t = next || prev; if (t && t.querySelector(".swipe-more")) t.querySelector(".swipe-more").focus(); }
        li.dispatchEvent(new CustomEvent("action", { bubbles: true, detail: { action: kind } }));
      }
      glide(-li.offsetWidth, 240, token("--ease-in", "ease-in"), function () {
        if (reduce.matches) { done(); return; }
        var h = li.offsetHeight;
        li.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 280, easing: token("--ease-inout", "ease") }).onfinish = done;
        li.style.height = "0px";
      });
    }

    face.addEventListener("pointerdown", function (e) {
      if (gone || e.button !== 0) return;   // a drag may start on the dots button too
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: here(), dir: null };
    });
    face.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.dir) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          drag.dir = "x";
          try { face.setPointerCapture(e.pointerId); } catch (err) {}
          if (openRow && openRow !== li) openRow._shut();
          set(drag.from);
          li.classList.add("is-dragging");
        } else if (Math.abs(dy) > 8) { drag = null; return; }
        else return;
      }
      var raw = drag.from + dx, w = li.offsetWidth, v = raw;
      if (raw > 0) v = rubber(raw, 36);
      else if (raw < -w * 0.8) v = -w * 0.8 - rubber(-w * 0.8 - raw, 40);
      set(v);
    });
    function up(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var was = drag.dir;
      drag = null;
      li.classList.remove("is-dragging");
      if (was !== "x") { if (openRow && !more.contains(e.target)) openRow._shut(); return; }
      skipClick = true;
      setTimeout(function () { skipClick = false; }, 0);
      if (e.type !== "pointercancel" && -x > full()) act("archive");
      else if (-x > open() / 2) snapOpen();
      else shut();
    }
    face.addEventListener("pointerup", up);
    face.addEventListener("pointercancel", up);

    more.addEventListener("click", function () {
      if (skipClick) return;
      if (more.getAttribute("aria-expanded") === "true") shut();
      else { snapOpen(); archive.focus({ preventScroll: true }); }
    });
    li.addEventListener("keydown", function (e) {
      if (gone) return;
      var isOpen = more.getAttribute("aria-expanded") === "true";
      if (e.key === "ArrowLeft" && e.target === more && !isOpen) { e.preventDefault(); snapOpen(); archive.focus({ preventScroll: true }); }
      else if ((e.key === "Escape" || e.key === "ArrowRight") && isOpen) { e.preventDefault(); shut(); more.focus(); }
    });
    archive.addEventListener("click", function () { act("archive"); });
    del.addEventListener("click", function () { act("delete"); });

    li.reset = function () {
      gone = false;
      li.hidden = false;
      li.style.height = "";
      li.classList.remove("is-full");
      state(false);
      set(0);
    };
    li.classList.add("is-ready");
    state(false);
    set(0);
  }

  function init() { document.querySelectorAll(".swipe").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
