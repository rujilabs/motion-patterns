/*
 * drum-word-rotator.js: turns <span class="prism" data-words="cafes|clinics|tuition centres">cafes</span>
 * into a row of three-sided prisms, like a roadside tri-vision sign. Every few seconds each slat turns
 * 120 degrees, one after another from the left, and the next word comes round. A face's shade follows
 * the cosine of its angle as it turns, so the slats read as solid. Played with element.animate().
 *
 * data-words    the words, separated by |. The first is the one in the markup
 * data-slats    how many slats, default 9
 * data-every    milliseconds between turns, default 2800
 *
 * It starts when it scrolls into view and stops when it leaves. prism.pause(true | false) holds it;
 * "turn" fires with detail.index and detail.word as each new word starts to come round.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RAD = Math.PI / 180;
  var css = getComputedStyle(document.documentElement);
  var EASE = css.getPropertyValue("--ease-inout").trim() || "ease-in-out"; // a motor: starts, runs, stops
  var DUR = parseFloat(css.getPropertyValue("--dur-slow")) || 900;
  var STAGGER = 45;

  // 13 samples of the shade along the turn. The animation's easing is applied to its progress, so the
  // samples, spaced evenly in progress, stay locked to the angle the slat is at.
  function shadeFrames(from, to) {
    var out = [];
    for (var j = 0; j <= 12; j++) {
      var a = from + (to - from) * j / 12;
      out.push({ opacity: Math.min(1, Math.max(0, 1 - Math.cos(a * RAD))) * 0.62 });
    }
    return out;
  }

  function Prism(el) {
    var words = (el.getAttribute("data-words") || el.textContent).split("|").map(function (w) { return w.trim(); });
    var count = Math.max(2, parseInt(el.getAttribute("data-slats"), 10) || 9);
    var every = parseInt(el.getAttribute("data-every"), 10) || 2800;

    // measure the widest word in the prism's own font
    var probe = document.createElement("span");
    probe.className = "prism-probe";
    el.appendChild(probe);
    var W = 0;
    words.forEach(function (w) { probe.textContent = w; W = Math.max(W, probe.getBoundingClientRect().width); });
    var H = probe.getBoundingClientRect().height;
    el.removeChild(probe);
    W = Math.ceil(W + H * 0.3); // a little air after the longest word
    var sw = W / count, r = H / (2 * Math.tan(60 * RAD)); // a triangle's inradius: faces of height H meet

    el.textContent = "";
    el.style.width = W + "px";
    el.style.height = H + "px";
    var slats = [];
    for (var i = 0; i < count; i++) {
      var slat = document.createElement("span");
      slat.className = "prism-slat";
      slat.style.left = (i * sw).toFixed(2) + "px";
      slat.style.width = (sw + 0.6).toFixed(2) + "px"; // overlap a hair so no seam shows between slats
      var body = document.createElement("span");
      body.className = "prism-body";
      body.style.transform = "translateZ(" + (-r).toFixed(2) + "px) rotateX(0deg)";
      var faces = [];
      for (var f = 0; f < 3; f++) {
        var face = document.createElement("span");
        face.className = "prism-face";
        face.style.transform = "rotateX(" + (-f * 120) + "deg) translateZ(" + r.toFixed(2) + "px)";
        var text = document.createElement("span");
        text.className = "prism-text";
        text.style.left = (-i * sw).toFixed(2) + "px";
        text.appendChild(document.createTextNode(f === 0 ? words[0] : ""));
        var shade = document.createElement("span");
        shade.className = "prism-shade";
        shade.style.opacity = f === 0 ? 0 : 1;
        text.appendChild(shade);
        face.appendChild(text);
        body.appendChild(face);
        faces.push({ text: text, shade: shade });
      }
      slat.appendChild(body);
      el.appendChild(slat);
      slats.push({ body: body, faces: faces });
    }
    // at rest one flat copy shows instead of the slats: crisp text, and no seams between slats
    var flat = document.createElement("span");
    flat.className = "prism-flat";
    flat.textContent = words[0];
    el.appendChild(flat);
    el.classList.add("is-ready");

    var step = 0, wordIndex = 0, timer = 0, paused = false, inView = false, first = true;
    // the faces repeat every 3 turns and the words every n: track the two counters apart
    function schedule() {
      clearTimeout(timer); timer = 0;
      if (!paused && inView && !document.hidden && !reduce.matches) timer = setTimeout(turn, first ? Math.min(every, 1200) : every);
    }
    function turn() {
      first = false;
      var next = step + 1, nextWord = (wordIndex + 1) % words.length;
      var inFace = next % 3, outFace = step, word = words[nextWord];
      el.dispatchEvent(new CustomEvent("turn", { detail: { index: nextWord, word: word } }));
      var z = "translateZ(" + (-r).toFixed(2) + "px) ";
      var from = step * 120, to = next * 120;
      el.classList.add("is-turning");
      slats.forEach(function (s, i) {
        s.faces[inFace].text.firstChild.nodeValue = word; // this face is round the back: nobody sees it change
        var o = { duration: DUR, delay: i * STAGGER, easing: EASE, fill: "both" };
        var a = s.body.animate([{ transform: z + "rotateX(" + from + "deg)" }, { transform: z + "rotateX(" + to + "deg)" }], o);
        var sOut = s.faces[outFace].shade.animate(shadeFrames(0, -120), o);
        var sIn = s.faces[inFace].shade.animate(shadeFrames(120, 0), o);
        a.onfinish = function () {
          s.body.style.transform = z + "rotateX(" + (to % 360) + "deg)";
          s.faces[outFace].shade.style.opacity = 1;
          s.faces[inFace].shade.style.opacity = 0;
          a.cancel(); sOut.cancel(); sIn.cancel();
          if (i === count - 1) { flat.textContent = word; el.classList.remove("is-turning"); }
        };
      });
      step = next % 3;
      wordIndex = nextWord;
      schedule();
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.6 }).observe(el);
    } else { inView = true; schedule(); }
    document.addEventListener("visibilitychange", schedule);

    el.pause = function (on) { paused = !!on; schedule(); };
  }

  function init() {
    var els = document.querySelectorAll(".prism[data-words]");
    // build after the web fonts load, so the slats are cut to the real word widths
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { els.forEach(Prism); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
