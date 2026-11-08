// Demo only: says the rating in words and fakes sending it.
(function () {
  var WORDS = ["Tap a star", "Not good", "Could be better", "Okay", "Good", "Sedap, will order again"];
  var form = document.querySelector(".meal");
  var word = document.getElementById("word");
  var rate = document.getElementById("rate");
  rate.addEventListener("change", function (e) { word.textContent = WORDS[+e.target.value] + ", " + e.target.value + " of 5"; });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var r = form.querySelector("input:checked");
    word.textContent = r ? "Thanks Farhan, " + r.value + " of 5 sent to Mak Teh at 1:26 pm." : "Pick a star first.";
  });
})();
