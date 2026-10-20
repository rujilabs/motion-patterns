/* Demo only: "Add a task" adds one; ticking it off empties the list, and the empty state settles in again. */
(function () {
  var list = document.querySelector(".t-list");
  var empty = document.querySelector(".empty");
  var count = document.querySelector(".t-count");
  var names = ["Call the printer about the menu boards", "Send Farah the October rota", "Water the plants by the door"];
  var n = 0;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function sync() {
    var open = list.querySelectorAll("li:not(.leaving)").length;
    count.textContent = open + " open";
    // showing the empty state again (display none to shown) replays its entrance
    empty.hidden = open > 0;
  }

  document.querySelector(".add").addEventListener("click", function () {
    var li = document.createElement("li");
    var label = document.createElement("label");
    var box = document.createElement("input");
    box.type = "checkbox";
    label.appendChild(box);
    label.appendChild(document.createTextNode(" " + names[n++ % names.length]));
    li.appendChild(label);
    list.appendChild(li);
    box.addEventListener("change", function () {
      li.classList.add("leaving");
      setTimeout(function () { li.remove(); sync(); }, reduce.matches ? 0 : 400);
    });
    sync();
    box.focus();
  });
})();
