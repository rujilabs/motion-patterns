// Demo only: steps the stall through the night. Setting data-value is all it takes to roll a number.
(function () {
  var night = [
    { at: "7:00 pm", takings: 744, sold: 186, queue: 9, note: "Gas tank changed at 6:40 pm. Peanut and corn, RM 4 a piece." },
    { at: "8:00 pm", takings: 1648.5, sold: 412, queue: 23, note: "The after-Maghrib rush. Second batter bucket opened." },
    { at: "9:00 pm", takings: 2924.5, sold: 731, queue: 31, note: "Longest queue of the night, past the satay stall." },
    { at: "10:00 pm", takings: 3872, sold: 968, queue: 14, note: "Corn is finished. Peanut only from here." },
    { at: "11:00 pm", takings: 4416, sold: 1104, queue: 4, note: "Last batch on the plate. Packing up at 11:30." }
  ];
  var i = 0;
  var btn = document.getElementById("next");
  btn.addEventListener("click", function () {
    i = (i + 1) % night.length;
    var h = night[i];
    document.getElementById("takings").dataset.value = h.takings;
    document.getElementById("sold").dataset.value = h.sold;
    document.getElementById("queue").dataset.value = h.queue;
    document.getElementById("clock").textContent = h.at;
    document.getElementById("note").textContent = h.note;
    btn.textContent = i === night.length - 1 ? "Start the night again" : "Next hour";
  });
})();
