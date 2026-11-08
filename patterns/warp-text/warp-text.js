/*
 * warp-text.js: every [data-warp] element is split into letters that swell by their distance to the
 * pointer (mouse, or a finger dragged across), or to the link with keyboard focus. Neighbours slide aside
 * by the room the swollen letters take, line by line, so the line bulges instead of overlapping.
 * data-warp-max: scale of the letter right under the pointer (default 1.6).
 * data-warp-reach: how far the bulge spreads, in px (default 60).
 * Layout is read once (and on resize); each frame only writes transforms. Under reduced motion nothing moves.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function num(el, name, fallback) {
    var v = parseFloat(el.getAttribute(name));
    return isNaN(v) ? fallback : v;
  }

  function split(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (t) {
      if (!/\S/.test(t.nodeValue)) return;
      var frag = document.createDocumentFragment();
      var sr = document.createElement("span");
      sr.className = "wt-sr";
      sr.textContent = t.nodeValue;
      var shown = document.createElement("span");
      shown.setAttribute("aria-hidden", "true");
      // words stay whole (.wt-word does not wrap), spaces stay plain text
      t.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { shown.appendChild(document.createTextNode(part)); return; }
        var word = document.createElement("span");
        word.className = "wt-word";
        Array.from(part).forEach(function (ch) {
          var s = document.createElement("span");
          s.className = "wt-ch";
          s.textContent = ch;
          word.appendChild(s);
        });
        shown.appendChild(word);
      });
      frag.appendChild(sr);
      frag.appendChild(shown);
      t.parentNode.replaceChild(frag, t);
    });
  }

  function setup(root) {
    split(root);
    var chars = [].slice.call(root.querySelectorAll(".wt-ch"));
    var n = chars.length;
    if (!n) return;
    var max = num(root, "data-warp-max", 1.6);
    var reach = num(root, "data-warp-reach", 60);
    var cx = new Float32Array(n), cy = new Float32Array(n), w = new Float32Array(n);
    var top = new Float32Array(n), s = new Float32Array(n), shift = new Float32Array(n);
    var px = null, py = 0, lastX = 0, frame = 0, pressed = false;
    s.fill(1);

    // rest layout: transforms do not change offsetLeft/offsetTop, so this is always the unwarped line
    function measure() {
      for (var i = 0; i < n; i++) {
        var el = chars[i];
        w[i] = el.offsetWidth;
        cx[i] = el.offsetLeft + w[i] / 2;
        top[i] = el.offsetTop;
        cy[i] = top[i] + el.offsetHeight / 2;
      }
    }

    function tick() {
      frame = 0;
      var moving = false, i, two = 2 * reach * reach;
      for (i = 0; i < n; i++) {
        var goal = 1;
        if (px !== null && !still.matches) {
          var dx = px - cx[i], dy = (py - cy[i]) * 2.5; // other lines swell much less
          goal = 1 + (max - 1) * Math.exp(-(dx * dx + dy * dy) / two);
        }
        var d = goal - s[i];
        s[i] += d * 0.24;
        if (d > 0.002 || d < -0.002) moving = true; else s[i] = goal;
      }
      // per line: each letter moves by the room the swollen letters before it take, less the room
      // taken left of the pointer, so the letter under the pointer stays put
      var a = 0;
      while (a < n) {
        var b = a;
        while (b < n && Math.abs(top[b] - top[a]) < 2) b++;
        var acc = 0, anchor = 0;
        for (i = a; i < b; i++) {
          var extra = (s[i] - 1) * w[i];
          shift[i] = acc + extra / 2;
          var left = cx[i] - w[i] / 2, part = (lastX - left) / w[i];
          anchor += extra * (part < 0 ? 0 : part > 1 ? 1 : part);
          acc += extra;
        }
        for (i = a; i < b; i++) {
          var x = shift[i] - anchor;
          chars[i].style.transform = s[i] === 1 && x > -0.05 && x < 0.05 ? "" : "translateX(" + x.toFixed(2) + "px) scale(" + s[i].toFixed(3) + ")";
        }
        a = b;
      }
      if (moving) frame = requestAnimationFrame(tick);
    }

    function wake() { if (!frame) frame = requestAnimationFrame(tick); }
    function aim(clientX, clientY) {
      var r = root.getBoundingClientRect();
      px = lastX = clientX - r.left - root.clientLeft;
      py = clientY - r.top - root.clientTop;
      wake();
    }
    function rest() { px = null; wake(); }

    root.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse" || pressed) aim(e.clientX, e.clientY); });
    root.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") { pressed = true; aim(e.clientX, e.clientY); } });
    function lift(e) {
      if (e.pointerType === "mouse") return;
      pressed = false;
      setTimeout(function () { if (!pressed) rest(); }, 350);
    }
    root.addEventListener("pointerup", lift);
    root.addEventListener("pointercancel", lift);
    root.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") rest(); });
    root.addEventListener("focusin", function (e) {
      if (!e.target.matches(":focus-visible")) return;
      var r = e.target.getBoundingClientRect();
      aim(r.left + r.width / 2, r.top + r.height / 2);
    });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget) && !root.matches(":hover")) rest(); });

    measure();
    if ("ResizeObserver" in window) new ResizeObserver(function () { measure(); wake(); }).observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    still.addEventListener("change", wake);
  }

  function start() { document.querySelectorAll("[data-warp]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
