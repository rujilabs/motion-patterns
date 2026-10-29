// Demo only: writes the chosen size, servings and price under the picker. The picker is arc-picker.js.
(function () {
  var sizes = document.getElementById("sizes");
  var INFO = {
    "6": ["serves 6 to 8", "RM 68.00"],
    "7": ["serves 10 to 12", "RM 86.00"],
    "8": ["serves 14 to 16", "RM 112.00"],
    "9": ["serves 18 to 20", "RM 138.00"],
    "10": ["serves 24 to 28", "RM 172.00"]
  };
  function show(v) {
    document.getElementById("p-size").textContent = v + " inch";
    document.getElementById("p-serves").textContent = INFO[v][0];
    document.getElementById("p-price").textContent = INFO[v][1];
  }
  // the readout follows the wheel as it turns, not only when it settles
  sizes.addEventListener("input", function (e) { show(e.detail.value); });
  show(sizes.value || "8");
})();
