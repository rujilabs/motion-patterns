/* Demo only: a new order arrives every 6 s while the queue is on screen, unless paused. */
(function () {
  var list = document.querySelector(".sq-list");
  if (!list || !window.StaggeredList) return;
  var pauseBtn = document.querySelector("[data-sq-pause]");
  var clock = document.querySelector("[data-sq-clock]");
  var pool = [
    ["T6", "Ais kacang, kuey teow sup", 1070],
    ["Tapau", "Kopi O kosong x3", 570],
    ["T4", "Roti canai x2, teh O limau", 610],
    ["T8", "Nasi lemak ayam, Milo panas", 1230],
    ["T3", "Half-boiled eggs x2, kopi C", 680]
  ];
  var next = 0, no = 219, minute = 42, paused = false, seen = true, timer = 0;

  function money(sen) { return "RM " + (sen / 100).toFixed(2); }
  function sum() {
    var rows = list.querySelectorAll(".sl-row"), total = 0;
    rows.forEach(function (r) { total += Math.round(parseFloat(r.querySelector(".sq-amt").textContent.replace("RM", "")) * 100); });
    document.querySelector("[data-sq-open]").textContent = rows.length;
    document.querySelector("[data-sq-total]").textContent = money(total);
  }

  function arrive() {
    var o = pool[next++ % pool.length];
    minute += 2;
    var h = 7 + Math.floor(minute / 60), m = minute % 60;
    var t = h + ":" + (m < 10 ? "0" : "") + m;
    var li = document.createElement("li");
    li.className = "sl-row";
    li.innerHTML = '<span class="sq-time num"></span><span class="sq-no num"></span><span class="sq-items"></span><span class="sq-amt num"></span>';
    li.children[0].textContent = t;
    li.children[1].innerHTML = "#" + (no++) + " <b></b>";
    li.children[1].querySelector("b").textContent = o[0];
    li.children[2].textContent = o[1];
    li.children[3].textContent = money(o[2]);
    clock.textContent = "Mon " + t + " am";
    StaggeredList.add(list, li);
    // the oldest row may leave a moment later; count again once it has
    sum();
    setTimeout(sum, 700);
  }

  function tick() {
    clearInterval(timer);
    timer = 0;
    if (!paused && seen && !document.hidden) timer = setInterval(arrive, 6000);
  }

  pauseBtn.addEventListener("click", function () {
    paused = !paused;
    pauseBtn.setAttribute("aria-pressed", String(paused));
    tick();
  });
  document.querySelector("[data-sq-replay]").addEventListener("click", function () { StaggeredList.play(list); });
  document.addEventListener("visibilitychange", tick);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { seen = e[0].isIntersecting; tick(); }).observe(list);
  } else tick();
})();
