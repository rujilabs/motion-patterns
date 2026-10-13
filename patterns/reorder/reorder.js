/*
 * reorder.js: FLIP for any list. Measure every child, change the DOM, then play each child from
 * where it was to where it is now with the Web Animations API.
 *
 *   reorder.flip(list, function () { ...sort, filter (el.hidden = true), append... });
 *   reorder.roll(el, "3", 1);   // a number rolls to its new value; 1 rolls up, -1 rolls down
 *
 * Rows that climb lift and pass in front; rows that drop sink behind; rows hidden by the change
 * fade out where they stood; rows that appear rise in. Calling flip again mid-move starts from
 * where everything is on screen, so a fast second click never jumps.
 * With prefers-reduced-motion the change happens in one frame.
 */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var MARK = "reorder";

  function token(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    return v || fallback;
  }
  function ms(name, fallback) {
    var v = token(name, "");
    var n = parseFloat(v);
    if (isNaN(n)) return fallback;
    return /ms$/.test(v) ? n : n * 1000;
  }
  function stop(el) {
    el.getAnimations({ subtree: true }).forEach(function (a) { if (a.id === MARK) a.cancel(); });
    el.classList.remove("is-rising", "is-sinking");
    if (el.classList.contains("is-leaving")) {
      el.classList.remove("is-leaving");
      ["top", "left", "width"].forEach(function (p) { el.style.removeProperty(p); });
      el.hidden = true;
    }
  }
  function play(el, frames, opts) {
    opts.id = MARK;
    var a = el.animate(frames, opts);
    a.id = MARK;
    return a;
  }

  function flip(list, change) {
    var listBox = list.getBoundingClientRect();
    var before = new Map();
    Array.prototype.forEach.call(list.children, function (el) {
      if (el.hidden) return;
      var r = el.getBoundingClientRect();
      before.set(el, {
        y: (r.top + r.bottom) / 2,
        top: r.top - listBox.top - list.clientTop,
        left: r.left - listBox.left - list.clientLeft,
        w: r.width,
        o: parseFloat(getComputedStyle(el).opacity) || 0
      });
    });
    // Positions above include any move still running; now drop those moves and their state.
    list.getAnimations().forEach(function (a) { if (a.id === MARK) a.cancel(); });
    list.classList.remove("is-resizing");
    Array.prototype.forEach.call(list.children, stop);

    change();
    if (reduce.matches || !list.animate) return;

    var base = ms("--dur-base", 600);
    var easeOut = token("--ease-out", "ease-out");
    var easeIn = token("--ease-in", "ease-in");
    // The list itself grows or shrinks to its new height instead of snapping, so the page around it
    // (and a centred card) moves with the rows.
    var cs = getComputedStyle(list);
    var box = cs.boxSizing === "border-box" ? 0 : ["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"]
      .reduce(function (n, k) { return n + (parseFloat(cs[k]) || 0); }, 0);
    var newH = list.getBoundingClientRect().height;
    if (Math.abs(newH - listBox.height) > 1) {
      list.classList.add("is-resizing");
      play(list, [{ height: listBox.height - box + "px" }, { height: newH - box + "px" }],
        { duration: base * .8, easing: easeOut }).onfinish = function () { list.classList.remove("is-resizing"); };
    }

    var kids = Array.prototype.slice.call(list.children);
    var after = new Map();
    kids.forEach(function (el) {
      if (!el.hidden) { var r = el.getBoundingClientRect(); after.set(el, (r.top + r.bottom) / 2); }
    });

    kids.forEach(function (el) {
      var b = before.get(el);
      if (el.hidden) {
        if (!b) return;
        // Leaving: back on screen where it stood, out of the flow, then fade and fold away.
        el.hidden = false;
        el.classList.add("is-leaving");
        el.style.setProperty("top", b.top + "px");
        el.style.setProperty("left", b.left + "px");
        el.style.setProperty("width", b.w + "px");
        play(el, [
          { opacity: b.o, transform: "none" },
          { opacity: 0, transform: "translateY(-6px) scale(.97)" }
        ], { duration: base * .55, easing: easeIn, fill: "forwards" }).onfinish = function () { stop(el); };
        return;
      }
      if (!b) {
        // Arriving: rise in a beat after the others start to move, so the gap opens first.
        play(el, [
          { opacity: 0, transform: "translateY(12px) scale(.98)" },
          { opacity: 1, transform: "none" }
        ], { duration: base, delay: base * .25, easing: easeOut, fill: "backwards" });
        return;
      }
      var dy = b.y - after.get(el);
      if (Math.abs(dy) < 1) {
        if (b.o < .99) play(el, [{ opacity: b.o }, { opacity: 1 }], { duration: base * .5, easing: easeOut });
        return;
      }
      // Longer trips take longer, gently: a 7-row climb is not 7 times slower than a 1-row swap.
      var dur = Math.min(base * 1.5, base * .7 + Math.abs(dy) * .9);
      var up = dy > 0;
      el.classList.add(up ? "is-rising" : "is-sinking");
      var move = play(el, [
        { transform: "translateY(" + dy + "px)", opacity: b.o },
        { transform: "translateY(" + dy * .45 + "px) scale(" + (up ? 1.03 : .985) + ")", opacity: up ? 1 : .72, offset: .45 },
        { transform: "none", opacity: 1 }
      ], { duration: dur, easing: easeOut, fill: "backwards" });
      move.onfinish = function () { el.classList.remove("is-rising", "is-sinking"); };
      if (up) {
        try {
          play(el, [{ opacity: 0 }, { opacity: 1, offset: .45 }, { opacity: 0 }],
            { duration: dur, easing: easeOut, pseudoElement: "::after" });
        } catch (e) { /* no pseudo-element animations: the row still lifts, without the shadow */ }
      }
    });
  }

  function roll(el, text, dir) {
    text = String(text);
    var now = el.querySelector(".roll-now");
    var old = now ? now.textContent : el.textContent;
    el.getAnimations({ subtree: true }).forEach(function (a) { if (a.id === MARK) a.cancel(); });
    el.textContent = "";
    el.classList.add("roll");
    var next = document.createElement("span");
    next.className = "roll-now";
    next.textContent = text;
    el.appendChild(next);
    if (old === text || reduce.matches || !el.animate) return;
    var gone = document.createElement("span");
    gone.setAttribute("aria-hidden", "true");
    gone.textContent = old;
    el.appendChild(gone);
    var d = dir < 0 ? -1 : 1;
    var opts = { duration: ms("--dur-base", 600), easing: token("--ease-out", "ease-out"), fill: "backwards" };
    play(next, [{ transform: "translateY(" + d * 100 + "%)" }, { transform: "none" }], opts);
    play(gone, [{ transform: "none" }, { transform: "translateY(" + -d * 100 + "%)" }], opts).onfinish = function () { gone.remove(); };
  }

  window.reorder = { flip: flip, roll: roll };
})();
