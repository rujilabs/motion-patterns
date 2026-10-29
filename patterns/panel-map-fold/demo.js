// Demo only: opens the map once after load, so the gallery shows it, and lights the direction steps
// the open panels show. The folding is panel-map-fold.js.
(function () {
  var fold = document.querySelector(".mapfold");
  var steps = document.querySelectorAll("#steps li");
  var hint = document.getElementById("hint");
  var words = ["Folded. Pull the map open by its edge, or tab to it and use the arrow keys.",
    "One fold open: the exit and the start of Persiaran Bayu.",
    "Two folds open: over the river to the surau.",
    "Fully open. Push the edge back to fold it, or tab to it and use the arrow keys."];
  function show(n) {
    // panel 0 shows step 1, panels 1 and 2 step 2, panel 3 step 3
    var upTo = n === 0 ? 1 : n < 3 ? 2 : 3;
    steps.forEach(function (li) { li.classList.toggle("is-on", +li.getAttribute("data-step") <= upTo); });
    hint.textContent = words[n];
  }
  fold.addEventListener("foldchange", function (e) { show(e.detail.value); });
  show(0);
  setTimeout(function () { if (fold.mapfold && fold.mapfold.value === 0) fold.mapfold.set(3); }, 600);
})();
