// Demo only: a phone-width layout, the "saved" note, and a test order that runs through the steps.
// The board, the dragging and the connectors are connector.js.
(function () {
  var board = document.getElementById("board");
  var saved = document.getElementById("saved");
  var result = document.getElementById("result");
  var test = document.getElementById("test");
  var steps = board.querySelectorAll(".step");
  var w1 = document.getElementById("w1"), w2 = document.getElementById("w2"), w3 = document.getElementById("w3");
  var runs = [];

  // three columns do not fit a phone: the flow runs top to bottom there, ports on the top and bottom edges
  if (board.clientWidth < 520) {
    board.dataset.flow = "down";
    board.place("n-order", 8, 12);
    board.place("n-slot", 88, 128);
    board.place("n-wa", 8, 278);
    board.place("n-run", board.clientWidth - 144, 278);
  }

  function clear() {
    runs.forEach(function (a) { a.cancel(); });
    runs = [];
    steps.forEach(function (s) { s.classList.remove("is-hit"); });
    result.textContent = "";
    test.disabled = false;
  }
  board.addEventListener("nodemove", function () { if (runs.length || test.disabled) clear(); });
  board.addEventListener("nodedrop", function () { saved.textContent = "Saved 4:13 pm"; });

  function hit(id) { document.getElementById(id).classList.add("is-hit"); }
  test.addEventListener("click", function () {
    clear();
    test.disabled = true;
    hit("n-order");
    var a = board.pulse(w1, 760);
    runs.push(a);
    a.finished.then(function () {
      hit("n-slot");
      var b = board.pulse(w2, 640), c = board.pulse(w3, 820);
      runs.push(b, c);
      b.finished.then(function () { hit("n-wa"); }, function () {});
      return c.finished;
    }).then(function () {
      hit("n-run");
      runs = [];
      test.disabled = false;
      result.textContent = "Test passed: 42 pax for Thursday 12:30 pm, WhatsApp sent, on van 2.";
    }, function () {});
  });
})();
