// Demo only: nothing is really sent. The "fly" event is where a page would post the form with fetch.
(function () {
  var form = document.querySelector(".ask");
  var status = document.getElementById("status");
  form.addEventListener("fly", function () {
    var name = form.elements.name.value.split(" ")[0] || "there";
    status.textContent = "Thanks " + name + ", sent at 10:42 am. Expect a WhatsApp by 5:30 pm on Tuesday 10 November.";
  });
  form.addEventListener("input", function () { status.textContent = "Usual lead time: 5 to 7 weeks."; });
})();
