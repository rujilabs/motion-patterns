/* Demo only: Back and Continue move through a four-step checkout; it steps on once by itself on load. */
(function () {
  var list = document.querySelector(".steps");
  var h = document.querySelector(".panel-h");
  var p = document.querySelector(".panel-p");
  var back = document.querySelector("[data-back]");
  var next = document.querySelector("[data-next]");
  var copy = [
    ["Your bag", "Two items: a rattan pendant and a teak side table."],
    ["Delivery", "To 12 Lorong Seri, Petaling Jaya. Thursday, between 9 am and 1 pm."],
    ["Payment", "Card ending 4821. You will not be charged until the order ships."],
    ["Review", "Check the address and the delivery day, then place the order."],
    ["Order placed", "Order 20418 is confirmed. A receipt is on its way to your inbox."]
  ];
  var at = 1;

  function show() {
    steps.go(list, at);
    h.textContent = copy[at][0];
    p.textContent = copy[at][1];
    back.disabled = at === 0;
    next.textContent = at === 3 ? "Place order" : at === 4 ? "Start again" : "Continue";
  }

  back.addEventListener("click", function () { if (at > 0) { at--; show(); } });
  next.addEventListener("click", function () { at = at === 4 ? 0 : at + 1; show(); });
  show();
  setTimeout(function () { if (at === 1) { at = 2; show(); } }, 700);
})();
