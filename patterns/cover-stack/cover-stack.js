/* Restarts every CSS animation in the demo: hiding the frame for one layout drops them, showing it starts them again. */
document.querySelectorAll("[data-replay]").forEach(function (b) {
  b.addEventListener("click", function () {
    var f = b.closest(".frame");
    f.style.display = "none";
    void f.offsetWidth;
    f.style.display = "";
  });
});
