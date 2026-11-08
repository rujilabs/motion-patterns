// Demo only: confirm first, then shred, then a 5 second undo window (focus lands on Undo; the window waits while the pointer is on it).
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var machine = document.getElementById("sh-machine");
  var ask = document.getElementById("sh-ask"), confirm = document.getElementById("sh-confirm");
  var yes = document.getElementById("sh-yes"), no = document.getElementById("sh-no");
  var toast = document.getElementById("sh-toast"), msg = document.getElementById("sh-msg");
  var undo = document.getElementById("sh-undo"), bar = document.getElementById("sh-bar");
  var say = document.getElementById("sh-say"), count = document.getElementById("sh-count");
  var empty = document.getElementById("sh-empty");
  var timer = null, done = false;

  ask.addEventListener("click", function () { ask.hidden = true; confirm.hidden = false; yes.focus(); });
  no.addEventListener("click", function () { confirm.hidden = true; ask.hidden = false; ask.focus(); });
  yes.addEventListener("click", function () {
    confirm.hidden = true;
    say.textContent = "Shredding INV-2026-0318.";
    machine.shredder.shred();
  });
  machine.addEventListener("shredded", function () {
    count.textContent = "0";
    empty.hidden = false;
    if (!reduce.matches) empty.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: "ease-out" });
    done = false;
    msg.textContent = "Draft INV-2026-0318 shredded.";
    undo.textContent = "Undo";
    toast.hidden = false;
    undo.focus();
    say.textContent = "Draft shredded. Undo for 5 seconds.";
    if (timer) timer.cancel();
    timer = bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 5000, easing: "linear", fill: "forwards" });
    timer.id = "undo window";
    timer.onfinish = function () {
      done = true;
      msg.textContent = "Deleted. No drafts left.";
      undo.textContent = "Start again";
      say.textContent = "Draft deleted.";
    };
  });
  // the window waits while the pointer is on the toast
  function hold() { if (timer && timer.playState === "running") timer.pause(); }
  function go() { if (timer && timer.playState === "paused" && !toast.matches(":hover")) timer.play(); }
  toast.addEventListener("pointerenter", hold);
  toast.addEventListener("pointerleave", go);
  undo.addEventListener("click", function () {
    if (timer) { timer.cancel(); timer = null; }
    toast.hidden = true;
    say.textContent = done ? "Draft back for the demo." : "Undone. INV-2026-0318 is back in drafts.";
    empty.hidden = true;
    machine.shredder.restore();
  });
  machine.addEventListener("restored", function () { count.textContent = "1"; ask.hidden = false; ask.focus(); });
})();
