/*
 * scroll-float-text.js: splits each [data-float-text] heading into letters (.sf-l), kept in words (.sf-w)
 * so lines only break between words. Each letter gets its place (--sf-i of --sf-n) and a small tilt
 * (--sf-r) that alternates side to side. A hidden copy of the text (.sf-sr) is what screen readers read.
 * Where scroll timelines are missing it adds .go to a heading once it is 40% in view, which floats the
 * letters up once on a short stagger. Does nothing under reduced motion, so the heading stays plain.
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var TILTS = [-7, 5, -3, 8, -5, 3, -8, 6];

  function split(el) {
    var words = el.textContent.trim().split(/\s+/), n = 0, total = words.join("").length;
    var sr = document.createElement("span");
    sr.className = "sf-sr";
    sr.textContent = words.join(" ");
    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    words.forEach(function (word, wi) {
      var w = document.createElement("span");
      w.className = "sf-w";
      for (var i = 0; i < word.length; i++) {
        var l = document.createElement("span");
        l.className = "sf-l";
        l.textContent = word.charAt(i);
        l.style.setProperty("--sf-i", n);
        l.style.setProperty("--sf-r", TILTS[n % TILTS.length] + "deg");
        n++;
        w.appendChild(l);
      }
      shown.appendChild(w);
      if (wi < words.length - 1) shown.appendChild(document.createTextNode(" "));
    });
    el.textContent = "";
    el.appendChild(sr);
    el.appendChild(shown);
    el.style.setProperty("--sf-n", Math.max(1, total));
  }

  function start() {
    var heads = document.querySelectorAll("[data-float-text]");
    heads.forEach(split);
    if (window.CSS && CSS.supports("animation-timeline: view()")) return;
    if (!("IntersectionObserver" in window)) { heads.forEach(function (h) { h.classList.add("go"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("go"); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    heads.forEach(function (h) { io.observe(h); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
