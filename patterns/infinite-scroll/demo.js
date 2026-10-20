/* Demo only: a pretend server that answers in 900 ms with four notes, three times, then runs out. */
(function () {
  var notes = [
    ["Mei Ling Ong", "ML", "Moved the Thursday stand-up to 10:30 so the field team can join.", "2 h"],
    ["Daniel Okafor", "DO", "New photos of the north gate are in the shared folder.", "3 h"],
    ["Aina Zulkifli", "AZ", "Reminder: the van is booked for Saturday morning.", "4 h"],
    ["Tomas Berg", "TB", "Printed the site maps. Pick them up at the front desk.", "5 h"],
    ["Priya Menon", "PM", "Budget sheet updated with the September invoices.", "6 h"],
    ["Hafiz Rahim", "HR", "Water tank at block C is fixed, thanks everyone.", "8 h"],
    ["Sofia Lindqvist", "SL", "Draft of the visitor guide is ready for comments.", "9 h"],
    ["Kenji Mori", "KM", "Two spare helmets left in the store room.", "11 h"],
    ["Lina Haddad", "LH", "The supplier confirmed delivery for Monday.", "1 d"],
    ["Arif Hamzah", "AH", "Added the new gate code to the handbook.", "1 d"],
    ["Grace Tan", "GT", "Lunch on Friday is on the roof if it does not rain.", "1 d"],
    ["Omar Siddiq", "OS", "Closing the old ticket about the parking lights.", "2 d"]
  ];
  var page = 0;
  var feed = document.querySelector("[data-infinite]");
  function item(n) {
    var li = document.createElement("li");
    li.className = "note";
    li.innerHTML = '<span class="av" aria-hidden="true"></span><div><p class="note-top"><strong></strong><time class="num"></time></p><p class="note-text"></p></div>';
    li.querySelector(".av").textContent = n[1];
    li.querySelector("strong").textContent = n[0];
    li.querySelector("time").textContent = n[3];
    li.querySelector(".note-text").textContent = n[2];
    return li;
  }
  feed.addEventListener("infinite:load", function (e) {
    setTimeout(function () {
      var batch = notes.slice(page * 4, page * 4 + 4);
      page++;
      e.detail.done(batch.length ? batch.map(item) : null);
    }, 900);
  });
})();
