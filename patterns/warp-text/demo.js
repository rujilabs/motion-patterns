/* Demo only: the stall under the pointer or with focus shows its details below the line. */
(function () {
  var out = document.querySelector("[data-stall-out]");
  document.querySelectorAll("[data-stall]").forEach(function (a) {
    function show() { out.textContent = a.getAttribute("data-stall"); }
    a.addEventListener("pointerenter", show);
    a.addEventListener("focus", show);
    a.addEventListener("click", function (e) { e.preventDefault(); show(); });
  });
})();
