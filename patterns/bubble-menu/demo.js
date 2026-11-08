/* Demo only: the menu blooms once, 700 ms after the page shows, so the move is seen without a click. Focus stays put. */
(function () {
  var menu = document.querySelector(".bm");
  if (!menu || !window.BubbleMenu) return;
  setTimeout(function () { if (!document.activeElement || document.activeElement === document.body) BubbleMenu.open(menu); }, 700);
  document.querySelectorAll(".tp-frame a").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); }); });
})();
