/*
 * drag-deck.js: every .deck becomes a stack of its .deck-card items, top card first in the list.
 * Drag the top card (mouse or finger) and let go: past a third of its width, or flicked fast, it flies
 * off that side (right keeps, left skips); otherwise it springs back. Left and Right arrow keys on the
 * deck, and the [data-deck-skip] / [data-deck-keep] buttons, do the same. [data-deck-undo] (or
 * Backspace) brings the last card back to the top. Each choice fires a "deck:choose" event on the deck
 * with detail { card, keep, undo }. Under reduced motion cards leave and return without the throw.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function token(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function setup(deck) {
    var cards = [].slice.call(deck.querySelectorAll(".deck-card"));
    if (!cards.length || !Element.prototype.animate) return;
    var status = deck.querySelector("[data-deck-status]");
    var endText = deck.querySelector("[data-deck-end]");
    var undoBtn = deck.querySelector("[data-deck-undo]");
    var actions = deck.querySelector(".deck-actions");
    var done = []; // { card, keep, to }
    var drag = null;
    var easeOut = token("--ease-out", "ease-out");
    var spring = token("--ease-spring", "ease-out");

    deck.classList.add("is-live");
    if (actions) actions.hidden = false;

    function left() { return cards.filter(function (c) { return !c.classList.contains("is-gone") && !c.classList.contains("is-out"); }); }
    function name(card) { var h = card.querySelector("h2, h3"); return h ? h.textContent : "Card"; }

    function layout() {
      left().forEach(function (c, i) {
        c.style.setProperty("--deck-i", Math.min(i, 3));
        c.classList.toggle("is-deep", i > 2);
        c.inert = i > 0;
      });
      var kept = done.filter(function (d) { return d.keep; }).length;
      if (undoBtn) undoBtn.disabled = !done.length;
      if (endText) endText.textContent = "That is every listing. You kept " + kept + " of " + cards.length + ".";
    }

    function say(text) { if (status) status.textContent = text; }

    function tally(lead) {
      var n = left().length;
      say(lead + " " + (n ? n + " left." : "That was the last one."));
    }

    // throw the top card off one side; from = its transform at the moment of release
    function choose(keep, from, speed) {
      var card = left()[0];
      if (!card) return;
      var w = deck.getBoundingClientRect().width;
      var dir = keep ? 1 : -1;
      var to = "translate(" + Math.round(dir * w * 1.15) + "px, 40px) rotate(" + dir * 22 + "deg)";
      card.classList.remove("is-held");
      card.classList.add("is-out");
      card.style.removeProperty("--deck-lean");
      done.push({ card: card, keep: keep, to: to });
      layout();
      var finish = function () {
        card.classList.remove("is-out");
        card.classList.add("is-gone");
        card.style.transform = "";
        layout();
      };
      if (still.matches) finish();
      else {
        var lean = keep ? 1 : -1;
        card.style.setProperty("--deck-lean", lean);
        var a = card.animate([
          { transform: from || "none" },
          { transform: to, opacity: 0 }
        ], { duration: Math.max(260, 460 - (speed || 0) * 120), easing: easeOut, fill: "forwards" });
        a.onfinish = function () { card.style.removeProperty("--deck-lean"); finish(); a.cancel(); };
      }
      tally((keep ? "Kept " : "Skipped ") + name(card) + ".");
      deck.dispatchEvent(new CustomEvent("deck:choose", { detail: { card: card, keep: keep, undo: false } }));
    }

    function undo() {
      var last = done.pop();
      if (!last) return;
      var card = last.card;
      card.getAnimations().forEach(function (a) { a.cancel(); });
      card.classList.remove("is-gone", "is-out");
      layout();
      if (!still.matches) {
        card.classList.add("is-held");
        var a = card.animate([
          { transform: last.to, opacity: 0 },
          { transform: "none", opacity: 1 }
        ], { duration: 520, easing: spring });
        a.onfinish = function () { card.classList.remove("is-held"); };
      }
      tally("Back on top: " + name(card) + ".");
      deck.dispatchEvent(new CustomEvent("deck:choose", { detail: { card: card, keep: last.keep, undo: true } }));
    }

    deck.addEventListener("pointerdown", function (e) {
      var card = e.target.closest(".deck-card");
      if (!card || card !== left()[0] || e.button > 0) return;
      card.getAnimations().forEach(function (a) { a.cancel(); });
      drag = { card: card, id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, t: e.timeStamp, vx: 0, on: false };
    });
    deck.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // a vertical move is a page scroll
        drag.on = true;
        drag.card.classList.add("is-held");
        drag.card.setPointerCapture(e.pointerId);
      }
      var dt = Math.max(1, e.timeStamp - drag.t);
      drag.vx = 0.7 * drag.vx + 0.3 * ((dx - drag.dx) / dt);
      drag.dx = dx; drag.dy = dy; drag.t = e.timeStamp;
      var w = deck.getBoundingClientRect().width;
      drag.card.style.transform = "translate(" + dx + "px, " + dy * 0.25 + "px) rotate(" + (dx / w) * 14 + "deg)";
      drag.card.style.setProperty("--deck-lean", Math.max(-1, Math.min(1, dx / (w * 0.33))).toFixed(3));
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.on) return;
      var w = deck.getBoundingClientRect().width;
      var from = d.card.style.transform;
      var flick = Math.abs(d.vx) > 0.55 && Math.abs(d.dx) > 24 && (d.vx > 0) === (d.dx > 0);
      if (e.type === "pointerup" && (Math.abs(d.dx) > w * 0.33 || flick)) {
        choose(d.dx > 0, from, Math.min(2, Math.abs(d.vx)));
        return;
      }
      d.card.classList.remove("is-held");
      d.card.style.transform = "";
      d.card.style.removeProperty("--deck-lean");
      if (!still.matches) d.card.animate([{ transform: from }, { transform: "none" }], { duration: 480, easing: spring });
    }
    deck.addEventListener("pointerup", release);
    deck.addEventListener("pointercancel", release);
    deck.addEventListener("dragstart", function (e) { e.preventDefault(); });

    deck.addEventListener("keydown", function (e) {
      if (e.target.closest("button") && (e.key === "Enter" || e.key === " ")) return;
      if (e.key === "ArrowRight") choose(true);
      else if (e.key === "ArrowLeft") choose(false);
      else if (e.key === "Backspace") undo();
      else return;
      e.preventDefault();
    });
    deck.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-deck-keep")) choose(true);
      else if (b.hasAttribute("data-deck-skip")) choose(false);
      else if (b.hasAttribute("data-deck-undo")) undo();
    });
    layout();
  }

  function start() { document.querySelectorAll(".deck").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
