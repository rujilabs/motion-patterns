/*
 * keycap.js: makes every .keycap press for real. A pointer or Enter/Space on the focused key holds it
 * down (.is-down) for as long as it is held. A key with aria-keyshortcuts="B" also presses when B is
 * typed anywhere on the page (not while typing in a field): it goes down, clicks at the bottom of its
 * travel the way a switch actuates, and comes back up on release. Every press stays down at least
 * MIN_MS, so a quick tap still shows its travel.
 */
(function () {
  var MIN_MS = 90;
  function typing(t) {
    return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }
  function down(el) {
    clearTimeout(el._keyUp);
    el._keyAt = performance.now();
    el.classList.add("is-down");
  }
  function up(el) {
    var held = performance.now() - (el._keyAt || 0);
    clearTimeout(el._keyUp);
    el._keyUp = setTimeout(function () { el.classList.remove("is-down"); }, Math.max(0, MIN_MS - held));
  }

  function setup(el) {
    if (el._keycap) return;
    el._keycap = true;
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || el.disabled) return;
      down(el);
      if (el.setPointerCapture) try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) {
      el.addEventListener(t, function () { if (el.classList.contains("is-down") && !el._keyHeld) up(el); });
    });
    el.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && !e.repeat) down(el);
    });
    el.addEventListener("keyup", function (e) {
      if (e.key === "Enter" || e.key === " ") up(el);
    });
    el.addEventListener("blur", function () { el._keyHeld = null; up(el); });
  }

  // page-wide shortcuts from aria-keyshortcuts (single keys only, no modifiers)
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
    var el = find(e.key);
    if (!el || el.disabled) return;
    e.preventDefault();
    if (e.repeat) return;
    el._keyHeld = e.key.toLowerCase();
    down(el);
    el.click();
  });
  document.addEventListener("keyup", function (e) {
    var el = find(e.key);
    if (el && el._keyHeld === e.key.toLowerCase()) { el._keyHeld = null; up(el); }
  });
  function find(key) {
    if (!key || key.length !== 1) return null;
    var k = key.toLowerCase();
    var list = document.querySelectorAll(".keycap[aria-keyshortcuts]");
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute("aria-keyshortcuts").toLowerCase() === k) return list[i];
    }
    return null;
  }

  function init() { document.querySelectorAll(".keycap").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
