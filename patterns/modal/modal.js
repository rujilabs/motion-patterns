/*
 * modal.js: opens a dialog.modal from any button with data-modal="<dialog id>" and closes it on a
 * click on the backdrop. Esc and <form method="dialog"> buttons close it natively, and the browser
 * returns focus to the button that opened it. The motion is all in style.css.
 */
(function () {
  function start() {
    document.querySelectorAll("[data-modal]").forEach(function (btn) {
      var d = document.getElementById(btn.getAttribute("data-modal"));
      if (!d || typeof d.showModal !== "function") return;
      btn.addEventListener("click", function () { d.showModal(); });
    });
    document.querySelectorAll("dialog.modal").forEach(function (d) {
      // a click whose target is the dialog itself and lands outside its box hit the backdrop
      d.addEventListener("click", function (e) {
        if (e.target !== d) return;
        var r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close("cancel");
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
