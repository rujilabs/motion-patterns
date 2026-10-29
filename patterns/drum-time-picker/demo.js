// Demo only: checks the picked start time against the clinic's day. The wheels themselves are drum-time-picker.js.
(function () {
  var H = document.querySelector(".drum-h"), M = document.querySelector(".drum-m"), P = document.querySelector(".drum-p");
  var slot = document.getElementById("slot"), slotText = document.getElementById("slot-text");
  var btn = document.getElementById("book"), say = document.getElementById("say");
  var OPEN = 510, CLOSE = 1080, LEN = 45;              // 8:30 am to 6:00 pm, 45 minute sessions
  var busy = [[540, 585], [690, 735], [780, 840, "lunch"], [870, 915], [975, 1020]];
  var booked = -1, nextFree = -1;

  // each list starts on its default value (so the no-script column opens there): read values by data-n
  function nums(el) { return Array.prototype.map.call(el.querySelectorAll(".drum-list > li"), function (li) { return +li.getAttribute("data-n"); }); }
  var hN = nums(H), mN = nums(M);
  function at(el, list) { var i = el.drum ? el.drum.centre : 0; return list ? list[i] : i; }
  function picked() { return at(H, hN) % 12 * 60 + at(M, mN) + (at(P) ? 720 : 0); }
  function clock(t, half) {
    var h = Math.floor(t / 60), m = t % 60, s = (h % 12 || 12) + ":" + (m < 10 ? "0" : "") + m;
    return half === false ? s : s + (h < 12 ? " am" : " pm");
  }
  function range(a, b) {
    var same = (a < 720) === (b < 720);
    return clock(a, !same ? true : false) + " to " + clock(b);
  }
  function clash(t) {
    if (t < OPEN || t + LEN > CLOSE) return "shut";
    for (var i = 0; i < busy.length; i++) if (t < busy[i][1] && t + LEN > busy[i][0]) return busy[i];
    return null;
  }
  function findFree(t) {
    for (var u = Math.max(OPEN, t); u + LEN <= CLOSE; u += 15) if (!clash(u)) return u;
    for (u = OPEN; u + LEN <= CLOSE; u += 15) if (!clash(u)) return u;
    return -1;
  }

  function update(final) {
    var t = picked(), c = clash(t), msg;
    nextFree = -1;
    if (!c) msg = range(t, t + LEN) + " is free.";
    else {
      nextFree = findFree(t);
      if (c === "shut") msg = t < OPEN ? "We open at 8:30 am." : "Last start is 5:15 pm, we close at 6:00.";
      else if (c[2] === "lunch") msg = "Clashes with lunch, 1:00 to 2:00 pm.";
      else msg = "Mei Ling has a patient from " + clock(c[0]) + ".";
    }
    slot.classList.toggle("is-free", !c);
    slot.classList.toggle("is-booked", t === booked);
    slotText.textContent = t === booked ? "Booked. Reminder by WhatsApp at " + clock(t - 60) + " on Thursday." : msg;
    btn.textContent = t === booked ? "Booked for " + clock(t) : !c ? "Book " + clock(t) : "Turn to " + clock(nextFree);
    btn.disabled = t === booked;
    if (final) say.textContent = slotText.textContent;
  }

  [H, M, P].forEach(function (d) {
    d.addEventListener("input", function () { update(false); });
    d.addEventListener("change", function () { update(true); });
  });
  btn.addEventListener("click", function () {
    var t = picked();
    if (nextFree >= 0 && clash(t)) {
      var h = Math.floor(nextFree / 60);
      H.drum.set(hN.indexOf(h % 12 || 12));
      M.drum.set(mN.indexOf(nextFree % 60));
      P.drum.set(h >= 12 ? 1 : 0);
      return;
    }
    booked = t;
    update(true);
  });
  update(false);
})();
