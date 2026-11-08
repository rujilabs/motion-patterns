/*
 * shredder.js: feeds a document through a shredder and back out again on undo.
 *   <div class="shredder" data-strips="14">
 *     <div class="shredder-feed"><article class="shred-doc">...</article></div>
 *     <div class="shredder-head" aria-hidden="true"></div>
 *     <div class="shredder-out" aria-hidden="true"><div class="shredder-bin"></div></div>
 *   </div>
 *   el.shredder.shred()     // feeds it in; fires "shredded" when the strips have dropped into the basket
 *   el.shredder.restore()   // undo: the strips rise back and join; fires "restored"
 * The strips are copies of the document, each clipped to a narrow band, so whatever is on the
 * document is on the strips. Under reduced motion the document just goes and comes back.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var FEED = 1700, DROP = 650;

  function setup(root) {
    var feed = root.querySelector(".shredder-feed");
    var doc = root.querySelector(".shred-doc");
    var head = root.querySelector(".shredder-head");
    var out = root.querySelector(".shredder-out");
    var n = Math.max(4, +root.dataset.strips || 14);
    var layer = null, anims = [], state = "whole";

    function fire(name) { root.dispatchEvent(new CustomEvent(name, { bubbles: true })); }
    function sized() { root.style.setProperty("--shred-doc-w", doc.offsetWidth + "px"); }
    function clear() {
      anims.forEach(function (a) { a.cancel(); });
      anims = [];
      if (layer) layer.remove();
      layer = null;
    }

    function shred() {
      if (state !== "whole") return;
      state = "going";
      if (reduce.matches || !doc.animate) {
        doc.style.visibility = "hidden";
        state = "gone"; fire("shredded"); return;
      }
      var w = doc.offsetWidth, h = doc.offsetHeight;
      var docRect = doc.getBoundingClientRect(), outRect = out.getBoundingClientRect();
      var travel = outRect.top - docRect.top;            // from where the doc is to just under the head
      // the strips start where the doc is, offset into the out box (so they are hidden above it)
      layer = document.createElement("div");
      layer.className = "shred-strips";
      layer.style.width = w + "px";
      layer.style.height = h + "px";
      layer.style.left = (docRect.left - outRect.left) + "px";
      layer.style.top = (docRect.top - outRect.top) + "px";
      for (var i = 0; i < n; i++) {
        var s = doc.cloneNode(true);
        s.removeAttribute("id");
        s.querySelectorAll("[id]").forEach(function (x) { x.removeAttribute("id"); });
        var l = (i / n) * 100, r = 100 - ((i + 1) / n) * 100;
        s.style.clipPath = "inset(0 " + r + "% 0 " + l + "%)";
        layer.appendChild(s);
      }
      out.insertBefore(layer, out.firstChild);
      var mid = (n - 1) / 2, fall = out.offsetHeight * 0.5;   // they settle in the lower half of the basket
      // one timeline length for the doc and every strip, so undo (played in reverse) keeps them joined
      var f = FEED / (FEED + DROP), opts = { duration: FEED + DROP, easing: "linear", fill: "forwards" };
      anims.push(doc.animate([{ transform: "none" }, { transform: "translateY(" + travel + "px)", offset: f }, { transform: "translateY(" + travel + "px)" }], opts));
      [].forEach.call(layer.children, function (s, i) {
        var x = (i - mid) * 2.2, turn = (i % 2 ? 1 : -1) * (2 + (i % 3)), y = travel;
        var a = s.animate([
          { transform: "translate(" + x + "px, 0) rotate(0deg)" },
          { transform: "translate(" + x + "px, " + y * 0.6 + "px) rotate(" + turn * 0.4 + "deg)", offset: 0.6 * f },
          { transform: "translate(" + x + "px, " + y + "px) rotate(" + turn + "deg)", offset: f },
          { transform: "translate(" + (x * 1.2) + "px, " + (y + fall) + "px) rotate(" + turn * 2.2 + "deg)" }
        ], opts);
        a.id = i === 0 ? "strips" : "";
        anims.push(a);
      });
      anims[0].id = "feed";
      var hum = head.animate([{ transform: "translateX(0)" }, { transform: "translateX(-1px)" }, { transform: "translateX(1px)" }, { transform: "translateX(0)" }],
        { duration: 90, iterations: Math.round(FEED / 90) });
      hum.id = "motor";
      var last = anims[anims.length - 1];
      last.onfinish = function () { if (state === "going") { state = "gone"; doc.style.visibility = "hidden"; fire("shredded"); } };
    }

    function restore() {
      if (state === "whole") return;
      if (!anims.length) {
        doc.style.visibility = "";
        state = "whole"; fire("restored"); return;
      }
      state = "coming";
      doc.style.visibility = "";
      anims.forEach(function (a) { a.playbackRate = 1.6; a.reverse(); });
      anims[0].onfinish = function () { clear(); state = "whole"; fire("restored"); };
    }

    sized();
    if (window.ResizeObserver) new ResizeObserver(sized).observe(doc);
    root.shredder = { shred: shred, restore: restore, get state() { return state; } };
  }

  function start() { document.querySelectorAll(".shredder").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
