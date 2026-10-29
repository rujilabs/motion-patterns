/*
 * easing-editor.js: a cubic-bezier editor with two real handles, a live spacing chart and a preview.
 *   <div class="curve-easing-editor" data-value="0.2, 0.7, 0.2, 1" data-duration="480">
 *     <div class="ee-graph"></div>      the curve and its two handles are built in here
 *     <div class="ee-track"></div>      optional: a preview dot and the spacing chart are built in here
 *   </div>
 * Drag a handle (mouse, pen or touch; pressing anywhere on the graph grabs the nearer one), or focus it
 * and use the arrow keys: 0.01 a press, 0.1 with Shift. Time (x) stays between 0 and 1, as CSS requires;
 * progress (y) may overshoot. The spacing chart shows where the dot is at every twelfth of the duration,
 * and updates while you drag. When you let go or stop pressing keys, the preview replays: a dot crosses
 * the track, and a second dot runs the curve on the graph, its x moving at a steady rate and its y on
 * this very easing, so it traces the line exactly.
 *   el.value      [x1, y1, x2, y2]          el.css      "cubic-bezier(0.20, 0.70, 0.20, 1.00)"
 *   el.set(v, animate)   move the handles (animate: they glide there)     el.play()   replay the preview
 * "input" fires while a handle moves, "change" when it stops.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var NS = "http://www.w3.org/2000/svg";
  var FRAMES = 12;

  function svg(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function fix(n) { return (Math.round(n * 100) / 100).toFixed(2); }

  // progress at time x for the curve (0,0) (x1,y1) (x2,y2) (1,1)
  function solve(v, x) {
    var x1 = v[0], y1 = v[1], x2 = v[2], y2 = v[3];
    function bx(t) { var u = 1 - t; return 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t; }
    function by(t) { var u = 1 - t; return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t; }
    var lo = 0, hi = 1, t = x;
    for (var i = 0; i < 30; i++) {           // bisection: x(t) always rises because x1 and x2 are in [0, 1]
      var cx = bx(t);
      if (Math.abs(cx - x) < 1e-5) break;
      if (cx < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return by(t);
  }

  function setup(el) {
    if (el._ee) return;
    el._ee = true;
    var YMIN = el.dataset.yMin !== undefined ? +el.dataset.yMin : -0.3;
    var YMAX = el.dataset.yMax !== undefined ? +el.dataset.yMax : 1.3;
    var v = (el.dataset.value || "0.25, 0.1, 0.25, 1").split(",").map(Number);
    var graph = el.querySelector(".ee-graph"), track = el.querySelector(".ee-track");
    var label = el.dataset.label || "Easing";

    // the graph: unit square, quarter lines, the linear reference, two arms and the curve
    var s = svg("svg", { "class": "ee-plot", viewBox: "0 0 100 " + (100 * (YMAX - YMIN)).toFixed(2), preserveAspectRatio: "none", "aria-hidden": "true" });
    var Y = function (y) { return (YMAX - y) * 100; };
    s.appendChild(svg("rect", { "class": "ee-box", x: 0, y: Y(1), width: 100, height: 100 }));
    [0.25, 0.5, 0.75].forEach(function (k) {
      s.appendChild(svg("line", { "class": "ee-grid", x1: k * 100, y1: Y(0), x2: k * 100, y2: Y(1) }));
      s.appendChild(svg("line", { "class": "ee-grid", x1: 0, y1: Y(k), x2: 100, y2: Y(k) }));
    });
    s.appendChild(svg("line", { "class": "ee-linear", x1: 0, y1: Y(0), x2: 100, y2: Y(1) }));
    var arm1 = svg("line", { "class": "ee-arm", x1: 0, y1: Y(0) });
    var arm2 = svg("line", { "class": "ee-arm", x1: 100, y1: Y(1) });
    var curve = svg("path", { "class": "ee-curve" });
    s.append(arm1, arm2, curve);
    graph.appendChild(s);

    // the two handles: HTML, so they take focus, show a ring and carry ARIA
    var handles = [0, 1].map(function (i) {
      var h = document.createElement("span");
      h.className = "ee-handle ee-h" + (i + 1);
      h.tabIndex = 0;
      h.setAttribute("role", "slider");
      h.setAttribute("aria-label", label + ", " + (i ? "second" : "first") + " handle. Left and right change time, up and down change progress");
      h.setAttribute("aria-valuemin", YMIN);
      h.setAttribute("aria-valuemax", YMAX);
      graph.appendChild(h);
      return h;
    });
    // the runner traces the curve: x on a steady clock, y on this easing
    var runX = document.createElement("span"), runY = document.createElement("span");
    runX.className = "ee-run"; runY.className = "ee-run-dot";
    runX.setAttribute("aria-hidden", "true");
    runX.appendChild(runY); graph.appendChild(runX);
    runX.style.top = (YMAX / (YMAX - YMIN) * 100) + "%";      // the line where progress is 0

    // the preview track: spacing ticks and a dot
    var dot = null, ticks = [];
    if (track) {
      for (var f = 0; f <= FRAMES; f++) { var t = document.createElement("span"); t.className = "ee-tick"; track.appendChild(t); ticks.push(t); }
      dot = document.createElement("span"); dot.className = "ee-dot"; dot.setAttribute("aria-hidden", "true");
      track.appendChild(dot);
    }

    function css() { return "cubic-bezier(" + v.map(fix).join(", ") + ")"; }
    function render() {
      var p1 = [v[0] * 100, Y(v[1])], p2 = [v[2] * 100, Y(v[3])];
      arm1.setAttribute("x2", p1[0]); arm1.setAttribute("y2", p1[1]);
      arm2.setAttribute("x2", p2[0]); arm2.setAttribute("y2", p2[1]);
      curve.setAttribute("d", "M0 " + Y(0) + " C" + p1.join(" ") + " " + p2.join(" ") + " 100 " + Y(1));
      handles.forEach(function (h, i) {
        var x = v[i * 2], y = v[i * 2 + 1];
        h.style.left = (x * 100) + "%";
        h.style.top = ((YMAX - y) / (YMAX - YMIN) * 100) + "%";
        h.setAttribute("aria-valuenow", fix(y));
        h.setAttribute("aria-valuetext", "time " + fix(x) + ", progress " + fix(y));
      });
      // spacing chart: where the dot is at each twelfth of the duration
      ticks.forEach(function (t, k) { t.style.setProperty("--p", solve(v, k / FRAMES).toFixed(4)); });
      el.value = v.slice();
      el.css = css();
    }
    function emit(type) { el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { value: v.slice(), css: css() } })); }

    var anims = [];
    el.play = function () {
      anims.forEach(function (a) { a.cancel(); });
      anims = [];
      if (reduce.matches) return;
      var ms = +el.dataset.duration || 600, e = css();
      var gw = graph.clientWidth, unit = graph.clientHeight / (YMAX - YMIN);
      anims.push(runX.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + gw + "px)" }], { duration: ms, easing: "linear" }));
      anims.push(runY.animate([{ transform: "translateY(0)" }, { transform: "translateY(" + (-unit) + "px)" }], { duration: ms, easing: e }));
      if (dot) {
        var tw = track.clientWidth - dot.offsetWidth;
        anims.push(dot.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + tw + "px)" }], { duration: ms, easing: e, fill: "forwards" }));
      }
      el.classList.add("is-playing");
      anims[0].finished.then(function () { el.classList.remove("is-playing"); }, function () {});
    };

    var glide = 0;
    el.set = function (nv, animate) {
      cancelAnimationFrame(glide);
      nv = nv.map(Number);
      if (!animate || reduce.matches) { v = nv; render(); emit("change"); el.play(); return; }
      var from = v.slice(), t0 = performance.now(), ms = 320;
      glide = requestAnimationFrame(function step(now) {
        var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
        v = from.map(function (a, i) { return a + (nv[i] - a) * e; });
        render(); emit("input");
        if (k < 1) glide = requestAnimationFrame(step);
        else { v = nv; render(); emit("change"); el.play(); }
      });
    };

    function put(i, x, y) {
      v[i * 2] = Math.max(0, Math.min(1, Math.round(x * 100) / 100));
      v[i * 2 + 1] = Math.max(YMIN, Math.min(YMAX, Math.round(y * 100) / 100));
      render(); emit("input");
    }
    function toValue(e) {
      var r = graph.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, YMAX - (e.clientY - r.top) / r.height * (YMAX - YMIN)];
    }

    // pressing on the graph grabs the nearer handle, so a finger does not have to land on a 20 px dot
    var drag = null;
    graph.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      var r = graph.getBoundingClientRect(), best = -1, bd = Infinity;
      handles.forEach(function (h, i) {
        var hr = h.getBoundingClientRect(), d = Math.hypot(e.clientX - (hr.left + hr.width / 2), e.clientY - (hr.top + hr.height / 2));
        if (d < bd) { bd = d; best = i; }
      });
      if (bd > Math.max(48, r.width * 0.25)) return;
      e.preventDefault();
      cancelAnimationFrame(glide);
      var hr = handles[best].getBoundingClientRect(), p = toValue(e);
      // keep the offset between the finger and the handle, so the handle does not jump under it
      var c = toValue({ clientX: hr.left + hr.width / 2, clientY: hr.top + hr.height / 2 });
      drag = { id: e.pointerId, i: best, dx: c[0] - p[0], dy: c[1] - p[1] };
      graph.setPointerCapture(e.pointerId);
      handles[best].focus({ preventScroll: true, focusVisible: false });
      handles[best].classList.add("is-held");
      el.classList.add("is-dragging");
    });
    graph.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var p = toValue(e);
      put(drag.i, p[0] + drag.dx, p[1] + drag.dy);
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      handles[drag.i].classList.remove("is-held");
      drag = null;
      el.classList.remove("is-dragging");
      emit("change");
      el.play();
    }
    graph.addEventListener("pointerup", end);
    graph.addEventListener("pointercancel", end);

    var keyTimer = 0;
    handles.forEach(function (h, i) {
      h.addEventListener("keydown", function (e) {
        var s = e.shiftKey ? 0.1 : 0.01, x = v[i * 2], y = v[i * 2 + 1];
        switch (e.key) {
          case "ArrowLeft": x -= s; break;
          case "ArrowRight": x += s; break;
          case "ArrowUp": y += s; break;
          case "ArrowDown": y -= s; break;
          default: return;
        }
        e.preventDefault();
        put(i, x, y);
        // replay once the presses stop, not on every one
        clearTimeout(keyTimer);
        keyTimer = setTimeout(function () { emit("change"); el.play(); }, 350);
      });
    });

    render();
    el.classList.add("is-ready");
  }

  function init() { document.querySelectorAll(".curve-easing-editor").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
