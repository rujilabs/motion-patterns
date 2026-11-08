/*
 * fold-text.js: splits every [data-fold] element into letter panels (.fold-ch) numbered in
 * reading order (--fold-i), grouped in unbroken words (.fold-word). The panels are aria-hidden and a
 * visually hidden copy (.fold-sr) carries the text, so screen readers read words, not letters.
 * Replay by removing and adding the class "go".
 */
(function () {
  function split(el) {
    var text = el.textContent.trim().replace(/\s+/g, " ");
    el.textContent = "";
    var sr = document.createElement("span");
    sr.className = "fold-sr";
    sr.textContent = text;
    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    var i = 0;
    text.split(" ").forEach(function (word, w) {
      if (w) shown.appendChild(document.createTextNode(" "));
      var wrap = document.createElement("span");
      wrap.className = "fold-word";
      Array.from(word).forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "fold-ch";
        s.textContent = ch;
        s.style.setProperty("--fold-i", i++);
        wrap.appendChild(s);
      });
      shown.appendChild(wrap);
    });
    el.appendChild(sr);
    el.appendChild(shown);
  }
  function start() { document.querySelectorAll("[data-fold]").forEach(split); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
