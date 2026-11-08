// Demo only: one small swing when the badge first comes into view, so it reads as something you can move.
(function () {
  var hang = document.getElementById("lb-hang");
  if (!hang || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (en) {
    if (!en[0].isIntersecting) return;
    io.disconnect();
    setTimeout(function () { if (hang.lanyard) hang.lanyard.nudge(1.3); }, 300);
  }, { threshold: 0.5 });
  io.observe(hang);
})();
