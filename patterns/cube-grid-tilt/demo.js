// Demo only: says which tile is chosen, from the faces of the chosen cube.
(function () {
  var status = document.getElementById("status");
  document.addEventListener("cg-choose", function (e) {
    var c = e.detail.cube;
    if (!c) { status.textContent = "No tile chosen yet."; return; }
    var top = c.querySelectorAll(".cg-top > *");
    status.textContent = c.querySelector(".cg-name").textContent + ", " + c.getAttribute("data-size") + ": " + top[0].textContent +
      " " + top[1].textContent + ", " + top[2].textContent + ". " + c.getAttribute("data-stock") + " boxes in stock.";
  });
})();
