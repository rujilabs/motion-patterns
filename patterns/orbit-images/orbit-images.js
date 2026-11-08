/*
 * orbit-images.js: every .oi turns its .oi-ring slowly, with the .oi-item buttons riding the ring.
 * The spin is one Web Animation on the registered --oi-a angle, one turn per data-oi-period ms
 * (default 32000). It stops while the ring is off screen or the tab is hidden.
 * Focus or a tap on an item turns the ring the short way until that item is in front, enlarges it,
 * names it in [data-oi-caption] (its .oi-name, then its data-oi-note) and holds there until focus
 * leaves the ring; data-oi-hint on the caption is the text shown in between. An .oi-pause button (aria-pressed) stops and starts the spin.
 * Under reduced motion the ring never spins, and picking an item jumps it to the front.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function num(el, name, fallback) {
    var v = parseFloat(el.getAttribute(name));
    return isNaN(v) ? fallback : v;
  }

  function setup(oi) {
    var items = [].slice.call(oi.querySelectorAll(".oi-item"));
    if (!items.length) return;
    var root = oi.closest("section, article, body") || document.body;
    var caption = root.querySelector("[data-oi-caption]");
    var pauseBtn = root.querySelector(".oi-pause");
    var period = num(oi, "data-oi-period", 32000);
    var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-inout").trim() || "ease-in-out";
    var canAnimate = !!Element.prototype.animate && !!window.CSSPropertyRule; // animating --oi-a needs @property
    var spin = null, turn = null, front = null, paused = false, seen = true, resumeTimer = 0;
    var hint = caption ? caption.getAttribute("data-oi-hint") || caption.textContent : "";
    if (caption) caption.textContent = hint;

    items.forEach(function (it, k) { it.style.setProperty("--oi-k", k); });
    oi.style.setProperty("--oi-n", items.length);
    oi.classList.add("oi-live");

    function angle() { return parseFloat(getComputedStyle(oi).getPropertyValue("--oi-a")) || 0; }
    function set(a) { oi.style.setProperty("--oi-a", a.toFixed(2) + "deg"); }
    set(num(oi, "data-oi-start", 0));

    function stopSpin() {
      if (spin) { var a = angle(); spin.cancel(); spin = null; set(a); }
    }
    function startSpin() {
      if (spin || turn || paused || front !== null || !seen || document.hidden || still.matches || !canAnimate) return;
      var a = angle();
      spin = oi.animate([{ "--oi-a": a + "deg" }, { "--oi-a": a + 360 + "deg" }], { duration: period, iterations: Infinity });
    }

    function pick(it) {
      var k = items.indexOf(it);
      if (k < 0 || k === front) return;
      clearTimeout(resumeTimer);
      stopSpin();
      if (turn) { var mid = angle(); turn.cancel(); turn = null; set(mid); }
      if (front !== null) items[front].classList.remove("is-front");
      front = k;
      it.classList.add("is-front");
      var a = angle();
      var want = 90 - k * 360 / items.length; // 90deg points straight at the viewer
      var to = a + ((((want - a) % 360) + 540) % 360 - 180);
      if (still.matches || !canAnimate) set(to);
      else {
        turn = oi.animate([{ "--oi-a": a + "deg" }, { "--oi-a": to + "deg" }], { duration: 500 + Math.abs(to - a) * 4, easing: ease, fill: "forwards" });
        turn.onfinish = function () { set(to); turn.cancel(); turn = null; if (front === null) startSpin(); };
      }
      if (caption) {
        var n = it.querySelector(".oi-name");
        caption.textContent = (n ? n.textContent + ". " : "") + (it.getAttribute("data-oi-note") || "");
      }
    }

    function release() {
      if (front === null) return;
      items[front].classList.remove("is-front");
      front = null;
      if (caption) caption.textContent = hint;
      resumeTimer = setTimeout(startSpin, 900);
    }

    oi.addEventListener("focusin", function (e) { var it = e.target.closest(".oi-item"); if (it) pick(it); });
    oi.addEventListener("click", function (e) { var it = e.target.closest(".oi-item"); if (it) pick(it); });
    oi.addEventListener("focusout", function (e) { if (!oi.contains(e.relatedTarget)) release(); });
    document.addEventListener("pointerdown", function (e) { if (!oi.contains(e.target) && e.target !== pauseBtn) release(); });

    if (pauseBtn && !still.matches && canAnimate) {
      pauseBtn.hidden = false;
      pauseBtn.addEventListener("click", function () {
        paused = !paused;
        pauseBtn.setAttribute("aria-pressed", String(paused));
        if (paused) stopSpin(); else startSpin();
      });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        seen = en[en.length - 1].isIntersecting;
        if (seen) startSpin(); else stopSpin();
      }).observe(oi);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stopSpin(); else startSpin(); });
    still.addEventListener("change", function () { if (still.matches) stopSpin(); else startSpin(); });
    startSpin();
  }

  function start() { document.querySelectorAll(".oi").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
