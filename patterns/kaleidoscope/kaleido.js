/*
 * kaleido.js: turns one slice into a full kaleidoscope. In an <svg class="kaleidoscope"> whose
 * viewBox is centred on 0 0, draw one slice inside a <g class="k-slice">, pointing right along
 * the x axis and opening counter-clockwise (positive y in SVG). The script clips it to a wedge
 * and adds the mirrored and turned copies around the centre:
 *   even copies are turned by k slices, odd copies are mirrored first, so every edge meets its
 *   own mirror image and the seams vanish.
 * data-slices on the svg sets the number of slices (an even number, default 12).
 * The copies are real elements, so their CSS animations run, pause and stop with the first one.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var made = 0;

  function build(svg) {
    var slice = svg.querySelector(".k-slice");
    if (!slice) return;
    var n = parseInt(svg.getAttribute("data-slices"), 10) || 12;
    if (n % 2) n += 1;
    var a = (2 * Math.PI) / n;
    var vb = svg.viewBox && svg.viewBox.baseVal;
    var r = vb && vb.width ? Math.min(vb.width, vb.height) / 2 : 100; // the circle that fits the viewBox
    var id = "k-wedge-" + (++made);

    var clip = document.createElementNS(NS, "clipPath");
    clip.id = id;
    var wedge = document.createElementNS(NS, "path");
    // a hair wider than one slice, so neighbouring copies overlap instead of leaving a hairline gap
    var e = 0.004;
    wedge.setAttribute("d", "M0 0 L" + (r * Math.cos(-e)).toFixed(2) + " " + (r * Math.sin(-e)).toFixed(2) +
      " A" + r + " " + r + " 0 0 1 " + (r * Math.cos(a + e)).toFixed(2) + " " + (r * Math.sin(a + e)).toFixed(2) + " Z");
    clip.appendChild(wedge);
    var defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(NS, "defs"), svg.firstChild);
    defs.appendChild(clip);

    var deg = 360 / n;
    var first = document.createElementNS(NS, "g");
    first.setAttribute("clip-path", "url(#" + id + ")");
    slice.parentNode.insertBefore(first, slice);
    first.appendChild(slice);

    var at = first;
    for (var k = 1; k < n; k++) {
      var copy = first.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      var wrap = document.createElementNS(NS, "g");
      wrap.setAttribute("transform", k % 2 ? "rotate(" + (k + 1) * deg + ") scale(1 -1)" : "rotate(" + k * deg + ")");
      wrap.appendChild(copy);
      at.parentNode.insertBefore(wrap, at.nextSibling);
      at = wrap;
    }
  }

  function start() { document.querySelectorAll("svg.kaleidoscope").forEach(build); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
