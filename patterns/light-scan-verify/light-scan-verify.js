/*
 * light-scan-verify.js: a scanner lamp passes over an uploaded document while it is checked.
 *   <div class="scan-doc" data-scan-list="#checks">
 *     ...the document... <span data-scan-field="name">TAN MEI LING</span> ...
 *   </div>
 *   <ul id="checks"><li data-scan-for="name">Name read</li> ...</ul>
 * The lamp is a line of light at constant speed, the way a scanner carriage moves. Behind it the photo's
 * uneven light (the dim corner, the warm cast of a room lamp) is gone: the page reads as evenly lit.
 * Each [data-scan-field] gets a box the moment the lamp reaches its middle, and the list item that names
 * it (data-scan-for) is ticked a beat later. Items with data-scan-for="*" are ticked at the start.
 * It runs once when the document comes into view; el.scan.run() runs it again.
 *   data-duration   ms for one pass (default 1700)
 *   data-scan-list  selector of the list of checks
 * Classes on the document: .is-scanning, then .is-done. "scan" fires with detail.done when it ends.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(doc) {
    if (doc._scan) return;
    doc._scan = true;
    var dur = +doc.dataset.duration || 1700;
    var list = doc.dataset.scanList ? document.querySelector(doc.dataset.scanList) : null;
    var lamp = document.createElement("span");
    lamp.className = "scan-lamp";
    lamp.setAttribute("aria-hidden", "true");
    var shade = doc.querySelector(".scan-shade");
    doc.appendChild(lamp);
    var fields = Array.prototype.slice.call(doc.querySelectorAll("[data-scan-field]"));
    fields.forEach(function (f) {
      var box = document.createElement("span");
      box.className = "scan-box";
      box.setAttribute("aria-hidden", "true");
      f.appendChild(box);
    });
    var items = list ? Array.prototype.slice.call(list.querySelectorAll("[data-scan-for]")) : [];
    var timers = [], anims = [], running = false;

    function clear() {
      timers.forEach(clearTimeout); timers = [];
      anims.forEach(function (a) { a.cancel(); }); anims = [];
    }
    function tick(id, at) {
      items.forEach(function (li) {
        if (li.getAttribute("data-scan-for") !== id) return;
        if (at <= 0) { li.classList.add("is-ok"); return; }
        timers.push(setTimeout(function () { li.classList.add("is-ok"); }, at));
      });
    }
    function finish() {
      running = false;
      doc.classList.remove("is-scanning");
      doc.classList.add("is-done");
      items.forEach(function (li) { li.classList.add("is-ok"); });
      doc.dispatchEvent(new CustomEvent("scan", { detail: { done: true } }));
    }
    function run() {
      clear();
      doc.classList.remove("is-done");
      items.forEach(function (li) { li.classList.remove("is-ok"); });
      if (reduce.matches) { doc.classList.add("is-boxed"); finish(); return; }
      running = true;
      doc.classList.remove("is-boxed");
      doc.classList.add("is-scanning");
      var r = doc.getBoundingClientRect(), H = r.height;
      var band = lamp.offsetHeight;
      // the carriage: constant speed from just above the page to just below it
      anims.push(lamp.animate(
        [{ transform: "translateY(" + (-band / 2) + "px)", opacity: 1 },
         { transform: "translateY(" + (H - band / 2) + "px)", opacity: 1, offset: .94 },
         { transform: "translateY(" + (H - band / 2 + 10) + "px)", opacity: 0 }],
        { duration: dur * 1.06, easing: "linear", fill: "both" }));
      // the uneven light of the photo is gone above the lamp line
      if (shade) anims.push(shade.animate(
        [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(100% 0 0 0)" }],
        { duration: dur, easing: "linear", fill: "both" }));
      tick("*", 0);
      fields.forEach(function (f) {
        var fr = f.getBoundingClientRect();
        var at = Math.max(0, Math.min(1, (fr.top + fr.height / 2 - r.top) / H)) * dur;
        var box = f.querySelector(".scan-box");
        anims.push(box.animate(
          [{ opacity: 0, transform: "scale(1.08)" }, { opacity: 1, transform: "scale(1)" }],
          { duration: 240, delay: at, easing: "ease-out", fill: "both" }));
        tick(f.getAttribute("data-scan-field"), at + 160);
      });
      timers.push(setTimeout(finish, dur * 1.06 + 120));
    }

    doc.scan = { run: run, running: function () { return running; } };
    if ("IntersectionObserver" in window && !reduce.matches) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); run(); }
      }, { threshold: 0.5 });
      io.observe(doc);
    } else run();
  }

  function init() { document.querySelectorAll(".scan-doc").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
