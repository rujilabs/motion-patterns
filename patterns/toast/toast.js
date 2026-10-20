/*
 * toast.js: window.toast({ title, body, tone }) adds a toast to the page's .toast-region (an
 * <ol aria-live="polite">). Up to --max (3) stay; a fourth sends the oldest away. Each toast has
 * a close button. It leaves when its .toast-bar animation ends, so a pause of the line (hover or
 * focus on the stack) is a pause of the timer.
 * Buttons with data-toast-title (and optional data-toast-body, data-toast-tone) make one on click.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var MAX = 3;

  function leave(li) {
    if (li.classList.contains("is-leaving")) return;
    li.classList.add("is-leaving");
    li.setAttribute("aria-hidden", "true");
    // no exit animation (reduced motion, or the CSS is missing): remove it now
    if (reduce.matches || getComputedStyle(li).animationName === "none") li.remove();
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function toast(o) {
    var region = document.querySelector(".toast-region");
    if (!region) return;
    var li = el("li", "toast");
    var card = el("div", "toast-card");
    if (o.tone) card.dataset.tone = o.tone;
    card.appendChild(el("p", "toast-title", o.title));
    if (o.body) card.appendChild(el("p", "toast-body", o.body));
    var x = el("button", "toast-close");
    x.type = "button";
    x.setAttribute("aria-label", "Dismiss");
    x.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
    x.addEventListener("click", function () { leave(li); });
    card.appendChild(x);
    var bar = el("span", "toast-bar");
    bar.setAttribute("aria-hidden", "true");
    card.appendChild(bar);
    var slot = el("div", "toast-slot");
    slot.appendChild(card);
    li.appendChild(slot);

    li.addEventListener("animationend", function (e) {
      if (e.animationName === "toast-life") leave(li);
      if (e.animationName === "toast-close") li.remove();
    });
    region.appendChild(li);

    var live = region.querySelectorAll(".toast:not(.is-leaving)");
    for (var i = 0; i < live.length - MAX; i++) leave(live[i]);
  }

  window.toast = toast;

  function start() {
    document.querySelectorAll("[data-toast-title]").forEach(function (b) {
      b.addEventListener("click", function () {
        toast({ title: b.dataset.toastTitle, body: b.dataset.toastBody, tone: b.dataset.toastTone });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
