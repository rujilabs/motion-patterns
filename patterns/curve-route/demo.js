// Demo only: a fake courier scan moves the van one stop on, and the stop list follows. The route is route.js.
(function () {
  var route = document.getElementById("route");
  var list = document.getElementById("stops").children;
  var status = document.getElementById("status");
  var next = document.getElementById("next");
  var NAMES = ["the shop", "Pasir Puteh", "Kampung Simee", "Falim", "Bercham", "Tasek", "your door"];
  var LEFT = ["Loaded 9:40 am", "Dropped 10:12 am", "Dropped 10:37 am", "Dropped 11:02 am", "Dropped 11:27 am", "Dropped 11:49 am", "Delivered 12:14 pm"];
  var HERE = ["", "", "", "Van is here, 10:58 am", "Van is here, 11:24 am", "Van is here, 11:46 am", "Delivered 12:14 pm"];
  var AHEAD = ["", "", "", "", "About 11:24 am", "About 11:46 am", "12:05 to 12:35 pm"];
  var START = 3, END = list.length - 1;

  function show(i) {
    for (var k = 0; k < list.length; k++) {
      list[k].classList.toggle("past", k < i);
      list[k].classList.toggle("now", k === i);
      list[k].querySelector(".when").textContent = k < i ? LEFT[k] : k === i ? HERE[k] : AHEAD[k];
    }
    route.setAttribute("aria-label", "Delivery route map. The van is at stop " + (i + 1) + " of " + list.length + ", " + NAMES[i] + ".");
    var left = END - i;
    status.textContent = i === END ? "Delivered at 12:14 pm. Signed for by Mrs Lim."
      : "Van PKN 4127 with Muthu is at " + NAMES[i] + ". " + (left === 1 ? "Yours is the next stop." : left - 1 + " stops before yours.");
    next.textContent = i === END ? "Replay" : "Next scan";
  }
  route.addEventListener("arrive", function (e) { show(e.detail.index); });
  next.addEventListener("click", function () {
    var at = +route.dataset.at;
    if (at >= END) { show(START); route.replay(START); }
    else route.go(at + 1);
  });
})();
