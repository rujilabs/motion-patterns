/*
 * sheet.js: opens a dialog.bottom-sheet from any button with data-sheet="<dialog id>", at the half
 * detent. Its .bottom-sheet-grip button can be dragged, or clicked (and pressed with Enter or Space)
 * to switch between half and full. A click on the scrim and Esc close it.
 * On release, where the sheet will settle is judged from where it is plus a short throw of its
 * speed, so a quick flick travels further than a slow pull of the same length.
 * Under reduced motion the sheet does not follow the pointer: release still picks a detent.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(d) {
    var grip = d.querySelector(".bottom-sheet-grip");
    var startY = 0, startOffset = 0, lastY = 0, lastT = 0, speed = 0, moved = false, held = false;

    function height() { return d.getBoundingClientRect().height; }
    function stopOffset() { return d.dataset.stop === "full" ? 0 : height() * 0.5; }
    function say() { if (grip) grip.setAttribute("aria-label", d.dataset.stop === "full" ? "Shrink to half" : "Expand to full"); }

    function settle(to) {
      d.classList.remove("is-dragging");
      d.style.setProperty("--bs-drag", "0px");
      if (to === "close") { d.close(); return; }
      d.dataset.stop = to;
      say();
    }

    d.addEventListener("close", function () { d.dataset.stop = "half"; say(); });
    d.addEventListener("click", function (e) {
      if (e.target !== d) return;
      var r = d.getBoundingClientRect();
      if (e.clientY < r.top || e.clientX < r.left || e.clientX > r.right) d.close();
    });
    if (!grip) return;
    say();

    grip.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); moved = false; return; }
      settle(d.dataset.stop === "full" ? "half" : "full");
    });

    grip.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      held = true; moved = false;
      startY = lastY = e.clientY; lastT = e.timeStamp; speed = 0;
      startOffset = stopOffset();
      grip.setPointerCapture(e.pointerId);
    });

    grip.addEventListener("pointermove", function (e) {
      if (!held) return;
      var dy = e.clientY - startY;
      if (!moved && Math.abs(dy) < 4) return;
      if (!moved) { moved = true; if (!reduce.matches) d.classList.add("is-dragging"); }
      var dt = e.timeStamp - lastT;
      if (dt > 0) speed = (e.clientY - lastY) / dt;
      lastY = e.clientY; lastT = e.timeStamp;
      if (reduce.matches) return;
      // above the full detent the sheet resists: it moves a fifth of the pointer's travel
      var offset = startOffset + dy;
      if (offset < 0) offset = offset * 0.2;
      d.style.setProperty("--bs-drag", (offset - startOffset) + "px");
    });

    function release(e) {
      if (!held) return;
      held = false;
      if (!moved) return;
      var h = height();
      var at = startOffset + (e.clientY - startY);
      var aim = at + speed * 160;
      if (aim > h * 0.75) settle("close");
      else settle(aim < h * 0.25 ? "full" : "half");
    }
    grip.addEventListener("pointerup", release);
    grip.addEventListener("pointercancel", release);
  }

  function start() {
    document.querySelectorAll("dialog.bottom-sheet").forEach(setup);
    document.querySelectorAll("[data-sheet]").forEach(function (btn) {
      var d = document.getElementById(btn.getAttribute("data-sheet"));
      if (!d || typeof d.showModal !== "function") return;
      btn.addEventListener("click", function () { d.dataset.stop = "half"; d.showModal(); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
