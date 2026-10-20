/*
 * scramble.js: letters cycle through random characters, then settle on the real word one by
 * one from left to right. Each letter runs a Web Animations clock (named "scramble"), and the
 * shown glyph is read from that clock, so pausing or scrubbing the animation pauses the scramble.
 *
 * Markup: <span data-scramble>KITE-7Q4M</span>. Optional data-scramble-dur (ms, default 700),
 * data-scramble-stagger (ms per letter, default 45), data-scramble-delay (ms, default 0),
 * data-scramble-chars (the pool, default capitals and digits).
 * Call window.scramble(el, "NEW TEXT") to scramble an element to new text, or give a button
 * data-scramble-next="<id>" and the target data-scramble-list="ONE|TWO|THREE" to step through a list.
 */
(function () {
  var POOL = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var FRAME = 55; // ms each random glyph stays before the next one
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var live = [];
  var looping = false;
  var runs = 0; // each run gets its own glyph sequence

  function glyph(pool, i, t) {
    // a cheap, repeatable shuffle: the same letter at the same time always shows the same glyph
    var n = Math.imul(Math.floor(t / FRAME) + 1, 0x9e3779b1) ^ Math.imul(i + 1, 0x85ebca6b);
    n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d);
    return pool[((n ^ (n >>> 13)) >>> 0) % pool.length];
  }

  function frame() {
    var busy = false;
    live = live.filter(function (L) { return L.span.isConnected; });
    live.forEach(function (L) {
      var a = L.anim;
      var p = a.effect.getComputedTiming().progress;
      var done = p === 1;
      if (a.playState !== "finished") busy = true;
      if (done) {
        if (L.on) { L.on = false; L.span.classList.remove("is-scrambling"); L.span.removeAttribute("data-glyph"); }
      } else {
        if (!L.on) { L.on = true; L.span.classList.add("is-scrambling"); }
        var g = glyph(L.pool, L.i + L.seed, a.currentTime || 0);
        if (g === L.ch) g = L.pool[(L.pool.indexOf(g) + 1) % L.pool.length];
        L.span.setAttribute("data-glyph", L.lower ? g.toLowerCase() : g);
      }
    });
    if (busy) requestAnimationFrame(frame);
    else { looping = false; setTimeout(wake, 250); }
  }

  // after everything settles, look in now and then: a replayed animation restarts the glyphs
  function wake() {
    if (looping) return;
    if (live.some(function (L) { return L.span.isConnected && L.anim.playState !== "finished"; })) start();
    else if (live.length) setTimeout(wake, 250);
  }

  function start() {
    if (looping) return;
    looping = true;
    requestAnimationFrame(frame);
  }

  function scramble(el, text) {
    if (text == null) text = el.getAttribute("data-scramble-text") || el.textContent;
    text = String(text).trim();
    el.setAttribute("data-scramble-text", text);
    live = live.filter(function (L) { if (L.el === el) { L.anim.cancel(); return false; } return true; });
    if (reduce || !el.animate) { el.textContent = text; return; }

    var dur = +el.getAttribute("data-scramble-dur") || 700;
    var step = +el.getAttribute("data-scramble-stagger") || 45;
    var delay = +el.getAttribute("data-scramble-delay") || 0;
    var pool = el.getAttribute("data-scramble-chars") || POOL;

    el.textContent = "";
    var sr = document.createElement("span");
    sr.className = "scramble-sr";
    sr.textContent = text;
    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    el.appendChild(sr);
    el.appendChild(shown);

    var i = 0;
    var seed = ++runs * 97;
    Array.from(text).forEach(function (ch) {
      var s = document.createElement("span");
      s.className = "scramble-ch";
      s.textContent = ch;
      shown.appendChild(s);
      if (!/[A-Za-z0-9]/.test(ch)) return; // spaces, dashes and stops stay put
      var length = dur + i * step;
      var anim = s.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: length, delay: delay, fill: "both", easing: "linear", id: "scramble" });
      live.push({ el: el, span: s, anim: anim, i: i, ch: ch, pool: pool, seed: seed, lower: ch !== ch.toUpperCase(), on: false });
      i++;
    });
    start();
  }

  window.scramble = scramble;

  function boot() {
    document.querySelectorAll("[data-scramble]").forEach(function (el) { scramble(el); });
    document.querySelectorAll("[data-scramble-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var el = document.getElementById(btn.getAttribute("data-scramble-next"));
        if (!el) return;
        var list = (el.getAttribute("data-scramble-list") || "").split("|").filter(Boolean);
        if (!list.length) { scramble(el); return; }
        var at = list.indexOf(el.getAttribute("data-scramble-text"));
        scramble(el, list[(at + 1) % list.length]);
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
