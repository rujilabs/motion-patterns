// Demo only: adds the slot's delivery fee to the order and says which slot is held.
(function () {
  var GROCERIES = 186.45;
  var form = document.querySelector(".slots");
  var n = document.getElementById("total-n");
  var t = document.getElementById("total-t");
  form.addEventListener("change", function (e) {
    var r = e.target;
    if (r.name !== "slot") return;
    var fee = parseFloat(r.getAttribute("data-fee"));
    n.textContent = "Total RM " + (GROCERIES + fee).toFixed(2);
    t.textContent = r.parentNode.querySelector(".slot-time").textContent;
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
})();
