// Demo only: shows the voucher when the lock opens. The lock and its dials are drum-combo-lock.js.
(function () {
  var lock = document.getElementById("lock"), voucher = document.getElementById("voucher");
  var head = document.getElementById("gift-h"), state = document.getElementById("state"), still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";
  lock.addEventListener("unlock", function () {
    state.textContent = "Open. Here is what is inside.";
    head.textContent = "Your year-end hamper is open";
    voucher.classList.add("is-shown");
    if (!still.matches && voucher.animate) {
      voucher.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
        { duration: 600, delay: 420, easing: ease, fill: "backwards" });
    }
  });
  document.getElementById("relock").addEventListener("click", function () {
    voucher.classList.remove("is-shown");
    state.textContent = "Locked";
    head.textContent = "Your year-end hamper is locked";
    lock.lock("2965");
    lock.querySelector(".dial").focus();
  });
})();
