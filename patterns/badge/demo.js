/* Demo only: the four buttons change the two counts; three messages arrive on load. */
(function () {
  var inbox = document.querySelector('[data-tool="inbox"]');
  var cart = document.querySelector('[data-tool="cart"]');
  var counts = { inbox: 0, cart: 2 };

  function update(which, n) {
    counts[which] = Math.max(0, n);
    var btn = which === "inbox" ? inbox : cart;
    badge.set(btn.querySelector(".badge"), counts[which]);
    var c = counts[which];
    btn.setAttribute("aria-label", which === "inbox"
      ? "Messages, " + (c ? c + " unread" : "none unread")
      : "Basket, " + c + (c === 1 ? " item" : " items"));
  }

  var actions = {
    msg: function () { update("inbox", counts.inbox + 1); },
    read: function () { update("inbox", 0); },
    add: function () { update("cart", counts.cart + 1); },
    remove: function () { update("cart", counts.cart - 1); }
  };
  document.querySelectorAll("[data-do]").forEach(function (b) {
    b.addEventListener("click", function () { actions[b.dataset.do](); });
  });
  setTimeout(function () { if (!counts.inbox) update("inbox", 3); }, 500);
})();
