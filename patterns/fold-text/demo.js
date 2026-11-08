/* Demo only: the button folds the title again. */
document.querySelectorAll("[data-fold-replay]").forEach(function (btn) {
  btn.hidden = false;
  btn.addEventListener("click", function () {
    var t = document.querySelector("[data-fold]");
    t.classList.remove("go");
    void t.offsetWidth;
    t.classList.add("go");
  });
});
