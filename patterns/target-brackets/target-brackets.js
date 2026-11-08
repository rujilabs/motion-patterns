/*
 * target-brackets.js: inside every .tb, moves the .tb-frame onto the .tb-target under a mouse, a
 * tapped one, or the one with keyboard focus. The first placement jumps there and fades in; after
 * that the frame glides. A mouse leaving the area hides it, unless a target has keyboard focus.
 */
(function () {
  function setup(box) {
    var frame = box.querySelector(".tb-frame");
    if (!frame) return;
    var current = null;
    box.classList.add("tb-ready");

    function place(card) {
      var b = box.getBoundingClientRect();
      var r = card.getBoundingClientRect();
      frame.style.setProperty("--tb-x", (r.left - b.left).toFixed(1) + "px");
      frame.style.setProperty("--tb-y", (r.top - b.top).toFixed(1) + "px");
      frame.style.setProperty("--tb-w", r.width.toFixed(1) + "px");
      frame.style.setProperty("--tb-h", r.height.toFixed(1) + "px");
    }

    function show(card) {
      if (!card || card === current) return;
      current = card;
      if (!frame.classList.contains("is-on")) {
        frame.classList.add("is-jump");
        place(card);
        frame.getBoundingClientRect();
        frame.classList.add("is-on");
        requestAnimationFrame(function () { frame.classList.remove("is-jump"); });
      } else {
        place(card);
      }
    }

    function hide() {
      current = null;
      frame.classList.remove("is-on");
    }

    function focused() {
      var f = document.activeElement;
      return f && box.contains(f) && f.matches(".tb-target:focus-visible") ? f : null;
    }

    box.addEventListener("pointerover", function (e) {
      var card = e.target.closest(".tb-target");
      if (card && box.contains(card)) show(card);
    });
    box.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      var f = focused();
      if (f) show(f); else hide();
    });
    box.addEventListener("focusin", function (e) {
      var card = e.target.closest(".tb-target");
      if (card && card.matches(":focus-visible")) show(card);
    });
    box.addEventListener("focusout", function (e) {
      if (!box.contains(e.relatedTarget) && !box.matches(":hover")) hide();
    });
    window.addEventListener("resize", function () { if (current) place(current); });
  }

  function start() { document.querySelectorAll(".tb").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
