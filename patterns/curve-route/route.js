/*
 * route.js: a delivery route that draws itself, and a van that rides the curve to its current stop.
 *   <div class="curve-route" data-at="3">
 *     <svg viewBox="0 0 400 280">
 *       <path class="cr-route" d="M38 232 C ..."/>
 *       <circle class="cr-stop" cx="38" cy="232" r="5"/> ... one per stop, in route order
 *       <g class="cr-van"><g class="cr-body">...van seen from above, nose pointing right...</g></g>
 *     </svg>
 *   </div>
 * When it scrolls into view the route draws from the first stop to the last, each stop pops as the
 * line reaches it, then the van rides from the first stop to stop data-at. Change data-at (or call
 * el.go(i)) and the van rides on from where it is. The van is moved by keyframes sampled from the path
 * itself (position and heading), so it turns with every bend, and the travelled line grows under it on
 * the same clock. "arrive" fires with detail.index when it stops.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var css = getComputedStyle(document.documentElement);
  function token(name, fallback) { return css.getPropertyValue(name).trim() || fallback; }
  var EASE_INOUT = token("--ease-inout", "ease-in-out");
  var EASE_SPRING = token("--ease-spring", "ease-out");
  var DRAW = 1000;          // ms for the whole route to draw
  var SHADOW = [1.4, 2.2];  // the van's shadow falls down and right, whichever way the van faces

  function setup(el) {
    if (el._route) return;
    el._route = true;
    var route = el.querySelector(".cr-route");
    var van = el.querySelector(".cr-van");
    var body = el.querySelector(".cr-body") || van;
    var stops = [].slice.call(el.querySelectorAll(".cr-stop"));
    var L = route.getTotalLength();

    // the travelled part: a copy of the route, dashed to the van's distance
    var done = route.cloneNode(false);
    done.setAttribute("class", "cr-done");
    route.parentNode.insertBefore(done, route.nextSibling);
    done.style.strokeDasharray = L + " " + L;

    // the shadow is a copy of the body that stays offset toward the floor, not toward the van's nose
    var shadow = body.cloneNode(true);
    shadow.setAttribute("class", "cr-shadow");
    shadow.setAttribute("aria-hidden", "true");
    van.parentNode.insertBefore(shadow, van);

    // where each stop sits along the path: the nearest sample, searching forward from the last stop
    var at = stops.map(function () { return 0; });
    var from = 0;
    stops.forEach(function (s, i) {
      var cx = +s.getAttribute("cx"), cy = +s.getAttribute("cy"), best = Infinity, bestD = from;
      for (var d = from; d <= L; d += 1) {
        var p = route.getPointAtLength(d), q = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
        if (q < best) { best = q; bestD = d; }
      }
      at[i] = i === stops.length - 1 ? L : bestD;
      from = bestD;
    });

    function pose(d) {
      d = Math.max(0, Math.min(L, d));
      var p = route.getPointAtLength(d);
      var a = route.getPointAtLength(Math.max(0, d - 3)), b = route.getPointAtLength(Math.min(L, d + 3));
      return { x: p.x, y: p.y, a: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
    }
    function tf(p, off) {
      return "translate(" + (p.x + (off ? SHADOW[0] : 0)).toFixed(2) + "px, " + (p.y + (off ? SHADOW[1] : 0)).toFixed(2) + "px) rotate(" + p.a.toFixed(2) + "deg)";
    }
    // keyframes sampled along the path, with the heading unwrapped so the van never spins the long way
    function track(d0, d1) {
      var n = Math.max(8, Math.ceil(Math.abs(d1 - d0) / 5)), out = [], last = null;
      for (var i = 0; i <= n; i++) {
        var p = pose(d0 + (d1 - d0) * i / n);
        if (last !== null) { while (p.a - last > 180) p.a -= 360; while (p.a - last < -180) p.a += 360; }
        last = p.a;
        out.push(p);
      }
      return out;
    }

    var index = clamp(+el.dataset.at || 0);
    var dist = 0;               // where the van shows now
    var played = false;
    var running = [];

    function clamp(i) { return Math.max(0, Math.min(stops.length - 1, Math.round(i))); }
    function mark(i) {
      stops.forEach(function (s, k) {
        s.classList.toggle("is-past", k < i);
        s.classList.toggle("is-now", k === i);
        s.classList.toggle("is-ahead", k > i);
      });
    }
    function place(d) {
      var p = pose(d);
      van.style.transform = tf(p, false);
      shadow.style.transform = tf(p, true);
      done.style.strokeDashoffset = (L - d).toFixed(2);
      dist = d;
    }
    function stopAll() { running.forEach(function (a) { a.cancel(); }); running = []; }
    function anim(node, frames, opts) { var a = node.animate(frames, opts); running.push(a); return a; }

    // ride from where the van is to stop i; delay lets the entrance draw the route first
    function ride(i, delay) {
      var d0 = dist, d1 = at[i];
      place(d1);                                  // the end state is the inline style; animations sit on top
      var ms = Math.min(1600, 450 + Math.abs(d1 - d0) * 3.2);
      var opts = { duration: ms, delay: delay || 0, easing: EASE_INOUT, fill: "backwards" };
      var pts = track(d0, d1);
      var last = anim(van, pts.map(function (p) { return { transform: tf(p, false) }; }), opts);
      anim(shadow, pts.map(function (p) { return { transform: tf(p, true) }; }), opts);
      var line = anim(done, [{ strokeDashoffset: L - d0 }, { strokeDashoffset: L - d1 }], opts);
      last.onfinish = function () { arrive(i); };
      // stops turn to "passed" the moment the van goes by them, read from the eased progress
      (function watch() {
        if (running.indexOf(line) < 0) return;
        var k = line.effect.getComputedTiming().progress;
        if (k !== null) {
          var d = d0 + (d1 - d0) * k;
          stops.forEach(function (s, j) { if (j !== i) { s.classList.toggle("is-past", at[j] < d - 1); s.classList.toggle("is-ahead", at[j] >= d - 1); } });
        }
        if (line.playState !== "finished") requestAnimationFrame(watch);
      })();
    }
    function arrive(i) {
      mark(i);
      if (!reduce.matches) {
        // the load keeps going for a moment after the wheels stop, and the stop marker answers
        anim(body, [{ transform: "translateX(0)" }, { transform: "translateX(1.3px)" }, { transform: "translateX(0)" }], { duration: 360, easing: "ease-out" });
        anim(stops[i], [{ transform: "scale(1)" }, { transform: "scale(1.45)" }, { transform: "scale(1)" }], { duration: 420, easing: EASE_SPRING });
      }
      el.dispatchEvent(new CustomEvent("arrive", { bubbles: true, detail: { index: i } }));
    }

    function entrance() {
      played = true;
      el.classList.add("is-played");
      stopAll();
      dist = 0;
      if (reduce.matches) { place(at[index]); mark(index); el.dispatchEvent(new CustomEvent("arrive", { bubbles: true, detail: { index: index } })); return; }
      mark(-1);
      route.style.strokeDasharray = L + " " + L;
      anim(route, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: DRAW, easing: "linear" });
      // the pen moves at a steady speed, so a stop pops at the moment the line reaches it
      stops.forEach(function (s, k) {
        anim(s, [{ transform: "scale(0)" }, { transform: "scale(1)" }], { duration: 380, delay: at[k] / L * DRAW, easing: EASE_SPRING, fill: "backwards" });
      });
      anim(van, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: DRAW - 100, fill: "backwards" });
      anim(shadow, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: DRAW - 100, fill: "backwards" });
      place(0);
      ride(index, DRAW + 120);
    }

    function move(i) {
      index = i;
      if (!played) return;
      stopAll();
      stops.forEach(function (s, k) {
        s.classList.remove("is-now");
        s.classList.toggle("is-past", at[k] < dist - 1);
        s.classList.toggle("is-ahead", at[k] >= dist - 1);
      });
      if (reduce.matches) { place(at[i]); arrive(i); } else ride(i, 0);
    }
    // data-at is the source of truth: el.go(i) and outside code both just set it
    el.go = function (i) { el.dataset.at = clamp(i); };
    el.replay = function (i) {
      if (i !== undefined) { index = clamp(i); el.dataset.at = index; }
      entrance();
    };
    new MutationObserver(function () {
      var i = clamp(+el.dataset.at || 0);
      if (i !== index) move(i);
    }).observe(el, { attributes: true, attributeFilter: ["data-at"] });

    place(at[index]);
    mark(index);
    if (reduce.matches || !("IntersectionObserver" in window)) { played = true; el.classList.add("is-played"); el.dispatchEvent(new CustomEvent("arrive", { bubbles: true, detail: { index: index } })); return; }
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); entrance(); }
    }, { threshold: 0.35 });
    io.observe(el);
  }

  function init() { document.querySelectorAll(".curve-route").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
