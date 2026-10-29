// Demo only: presets, the token output, copy, and the duration. The editor itself is easing-editor.js.
(function () {
  var ed = document.getElementById("ed");
  var code = document.getElementById("code");
  var copy = document.getElementById("copy");
  var chips = document.querySelectorAll(".chip");
  var frame = document.getElementById("frame");

  function show() {
    code.textContent = ed.css;
    chips.forEach(function (c) {
      var same = c.dataset.v.split(",").every(function (n, i) { return Math.abs(+n - ed.value[i]) < 0.005; });
      c.setAttribute("aria-pressed", same ? "true" : "false");
    });
  }
  ed.addEventListener("input", show);
  ed.addEventListener("change", show);
  chips.forEach(function (c) { c.addEventListener("click", function () { ed.set(c.dataset.v.split(","), true); }); });
  document.querySelectorAll('input[name="dur"]').forEach(function (r) {
    r.addEventListener("change", function () {
      ed.dataset.duration = r.value;
      frame.textContent = Math.round(r.value / 12);
      ed.play();
    });
  });
  document.getElementById("replay").addEventListener("click", function () { ed.play(); });
  copy.addEventListener("click", function () {
    var text = "--ease-sheet-open: " + ed.css + ";";
    var done = function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy"; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
  });
  show();
  // one replay when the page opens, so the preview shows what the curve does
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(ed.play, 300); } }, { threshold: 0.5 });
    io.observe(ed);
  }
})();
