/*
 * scroll-word-reveal.js: wraps every word inside each [data-word-reveal] block in <span class="wr-w"> and
 * sets its place (--wr-i) and the block's word count (--wr-n). Inline markup such as <em> or <a> is kept.
 * Where scroll timelines are missing it adds .go to a block once it is half in view, which inks the words
 * on a short stagger. Does nothing under reduced motion, so the text stays plain.
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  function wrap(block) {
    var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT), nodes = [], n = 0;
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (t) {
      if (!/\S/.test(t.nodeValue)) return;
      var frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement("span");
        w.className = "wr-w";
        w.textContent = part;
        w.style.setProperty("--wr-i", n++);
        frag.appendChild(w);
      });
      t.parentNode.replaceChild(frag, t);
    });
    block.style.setProperty("--wr-n", Math.max(1, n));
  }
  function start() {
    var blocks = document.querySelectorAll("[data-word-reveal]");
    blocks.forEach(wrap);
    if (window.CSS && CSS.supports("animation-timeline: view()")) return;
    if (!("IntersectionObserver" in window)) { blocks.forEach(function (b) { b.classList.add("go"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("go"); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    blocks.forEach(function (b) { io.observe(b); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
