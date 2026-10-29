// Demo only: one note plays at a time, like a real chat, and the line under the thread says what is playing.
// There is no audio file: the player is a clock. The pattern is wave-voice-note.js.
(function () {
  var notes = [document.getElementById("note-in"), document.getElementById("note-out")];
  var who = { "note-in": "Kak Ros's voice note", "note-out": "your voice note" };
  var status = document.getElementById("status");
  notes.forEach(function (n) {
    n.addEventListener("play", function () {
      notes.forEach(function (o) { if (o !== n && o.classList.contains("is-playing")) o.voiceNote.pause(); });
      status.textContent = "Playing " + who[n.id] + ".";
    });
    n.addEventListener("pause", function () {
      if (!notes.some(function (o) { return o.classList.contains("is-playing"); })) status.textContent = "Paused " + who[n.id] + ".";
    });
    n.addEventListener("ended", function () {
      status.textContent = n.id === "note-in" ? "Heard. The mic on Kak Ros's note turns grey, so she knows you listened." : "Finished your voice note.";
    });
  });
})();
