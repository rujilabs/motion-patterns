/*
 * panel-faq-hinge.js: springs each FAQ flap about its top hinge. A .hinge holds a button with
 * aria-expanded and aria-controls, and the region it controls, which holds one .hinge-flap.
 *
 *   <div class="hinge-list" data-single>            data-single: opening one closes the others
 *     <div class="hinge" data-closed>                 data-closed: start closed (needs the script)
 *       <h3><button class="hinge-q" id="q1" aria-expanded="true" aria-controls="a1">Question</button></h3>
 *       <div class="hinge-a" id="a1" role="region" aria-labelledby="q1"><div class="hinge-flap">Answer</div></div>
 *     </div>
 *   </div>
 *
 * Opening, the flap falls from 90deg (lifted toward you) to 0deg on an underdamped spring, so it
 * swings past hanging and settles. Closing, it lifts on a stiff, damped spring and the region is
 * hidden once it is flat. While it moves the region is h * cos(angle) tall: the projected height.
 * Arrow Up and Down, Home and End move between questions. Reduced motion: no swing, no lift.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAD = Math.PI / 180;
  var OPEN = { w: 13, z: 0.5 };   // falls, swings about 15 degrees past hanging, settles
  var CLOSE = { w: 20, z: 1 };    // lifted by a hand: quick, no bounce

  function Hinge(item, list) {
    var btn = item.querySelector(".hinge-q");
    var region = document.getElementById(btn.getAttribute("aria-controls"));
    var flap = region.querySelector(".hinge-flap");
    var open = !item.hasAttribute("data-closed");
    var a = open ? 0 : 90, v = 0, target = a, spring = OPEN, raf = 0, last = 0, h = 0;

    function paint() {
      item.style.setProperty("--hinge", a.toFixed(2) + "deg");
      if (raf) region.style.height = (h * Math.cos(Math.max(0, Math.min(90, a)) * RAD)).toFixed(1) + "px";
    }
    function settle() {
      raf = 0; last = 0; v = 0; a = target;
      item.classList.remove("is-moving");
      region.style.height = "";
      if (!open) region.hidden = true;
      paint();
    }
    function frame(t) {
      var dt = Math.min(0.032, last ? (t - last) / 1000 : 1 / 60);
      last = t;
      var k = spring.w * spring.w, c = 2 * spring.z * spring.w, n = 4, q = dt / n;
      for (var i = 0; i < n; i++) { v += (-k * (a - target) - c * v) * q; a += v * q; }
      if (Math.abs(a - target) < 0.05 && Math.abs(v) < 0.5) return settle();
      paint();
      raf = requestAnimationFrame(frame);
    }
    function set(next) {
      if (next === open) return;
      open = next;
      btn.setAttribute("aria-expanded", String(open));
      item.dispatchEvent(new CustomEvent(open ? "hingeopen" : "hingeclose", { bubbles: true }));
      if (open) region.hidden = false;
      target = open ? 0 : 90;
      spring = open ? OPEN : CLOSE;
      if (reduce.matches) { cancelAnimationFrame(raf); raf = 0; return settle(); }
      var cs = getComputedStyle(flap); // layout height; the transform does not change it
      h = flap.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      item.classList.add("is-moving");
      if (!raf) { raf = requestAnimationFrame(frame); paint(); }
    }

    btn.setAttribute("aria-expanded", String(open));
    region.hidden = !open;
    paint();
    btn.addEventListener("click", function () {
      if (!open && list.hasAttribute("data-single")) {
        list._hinges.forEach(function (o) { if (o !== api) o.set(false); });
      }
      set(!open);
    });
    var api = { set: set, btn: btn };
    item.hinge = api;
    return api;
  }

  function setup(list) {
    if (list._hinges) return;
    list._hinges = [];
    list.querySelectorAll(".hinge").forEach(function (item) { list._hinges.push(Hinge(item, list)); });
    list.addEventListener("keydown", function (e) {
      var btns = list._hinges.map(function (o) { return o.btn; });
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      var j = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: btns.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      btns[(j + btns.length) % btns.length].focus();
    });
  }
  function init() { document.querySelectorAll(".hinge-list").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
