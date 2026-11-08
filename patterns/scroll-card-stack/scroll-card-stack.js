/*
 * scroll-card-stack.js: for each card, adds up how far the cards after it cover it (0 to 1 each) and
 * scrubs its paused stack-sink animation to that depth (3 cards deep = the end). Runs on scroll and
 * resize only. Off under reduced motion, where the CSS turns the stack into a plain list.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function start() {
    if (still.matches) return;
    var stacks = [];
    document.querySelectorAll(".stack").forEach(function (s) {
      var cards = [];
      for (var i = 0; i < s.children.length; i++) {
        var c = s.children[i];
        if (!c.classList.contains("stack-card") || !c.getAnimations) continue;
        var a = c.getAnimations()[0];
        if (a) cards.push({ el: c, a: a, dur: a.effect.getComputedTiming().duration, top: 0 });
      }
      if (cards.length > 1) stacks.push(cards);
    });
    if (!stacks.length) return;
    var raf = 0;
    function measure() {
      stacks.forEach(function (cards) {
        cards.forEach(function (c) { c.top = parseFloat(getComputedStyle(c.el).top) || 0; });
      });
    }
    function frame() {
      raf = 0;
      stacks.forEach(function (cards) {
        var cover = [0];
        for (var j = 1; j < cards.length; j++) {
          var prev = cards[j - 1].el, prevBottom = prev.getBoundingClientRect().top + prev.offsetHeight;
          var top = cards[j].el.getBoundingClientRect().top;
          cover.push(clamp((prevBottom - top) / Math.max(1, prevBottom - cards[j].top)));
        }
        var depth = 0;
        for (var i = cards.length - 1; i >= 0; i--) {
          cards[i].a.currentTime = Math.min(depth, 3) / 3 * cards[i].dur;
          depth += cover[i];
        }
      });
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", function () { measure(); kick(); });
    measure();
    kick();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
