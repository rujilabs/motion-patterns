/*
 * card-detail.js: opens a card from a grid into its detail view, and back.
 *
 *   <div class="cd">
 *     <ul class="cd-grid">
 *       <li><button class="cd-card" type="button" data-id="kunyit">
 *         <span class="cd-chip"></span><span class="cd-name">Kunyit Muda</span> ...</button></li>
 *     </ul>
 *     <section class="cd-detail" aria-labelledby="cd-h">
 *       <button type="button" data-cd-close>Back</button>
 *       <span class="cd-chip"></span><h2 class="cd-name" id="cd-h" tabindex="-1"></h2> ...
 *     </section>
 *   </div>
 *
 * Listen for "card-detail" on .cd to fill the detail: detail.card is the pressed card, or null
 * when it closes. It fires in the middle of the swap, so fill the detail synchronously.
 * Focus moves to the detail heading on open and back to the card on close. Escape closes.
 * A View Transition does the morph where the browser has one; elsewhere a FLIP with clip-path
 * and transform does the same. Under reduced motion the views swap at once.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var NAMES = ["cd-frame", "cd-chip", "cd-name"];

  function parts(el) { return [el, el.querySelector(".cd-chip"), el.querySelector(".cd-name")]; }
  function name(el, on) { parts(el).forEach(function (p, i) { if (p) p.style.viewTransitionName = on ? NAMES[i] : ""; }); }
  function dur(root) { return parseFloat(getComputedStyle(root).getPropertyValue("--cd-dur")) || 480; }
  function ease() { return getComputedStyle(document.documentElement).getPropertyValue("--ease-inout").trim() || "ease-in-out"; }

  function swap(root, card) {
    var detail = root.querySelector(".cd-detail"), grid = root.querySelector(".cd-grid");
    root.dispatchEvent(new CustomEvent("card-detail", { detail: { card: card } }));
    root.classList.toggle("is-open", !!card);
    detail.inert = !card; grid.inert = !!card;
    detail.setAttribute("aria-hidden", String(!card));
  }

  // FLIP by hand: the panel's clip opens from the card's rectangle and the chip flies from the card's chip
  function flip(root, card, opening) {
    var detail = root.querySelector(".cd-detail"), grid = root.querySelector(".cd-grid");
    var cr = card.getBoundingClientRect(), cc = card.querySelector(".cd-chip").getBoundingClientRect();
    if (opening) swap(root, card);
    var dr = detail.getBoundingClientRect(), dchip = detail.querySelector(".cd-chip"), dc = dchip.getBoundingClientRect();
    var r = getComputedStyle(root).getPropertyValue("--cd-radius").trim() || "10px";
    var clip = "inset(" + (cr.top - dr.top) + "px " + (dr.right - cr.right) + "px " + (dr.bottom - cr.bottom) + "px " + (cr.left - dr.left) + "px round " + r + ")";
    var full = "inset(0px 0px 0px 0px round " + r + ")";
    var move = "translate(" + (cc.left - dc.left) + "px, " + (cc.top - dc.top) + "px) scale(" + (cc.width / dc.width) + ", " + (cc.height / dc.height) + ")";
    var o = { duration: dur(root), easing: ease(), fill: "both" };
    if (!opening) grid.style.visibility = "visible";
    var a = detail.animate({ clipPath: opening ? [clip, full] : [full, clip] }, o);
    dchip.style.transformOrigin = "0 0";
    var b = dchip.animate({ transform: opening ? [move, "none"] : ["none", move] }, o);
    var c = grid.animate({ opacity: opening ? [1, 0] : [0, 1] }, { duration: dur(root) * .6, delay: opening ? 0 : dur(root) * .4, fill: "both" });
    if (opening) grid.style.visibility = "visible";
    // the rest of the detail fades in once the panel is mostly open, and out first when it closes
    var rest = [].slice.call(detail.children).filter(function (el) { return el !== dchip; }).map(function (el) {
      return el.animate({ opacity: opening ? [0, 1] : [1, 0] },
        { duration: dur(root) * (opening ? .5 : .3), delay: opening ? dur(root) * .45 : 0, fill: "both" });
    });
    return a.finished.then(function () {
      if (!opening) swap(root, null);
      grid.style.visibility = "";
      [a, b, c].concat(rest).forEach(function (x) { x.cancel(); });
    });
  }

  function open(root, card) {
    if (root._cdBusy || root.classList.contains("is-open")) return;
    root._cdCard = card;
    var heading = function () { var h = root.querySelector(".cd-detail .cd-name"); if (h) h.focus({ preventScroll: true }); };
    if (reduce.matches) { swap(root, card); heading(); return; }
    root._cdBusy = true;
    var done = function () { root._cdBusy = false; heading(); };
    if (document.startViewTransition) {
      name(card, true);
      var t = document.startViewTransition(function () {
        name(card, false);
        swap(root, card);
        name(root.querySelector(".cd-detail"), true);
      });
      t.finished.finally(function () { name(root.querySelector(".cd-detail"), false); done(); });
    } else flip(root, card, true).then(done, done);
  }

  function close(root) {
    var card = root._cdCard;
    if (root._cdBusy || !root.classList.contains("is-open") || !card) return;
    var back = function () { card.focus({ preventScroll: true }); };
    if (reduce.matches) { swap(root, null); back(); return; }
    root._cdBusy = true;
    var done = function () { root._cdBusy = false; back(); };
    if (document.startViewTransition) {
      var detail = root.querySelector(".cd-detail");
      name(detail, true);
      var t = document.startViewTransition(function () {
        name(detail, false);
        swap(root, null);
        name(card, true);
      });
      t.finished.finally(function () { name(card, false); done(); });
    } else flip(root, card, false).then(done, done);
  }

  function setup(root) {
    if (root._cd) return;
    root._cd = true;
    var detail = root.querySelector(".cd-detail");
    detail.inert = true; detail.setAttribute("aria-hidden", "true");
    root.addEventListener("click", function (e) {
      var card = e.target.closest(".cd-card");
      if (card && root.contains(card)) return open(root, card);
      if (e.target.closest("[data-cd-close]")) close(root);
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) { e.preventDefault(); close(root); }
    });
  }
  window.CardDetail = {
    open: function (root, card) { open(root, card); },
    close: function (root) { close(root); }
  };
  function init() { document.querySelectorAll(".cd").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
