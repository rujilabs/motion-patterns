// Demo only: a GP dictating consultation notes. Speech is simulated: each take reads out the next
// part of the note at a speaking pace, then the mic stops itself after 4 s of silence.
(function () {
  var takes = [
    "Dry cough for 9 days, worse at night. No fever, no shortness of breath. Non-smoker, no recent travel.",
    "On examination chest clear, throat mildly injected, post-nasal drip seen. Likely allergic rhinitis.",
    "Plan: loratadine 10 mg once daily for 7 days and saline nasal spray. Review in 2 weeks if no better."
  ];
  var SILENCE = 4000;
  var mic = document.getElementById("mic");
  var notes = document.getElementById("notes");
  var $ = function (id) { return document.getElementById(id); };
  var take = 0, timer = 0, tick = 0, startAt = 0, lastWord = 0, total = 0, para = null;

  function fmt(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function clock() {
    var now = performance.now();
    $("clock").textContent = fmt(total + now - startAt);
    if (lastWord && now - lastWord > SILENCE) MicRecord.set(mic, false);
  }
  function speak(words, i) {
    if (i >= words.length) { lastWord = performance.now(); return; }
    var w = document.createElement("span");
    w.className = "w new";
    w.textContent = (i ? " " : "") + words[i];
    para.appendChild(w);
    lastWord = 0;
    // a speaking pace: about 150 words a minute, longer words take longer, a pause after a full stop
    var gap = 230 + words[i].length * 22 + (/[.,:]$/.test(words[i]) ? 260 : 0);
    timer = setTimeout(function () { speak(words, i + 1); }, gap);
  }

  mic.addEventListener("mic-record", function (e) {
    if (e.detail.recording) {
      if (take >= takes.length) { // the note is done: start a fresh one
        take = 0; total = 0;
        notes.textContent = "";
      }
      var ph = $("placeholder"); if (ph) ph.remove();
      para = document.createElement("p");
      para.className = "live";
      notes.appendChild(para);
      startAt = performance.now();
      $("state").textContent = "Listening";
      $("state").classList.add("on");
      $("clock").classList.add("on");
      $("hint").textContent = "Speak normally. Tap the square to stop.";
      $("saved").textContent = "Draft";
      $("say").textContent = "Recording.";
      timer = setTimeout(function () { speak(takes[take].split(" "), 0); }, 500);
      tick = setInterval(clock, 200);
    } else {
      clearTimeout(timer); clearInterval(tick);
      var silent = lastWord && performance.now() - lastWord > SILENCE - 250;
      total += performance.now() - startAt;
      lastWord = 0;
      if (para) { para.classList.remove("live"); if (!para.textContent) para.remove(); }
      if (para && para.textContent) take++;
      $("clock").textContent = fmt(total);
      $("state").textContent = take >= takes.length ? "Note complete" : "Saved";
      $("state").classList.remove("on");
      $("clock").classList.remove("on");
      $("hint").textContent = silent ? "Stopped after 4 s of silence. Tap to add more." : "Tap the mic to add more.";
      $("saved").textContent = "Saved 10:" + (44 + take) + " am";
      $("say").textContent = "Stopped. " + fmt(total) + " dictated.";
    }
  });
})();
