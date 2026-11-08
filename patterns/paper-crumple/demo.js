// Demo only: Discard on a note crumples it into the bin; Restore brings back the last one thrown.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var say = document.getElementById("pc-say"), restore = document.getElementById("pc-restore");
  var count = document.getElementById("pc-count");
  var thrown = [];
  function tally() {
    var left = 3 - thrown.length;
    count.textContent = thrown.length;
    restore.hidden = !thrown.length;
    return left;
  }
  document.querySelectorAll(".crumple").forEach(function (note) {
    var btn = note.querySelector(".pc-x");
    btn.addEventListener("click", function () {
      if (note.crumple.state !== "here") return;
      btn.blur();
      restore.hidden = false;
      restore.focus();
      note.crumple.discard();
    });
    note.addEventListener("discarded", function () {
      thrown.push(note);
      var left = tally();
      say.textContent = "Note in the bin. " + left + (left === 1 ? " note" : " notes") + " on the board.";
    });
    note.addEventListener("restored", function () {
      var left = tally();
      say.textContent = "Note restored. " + left + (left === 1 ? " note" : " notes") + " on the board.";
      btn.focus();
    });
  });
  restore.addEventListener("click", function () {
    var note = thrown[thrown.length - 1];
    if (!note || note.crumple.state !== "gone") return;
    thrown.pop();
    count.textContent = thrown.length;
    if (!thrown.length) restore.hidden = true;
    note.crumple.restore();
  });
})();
