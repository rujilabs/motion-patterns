/*
 * shake.js: window.shake(el) plays the shake class already on el (.shake-x or .shake-screen) from
 * the start, even if it is still running. A button with data-shake and aria-controls="<id>" calls
 * it on click. With data-shake-say="..." and data-shake-out="<id>" it also writes that text into
 * the element with that id (make it aria-live), because a shake alone tells nobody what went wrong.
 * Reduced motion: the text still appears, the element stays still.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function shake(el) {
    if (!el || reduce.matches) return;
    el.classList.remove("is-shaking");
    void el.offsetWidth; // restart: the browser must see the class leave before it comes back
    el.classList.add("is-shaking");
  }
  window.shake = shake;

  document.addEventListener("animationend", function (e) {
    if (e.target.classList && /^shake-/.test(e.animationName)) e.target.classList.remove("is-shaking");
  });

  function start() {
    document.querySelectorAll("[data-shake]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var out = document.getElementById(btn.getAttribute("data-shake-out"));
        var say = btn.getAttribute("data-shake-say");
        if (out && say) out.textContent = say;
        shake(document.getElementById(btn.getAttribute("aria-controls")));
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
