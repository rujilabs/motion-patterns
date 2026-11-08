/* Demo only: the picked item becomes the current page and its name becomes the heading. */
document.querySelectorAll(".dock-item").forEach(function (a) {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll(".dock-item[aria-current]").forEach(function (c) { c.removeAttribute("aria-current"); });
    a.setAttribute("aria-current", "page");
    document.querySelector("[data-dm-title]").textContent = a.querySelector(".dock-tip").textContent;
  });
});
