/* Demo only: fills the invoice list for the chosen page and fades the rows in. */
(function () {
  var names = ["Kedai Ruang", "Northwind Studio", "Pasar Kecil", "Harbor Goods", "Kettle and Co", "Lumen Print", "Fieldnote Press"];
  var status = ["Paid", "Paid", "Due", "Paid", "Overdue"];
  function rows(page) {
    var out = [];
    for (var k = 0; k < 4; k++) {
      var n = (page - 1) * 4 + k + 1;
      if (n > 26) break;
      var amt = 120 + ((n * 137) % 900);
      out.push({ id: "INV-" + String(300 + n).padStart(4, "0"), who: names[(n * 3) % names.length], amt: "RM " + amt.toLocaleString("en"), st: status[n % status.length] });
    }
    return out;
  }
  function render(list, info, page) {
    list.textContent = "";
    rows(page).forEach(function (r) {
      var li = document.createElement("li");
      li.className = "inv";
      li.innerHTML = '<span class="inv-id num"></span><span class="inv-who"></span><span class="inv-amt num"></span><span class="inv-st"></span>';
      li.children[0].textContent = r.id;
      li.children[1].textContent = r.who;
      li.children[2].textContent = r.amt;
      li.children[3].textContent = r.st;
      li.children[3].dataset.st = r.st.toLowerCase();
      list.appendChild(li);
    });
    var first = (page - 1) * 4 + 1;
    info.textContent = first + " to " + Math.min(26, first + 3) + " of 26";
  }
  function start() {
    var list = document.getElementById("invoices");
    var info = document.getElementById("range");
    render(list, info, 2);
    document.addEventListener("pager:change", function (e) {
      list.classList.remove("is-new");
      render(list, info, e.detail.page);
      void list.offsetWidth;
      list.classList.add("is-new");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
