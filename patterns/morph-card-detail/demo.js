// Demo only: a paint shop's colour cards. Fills the detail view for the card that was pressed.
(function () {
  var paints = [
    ["Kunyit Muda", "YL 2081", 58, "#e2b33f", "A warm turmeric yellow. Soft in a west-facing room, bright in one that faces north.", false],
    ["Teh Tarik", "BR 1146", 41, "#c39a6d", "Milky brown with a little red in it. Sits well with teak and rattan.", false],
    ["Daun Pandan", "GN 3307", 29, "#6f9a5c", "A leaf green that reads calm, not loud. Good for a study or a back kitchen.", true],
    ["Laut Pangkor", "BL 4420", 14, "#2f6d84", "Deep sea blue. Use it on one wall; it drinks light, so the rest stays pale.", true],
    ["Bata Merah", "RD 5512", 17, "#b4553a", "Fired clay brick. Warm under yellow bulbs, earthy in daylight.", true],
    ["Kapur Sirih", "WH 0108", 83, "#ece5d6", "Lime white with a touch of cream. The ceiling colour most people come back for.", false]
  ];
  var root = document.getElementById("paints");
  var $ = function (id) { return document.getElementById(id); };
  var current = 0;
  root.addEventListener("card-detail", function (e) {
    if (!e.detail.card) return;
    var p = paints[+e.detail.card.dataset.id];
    current = +e.detail.card.dataset.id;
    $("d-chip").style.background = p[3];
    $("d-label").textContent = p[1];
    $("d-label").classList.toggle("light", p[5]);
    $("d-name").textContent = p[0];
    $("d-code").textContent = p[1];
    $("d-lrv").textContent = "Light reflectance " + p[2];
    $("d-text").textContent = p[4];
    $("say").textContent = "";
  });
  $("add").addEventListener("click", function () {
    var big = document.querySelector("input[name=size]:checked").value === "5";
    $("say").textContent = paints[current][0] + ", " + (big ? "5 L" : "1 L") + " added to your trolley.";
    $("add").textContent = "Added, " + (big ? "RM 189.00" : "RM 52.90");
  });
  root.addEventListener("card-detail", function (e) { if (e.detail.card) $("add").textContent = "Add to trolley"; });
})();
