// Demo only: what the inbox does after a row is archived or deleted. The swipe itself is swipe.js.
(function () {
  var rows = [].slice.call(document.querySelectorAll("#rows .swipe"));
  var status = document.getElementById("in-status");
  var count = document.getElementById("count");
  var again = document.getElementById("again");
  function left() { return rows.filter(function (r) { return !r.hidden; }).length; }
  document.getElementById("rows").addEventListener("action", function (e) {
    var title = e.target.querySelector("strong").textContent;
    var n = left();
    count.textContent = n;
    status.textContent = (e.detail.action === "archive" ? "Archived" : "Deleted") + " “" + title + "”. " + (n ? n + " left in the inbox." : "Inbox empty.");
    again.hidden = false;
    if (!n) again.focus();
  });
  again.addEventListener("click", function () {
    rows.forEach(function (r) { r.reset(); });
    count.textContent = rows.length;
    status.textContent = "All 4 messages are back.";
    again.hidden = true;
    rows[0].querySelector(".swipe-more").focus();
  });
})();
