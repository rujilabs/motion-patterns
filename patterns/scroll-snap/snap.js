/*
 * snap.js: marks the section in view. Every .snap-section with an id gets .is-active while at
 * least 60% of it is in view, and the matching link in .snap-dots (href="#id") gets
 * aria-current="true". Without the script the sections still snap and their content shows.
 */
(function () {
  document.documentElement.classList.add("js");

  function start() {
    var sections = document.querySelectorAll(".snap-section[id]");
    var links = document.querySelectorAll('.snap-dots a[href^="#"]');
    function mark(id) {
      sections.forEach(function (s) { s.classList.toggle("is-active", s.id === id); });
      links.forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }
    if (!("IntersectionObserver" in window)) {
      sections.forEach(function (s) { s.classList.add("is-active"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); });
    }, { threshold: 0.6 });
    sections.forEach(function (s) { io.observe(s); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
