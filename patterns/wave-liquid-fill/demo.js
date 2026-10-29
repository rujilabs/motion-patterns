// Demo only: donations raise the total, and the jar's data-value follows. The jar is wave-liquid-fill.js.
(function () {
  var GOAL = 26500;
  var raised = 18642, donors = 412;
  var jar = document.getElementById("jar");
  var recent = document.getElementById("recent");
  var status = document.getElementById("status");
  var match = document.getElementById("match");
  var NAMES = ["Hafiz, Miri", "Dr Chong, Sibu", "Anonymous", "Ngu family, Bintulu", "Kelab Lari Kuching", "Siti, Shah Alam"];
  var n = 0;
  function rm(v) { return "RM " + v.toLocaleString("en-MY"); }
  function give(who, amount) {
    raised += amount; donors += 1;
    var pct = raised / GOAL * 100;
    jar.dataset.value = pct.toFixed(2);
    jar.setAttribute("aria-label", "Jar filled to " + Math.round(pct) + "% of the goal.");
    document.getElementById("raised").textContent = rm(raised);
    document.getElementById("donors").textContent = donors;
    var li = document.createElement("li");
    li.innerHTML = "<span></span><span class=\"num\"></span><span class=\"mute\">just now</span>";
    li.children[0].textContent = who;
    li.children[1].textContent = rm(amount);
    recent.insertBefore(li, recent.firstElementChild);
    if (recent.children.length > 3) recent.removeChild(recent.lastElementChild);
    status.textContent = rm(amount) + " from " + who + ". " + rm(GOAL - raised) + " to go.";
  }
  document.getElementById("give").addEventListener("click", function () { give(NAMES[n++ % NAMES.length], 50); });
  match.addEventListener("click", function () {
    give("Lian Hup Hardware, Miri", 3000);
    match.disabled = true;
    match.textContent = "Lian Hup Hardware matched RM 3,000";
  });
})();
