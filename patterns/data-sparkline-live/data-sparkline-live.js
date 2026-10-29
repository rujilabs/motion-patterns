/*
 * data-sparkline-live.js: a small live line that takes one new point at a time and scrolls left.
 *
 *   <svg class="spark-live" data-points="60" data-max="100" data-limit="85" data-label="CPU, web-01"></svg>
 *   var s = SparkLive(svg);
 *   s.fill([31, 33, 30, ...]);   // history, no motion
 *   s.push(42);                  // every second
 *
 * Each push draws the new point one step past the right edge and slides the line left by one step over
 * the push interval (data-interval, 1000 ms), linear, so a steady feed scrolls at a steady speed. The dot
 * at the right edge rides the line where it crosses the edge. Over data-limit the svg gets .is-over.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var NS = "http://www.w3.org/2000/svg";
  function el(name, cls, parent) {
    var n = document.createElementNS(NS, name);
    n.setAttribute("class", cls);
    parent.appendChild(n);
    return n;
  }

  function SparkLive(svg) {
    var N = +(svg.dataset.points || 60);
    var min = +(svg.dataset.min || 0), max = +(svg.dataset.max || 100);
    var limit = svg.dataset.limit === undefined ? null : +svg.dataset.limit;
    var interval = +(svg.dataset.interval || 1000);
    var unit = svg.dataset.unit === undefined ? "%" : svg.dataset.unit;
    var vals = [];
    var W = 0, H = 0, R = 3, dx = 0;

    svg.textContent = "";
    svg.setAttribute("role", "img");
    svg.setAttribute("preserveAspectRatio", "none");
    var lim = limit === null ? null : el("line", "sl-limit", svg);
    var move = el("g", "sl-shift", svg);
    var area = el("path", "sl-area", move);
    var line = el("path", "sl-line", move);
    var dot = el("circle", "sl-dot", svg);
    dot.setAttribute("r", R);
    var shiftAnim = null, dotAnim = null;

    function measure() {
      var b = svg.getBoundingClientRect();
      W = Math.max(40, Math.round(b.width));
      H = Math.max(16, Math.round(b.height));
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      dx = (W - R - 2) / (N - 1);
    }
    function y(v) {
      var t = (Math.min(max, Math.max(min, v)) - min) / (max - min);
      return (R + 1 + (1 - t) * (H - 2 * R - 2)).toFixed(1);
    }
    // the newest point sits at `right`; older points step back from it
    function draw(right) {
      var d = "", n = vals.length;
      for (var j = 0; j < n; j++) d += (j ? "L" : "M") + (right - (n - 1 - j) * dx).toFixed(1) + " " + y(vals[j]);
      line.setAttribute("d", d);
      area.setAttribute("d", n ? d + "L" + right.toFixed(1) + " " + H + "L" + (right - (n - 1) * dx).toFixed(1) + " " + H + "Z" : "");
      if (lim) { lim.setAttribute("x1", 0); lim.setAttribute("x2", W); lim.setAttribute("y1", y(limit)); lim.setAttribute("y2", y(limit)); }
    }
    function edge() { return W - R - 2; }
    function label() {
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), now = vals[vals.length - 1];
      svg.setAttribute("aria-label", (svg.dataset.label || "Live value") + ", last " + vals.length + " readings: low " + Math.round(lo) + unit + ", high " + Math.round(hi) + unit + ", now " + Math.round(now) + unit);
      svg.classList.toggle("is-over", limit !== null && now > limit);
    }

    function fill(values) {
      vals = values.slice(-N);
      if (!W) measure();
      if (shiftAnim) shiftAnim.cancel();
      if (dotAnim) dotAnim.cancel();
      draw(edge());
      dot.setAttribute("cx", edge());
      dot.style.transform = "translateY(" + y(vals[vals.length - 1]) + "px)";
      label();
    }

    function push(v) {
      var prev = vals.length ? vals[vals.length - 1] : v;
      vals.push(v);
      if (vals.length > N + 1) vals.shift();
      if (!W) measure();
      label();
      if (reduce.matches || !move.animate) {
        if (vals.length > N) vals.shift();
        draw(edge());
        dot.style.transform = "translateY(" + y(v) + "px)";
        return;
      }
      // the new point starts one step off the right edge and the line slides one step left
      if (shiftAnim) shiftAnim.cancel();
      if (dotAnim) dotAnim.cancel();
      draw(edge() + dx);
      var to = "translateX(" + (-dx).toFixed(2) + "px)";
      shiftAnim = move.animate([{ transform: "translateX(0px)" }, { transform: to }], { duration: interval, easing: "linear", fill: "forwards" });
      dot.style.transform = "translateY(" + y(v) + "px)";
      dotAnim = dot.animate([{ transform: "translateY(" + y(prev) + "px)" }, { transform: "translateY(" + y(v) + "px)" }], { duration: interval, easing: "linear" });
    }

    if ("ResizeObserver" in window) {
      var first = true;
      new ResizeObserver(function () { if (first) { first = false; return; } W = 0; measure(); fill(vals.slice(-N)); }).observe(svg);
    }
    var api = { push: push, fill: fill, values: function () { return vals.slice(-N); } };
    svg.spark = api;
    return api;
  }
  window.SparkLive = SparkLive;
})();
