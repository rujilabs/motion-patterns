/*
 * wave.js: splits every [data-wave] element into letters and numbers them (--wave-i), so
 * style.css can send a wave through them. Words stay unbroken; a hidden copy carries the text
 * for screen readers. Under reduced motion it does nothing and the text stays as written.
 */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function split(el) {
    var text = el.textContent.trim().replace(/\s+/g, " ");
    el.textContent = "";
    var sr = document.createElement("span");
    sr.className = "wave-sr";
    sr.textContent = text;
    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    var i = 0;
    text.split(" ").forEach(function (word, w) {
      if (w) shown.appendChild(document.createTextNode(" "));
      var wrap = document.createElement("span");
      wrap.className = "wave-word";
      Array.from(word).forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "wave-ch";
        s.textContent = ch;
        s.style.setProperty("--wave-i", i++);
        wrap.appendChild(s);
      });
      i++; // the space counts as a step, so the wave keeps its pace across words
      shown.appendChild(wrap);
    });
    el.appendChild(sr);
    el.appendChild(shown);
  }

  function start() { document.querySelectorAll("[data-wave]").forEach(split); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
