/*
 * blur-in-text.js: wraps every word of each .blur-in element in <span class="bi-w"> and sets --i,
 * so style.css can sharpen the words one by one. Inline markup (em, strong, br) is kept.
 * A [data-replay] button inside the same .frame plays every line in it again.
 */
(function () {
  function split(el) {
    if (el._bi) return;
    el._bi = true;
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(part));
          var w = document.createElement("span");
          w.className = "bi-w";
          w.textContent = part;
          w.style.setProperty("--i", i++);
          frag.appendChild(w);
        });
        n.parentNode.replaceChild(frag, n);
      });
    })(el);
  }

  function init() {
    document.querySelectorAll(".blur-in").forEach(split);
    document.querySelectorAll("[data-replay]").forEach(function (b) {
      b.addEventListener("click", function () {
        var lines = (b.closest(".frame") || document).querySelectorAll(".blur-in");
        lines.forEach(function (l) { l.classList.remove("go"); });
        void document.body.offsetWidth;
        lines.forEach(function (l) { l.classList.add("go"); });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
