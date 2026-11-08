/* Demo only: the nav opens once, 700 ms after the page shows, so the move is seen without a click. Focus stays put. */
(function () {
  var nav = document.querySelector(".cn");
  if (!nav || !window.CardNav) return;
  setTimeout(function () { if (!document.activeElement || document.activeElement === document.body) CardNav.open(nav); }, 700);
  document.querySelectorAll(".lk-frame a").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); }); });
})();
