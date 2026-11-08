/*
 * folder-open.js: a click anywhere on a .folder (or Enter or Space on its .folder-front button) opens
 * or closes it: .is-open on the folder, aria-expanded on the button. Write the button with
 * aria-expanded="true" so the markup matches the open folder people see without the script; the
 * script closes every folder unless it has data-open. Each .folder fires folderopen or folderclose.
 */
(function () {
  function setup(folder) {
    var btn = folder.querySelector(".folder-front");
    if (!btn || folder._fo) return;
    folder._fo = true;
    function set(open) {
      folder.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    }
    set(folder.hasAttribute("data-open"));
    folder.addEventListener("click", function () {
      var open = !folder.classList.contains("is-open");
      set(open);
      folder.dispatchEvent(new CustomEvent(open ? "folderopen" : "folderclose", { bubbles: true }));
    });
  }
  function init() { document.querySelectorAll(".folder").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
