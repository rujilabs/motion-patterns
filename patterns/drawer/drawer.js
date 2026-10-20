/*
 * drawer.js: opens a dialog.drawer from any button with data-drawer="<dialog id>" and closes it on a
 * click on the scrim. Esc and <form method="dialog"> buttons close it natively, and focus goes back
 * to the button that opened it. The motion is all in style.css.
 */
(function () {
  function start() {
    document.querySelectorAll("[data-drawer]").forEach(function (btn) {
      var d = document.getElementById(btn.getAttribute("data-drawer"));
      if (!d || typeof d.showModal !== "function") return;
      btn.addEventListener("click", function () {
        d.showModal();
        btn.setAttribute("aria-expanded", "true");
      });
      d.addEventListener("close", function () { btn.setAttribute("aria-expanded", "false"); });
    });
    document.querySelectorAll("dialog.drawer").forEach(function (d) {
      d.addEventListener("click", function (e) {
        if (e.target !== d) return;
        var r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
