/*
 * infinite.js: for each [data-infinite] section. When its .inf-foot comes into view, or someone
 * presses .inf-more, it sets aria-busy and fires an "infinite:load" event on the section.
 * Your listener fetches the next page and calls e.detail.done(nodes), or done(null) for the end.
 * New nodes are appended to .inf-list, marked .inf-new with --inf-i, and announced in .inf-status.
 */
(function () {
  document.documentElement.classList.add("js");

  function setup(root) {
    var list = root.querySelector(".inf-list");
    var foot = root.querySelector(".inf-foot");
    var more = root.querySelector(".inf-more");
    var status = root.querySelector(".inf-status");
    var busy = false, io;

    function say(text) { if (status) status.textContent = text; }

    function done(nodes) {
      busy = false;
      root.removeAttribute("aria-busy");
      if (!nodes || !nodes.length) {
        root.setAttribute("data-end", "");
        say("You have reached the end.");
        if (io) io.disconnect();
        return;
      }
      Array.prototype.forEach.call(nodes, function (n, i) {
        n.classList.add("inf-new");
        n.style.setProperty("--inf-i", i);
        list.appendChild(n);
      });
      say(nodes.length + " more loaded.");
      // still in view (a short batch, a tall screen): ask again
      if (io) { io.unobserve(foot); io.observe(foot); }
    }

    function load() {
      if (busy || root.hasAttribute("data-end")) return;
      busy = true;
      root.setAttribute("aria-busy", "true");
      say("Loading more.");
      root.dispatchEvent(new CustomEvent("infinite:load", { detail: { done: done } }));
    }

    if (more) more.addEventListener("click", load);
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) load();
      }, { rootMargin: "0px 0px 80px 0px" });
      io.observe(foot);
    }
  }

  function start() { document.querySelectorAll("[data-infinite]").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
