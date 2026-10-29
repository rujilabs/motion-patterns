// Demo only: the A to Z buttons under the card file. Typing a letter on the file itself is built in.
(function () {
  var rdx = document.getElementById("rdx"), az = document.querySelector(".az");
  az.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-letter]");
    if (b && rdx.rolodex) rdx.rolodex.letter(b.getAttribute("data-letter"));
  });
  function mark() {
    var card = rdx.querySelector('[aria-selected="true"]');
    var l = card ? card.getAttribute("data-key")[0] : "";
    az.querySelectorAll("button").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-letter") === l); });
  }
  rdx.addEventListener("change", mark);
  mark();
})();
