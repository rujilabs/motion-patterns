/*
 * exit.js: opens dialog.exit-panel once per visit, when a mouse leaves the page through the top
 * edge. It arms after data-exit-delay milliseconds on the page (default 2000), so a quick glance at
 * the tabs right after landing does not trigger it. Touch and pen never trigger it (no exit to read).
 * Any [data-exit-open] button opens it on demand; [data-exit-close] buttons and Esc close it.
 */
(function () {
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var KEY = "exit-panel-shown";

  function seen() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function markSeen() { try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* storage blocked: memory only */ } }

  function setup(panel) {
    var armed = false;
    var shown = seen();
    var delay = parseInt(panel.getAttribute("data-exit-delay"), 10);
    setTimeout(function () { armed = true; }, isNaN(delay) ? 2000 : delay);

    function open() {
      if (panel.open) return;
      panel.classList.remove("is-closing");
      panel.showModal();
    }

    function shut(value) {
      if (!panel.open || panel.classList.contains("is-closing")) return;
      if (still.matches || getComputedStyle(panel).animationName === "none") { panel.close(value); return; }
      panel.classList.add("is-closing");
      panel.addEventListener("animationend", function done(e) {
        if (e.target !== panel || e.animationName !== "exit-out") return;
        panel.removeEventListener("animationend", done);
        panel.classList.remove("is-closing");
        panel.close(value);
      });
    }

    document.addEventListener("mouseout", function (e) {
      if (e.relatedTarget || e.clientY > 0 || !armed || shown || !fine.matches) return;
      shown = true;
      markSeen();
      open();
    });

    document.querySelectorAll("[data-exit-open]").forEach(function (b) {
      b.addEventListener("click", open);
    });
    panel.querySelectorAll("[data-exit-close]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); shut(b.value || ""); });
    });
    // Esc: play the close instead of vanishing
    panel.addEventListener("cancel", function (e) { e.preventDefault(); shut(""); });
    // a click on the backdrop (the dialog box itself, outside its content) closes it
    panel.addEventListener("click", function (e) { if (e.target === panel) shut(""); });
  }

  function start() { document.querySelectorAll("dialog.exit-panel").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
