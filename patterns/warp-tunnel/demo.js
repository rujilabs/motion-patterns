/* Demo only, not part of the pattern: answers the search with this week's night trips. */
(function () {
  var form = document.getElementById("wtd-form"), out = document.getElementById("wtd-result");
  if (!form || !out) return;
  var trips = {
    "Kota Bharu": { n: 4, first: "9:45 pm", fare: "RM 46.80" },
    "Kuala Terengganu": { n: 3, first: "10:15 pm", fare: "RM 41.20" }
  };
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = trips[form.to.value];
    out.textContent = t.n + " night trips to " + form.to.value + " on " + form.night.value + ". First at " + t.first + ", from " + t.fare + ".";
  });
})();
