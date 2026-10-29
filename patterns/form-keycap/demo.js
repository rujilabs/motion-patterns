// Demo only: a kitchen display at the pass. The keycaps are plain buttons; this wires their clicks to the tickets.
(function () {
  var queue = [
    { no: "#A231", where: "Table 7, dine in", at: "12:41 pm", age: "6 min", server: "Farid",
      items: [[2, "Nasi kandar, ayam goreng", "kuah campur, banjir"], [1, "Roti telur bawang"], [1, "Teh tarik", "kurang manis"], [1, "Air limau ais"]] },
    { no: "#A232", where: "Grab, rider 4 min", at: "12:43 pm", age: "4 min", server: "Online",
      items: [[3, "Nasi kandar, kari kambing"], [1, "Sayur bendi, extra"], [2, "Papadom"]] },
    { no: "#A233", where: "Table 12, dine in", at: "12:44 pm", age: "3 min", server: "Kavitha",
      items: [[1, "Mee goreng mamak", "tak pedas"], [1, "Roti canai, kuah dal"], [2, "Milo ais"]] },
    { no: "#A234", where: "Takeaway, counter", at: "12:46 pm", age: "1 min", server: "Farid",
      items: [[4, "Nasi kandar, ayam madu"], [4, "Teh o ais limau"]] },
    { no: "#A235", where: "Table 3, dine in", at: "12:47 pm", age: "now", server: "Kavitha",
      items: [[1, "Murtabak ayam", "cut in 8"], [1, "Nescafe tarik"]] }
  ];
  var i = 0, bumped = 41, done = [];
  var avg = [372, 368, 365, 362, 358, 355];
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var ticket = document.getElementById("ticket");
  var $ = function (id) { return document.getElementById(id); };

  function fill(o) {
    $("t-no").textContent = o.no;
    $("t-where").textContent = o.where;
    $("t-in").textContent = "In " + o.at;
    $("t-age").textContent = o.age;
    $("t-foot").textContent = "Server: " + o.server;
    var ul = $("t-items");
    ul.textContent = "";
    o.items.forEach(function (it) {
      var li = document.createElement("li");
      var b = document.createElement("b"); b.textContent = it[0];
      li.appendChild(b);
      li.appendChild(document.createTextNode(it[1]));
      if (it[2]) { var s = document.createElement("small"); s.textContent = it[2]; li.appendChild(s); }
      ul.appendChild(li);
    });
  }
  function stats() {
    $("waiting").textContent = queue.length - i - 1;
    $("bumped").textContent = bumped;
    var a = avg[Math.min(done.length, avg.length - 1)];
    $("avg").textContent = Math.floor(a / 60) + " min " + (a % 60) + " s";
  }
  function swap(next, dir) {
    if (reduce.matches || !ticket.animate) { fill(next); return; }
    var out = ticket.animate(
      [{ transform: "none", opacity: 1 }, { transform: "translateY(" + (dir * -22) + "px) rotate(" + (dir * -1.5) + "deg)", opacity: 0 }],
      { duration: 180, easing: "ease-in", fill: "forwards" });
    out.onfinish = function () {
      fill(next);
      out.cancel();
      ticket.animate(
        [{ transform: "translateY(" + (dir * 26) + "px)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 420, easing: getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out" });
    };
  }

  $("bump").addEventListener("click", function () {
    if (i >= queue.length) return;
    done.push(i); bumped++; i++;
    var next = i < queue.length ? queue[i] : null;
    $("say").textContent = queue[i - 1].no + " bumped." + (next ? " Next " + next.no + "." : " The rail is clear.");
    if (next) swap(next, 1);
    else {
      // rail clear: start the lunch rush again so the demo keeps going
      i = 0; done = []; bumped = 41; swap(queue[0], 1);
    }
    stats();
  });
  $("recall").addEventListener("click", function () {
    if (!done.length) { $("say").textContent = "Nothing to recall yet."; return; }
    i = done.pop(); bumped--;
    $("say").textContent = queue[i].no + " recalled.";
    swap(queue[i], -1);
    stats();
  });
})();
