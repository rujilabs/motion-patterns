/*
 * bounce-cards.js: every .bc list becomes a fan. Each item gets its place from the middle (--bc-k)
 * and its order (--bc-i, for the entrance stagger), and the list gets .bc-fan. A click or tap on a
 * print toggles .is-open, so touch screens can spread the fan too; a tap outside closes it.
 */
(function () {
  function setup(fan) {
    var items = [].slice.call(fan.children);
    var mid = (items.length - 1) / 2;
    items.forEach(function (li, i) {
      li.style.setProperty("--bc-k", (i - mid).toFixed(2));
      li.style.setProperty("--bc-i", i);
    });
    fan.classList.add("bc-fan");
    fan.addEventListener("click", function (e) {
      if (e.target.closest("button, a")) fan.classList.add("is-open");
    });
    document.addEventListener("pointerdown", function (e) {
      if (!fan.contains(e.target)) fan.classList.remove("is-open");
    });
  }
  function start() { document.querySelectorAll(".bc").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
