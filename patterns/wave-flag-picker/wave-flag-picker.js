/*
 * wave-flag-picker.js: a country and language picker where the chosen flag waves and the rest hang still.
 *   <ul class="flag-picker" role="listbox" aria-label="Country site">
 *     <li role="option" aria-selected="true">
 *       <span class="fp-flag"><svg viewBox="0 0 28 14" aria-hidden="true">...the flag...</svg></span>
 *       <span class="fp-name">Bahasa Melayu</span>
 *     </li>
 *     ...
 *   </ul>
 * The chosen flag is cut into thin vertical strips, each showing its slice of the same SVG. A wave runs
 * from the pole to the free end: each strip moves by A(x) sin(kx - wt), where the height A grows from
 * nothing at the pole to its most at the fly end, is tilted to the local slope (skewY), so the strips meet
 * without steps, and is lit by that slope, lighter where the cloth faces up and darker where it turns
 * away. Every strip is one Web Animation of one wave period, looped, so it runs off the main thread
 * and the gallery timeline can read it. A newly chosen flag catches the wind over two waves; the one
 * it replaces loses it over 1.4 s and hangs flat again.
 * el.flagPicker.pause() and .play() still the wind. "change" fires with detail.option.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 1150;     // ms for one wave to pass
  var SAMPLES = 12;      // keyframes per period
  var SETTLE = 1400;     // ms for a flag to fall still

  // the cloth at one strip and one moment: lift, tilt and light
  function cloth(x, W, H, t, env) {
    var k = 2 * Math.PI / (W * 0.92), w = 2 * Math.PI / (PERIOD / 1000), u = x / W;
    var A = H * 0.1 * Math.pow(u, 0.85) * env, dA = H * 0.1 * 0.85 * Math.pow(Math.max(u, 0.001), -0.15) / W * env;
    var ph = k * x - w * t;
    var y = A * Math.sin(ph), slope = A * k * Math.cos(ph) + dA * Math.sin(ph);
    var light = Math.max(-1, Math.min(1, -slope * 2.4));
    return { y: y, a: Math.atan(slope) * 180 / Math.PI, light: light };
  }
  function frame(c) {
    var shade = c.light >= 0 ? "rgb(255 255 255 / " + (c.light * 0.3).toFixed(3) + ")" : "rgb(0 0 0 / " + (-c.light * 0.34).toFixed(3) + ")";
    return { t: "translateY(" + c.y.toFixed(2) + "px) skewY(" + c.a.toFixed(2) + "deg)", s: shade };
  }

  function setup(list) {
    if (list.flagPicker) return;
    var options = [].slice.call(list.querySelectorAll('[role="option"]'));
    var paused = false, flying = null;

    function Flag(opt) {
      var box = opt.querySelector(".fp-flag"), svg = box.querySelector("svg");
      var W = box.clientWidth, H = box.clientHeight, n = Math.max(14, Math.round(W / 3)), sw = W / n;
      var wrap = document.createElement("span"), strips = [];
      wrap.className = "fp-strips";
      wrap.setAttribute("aria-hidden", "true");
      for (var i = 0; i < n; i++) {
        var s = document.createElement("span"), copy = svg.cloneNode(true), shade = document.createElement("span");
        s.className = "fp-strip";
        s.style.left = (i * sw).toFixed(2) + "px";
        s.style.width = (sw + 0.6).toFixed(2) + "px";      // a hair of overlap, so no seam shows between strips
        copy.style.left = (-i * sw).toFixed(2) + "px";
        copy.style.width = W + "px"; copy.style.height = H + "px";
        shade.className = "fp-shade";
        s.appendChild(copy); s.appendChild(shade);
        wrap.appendChild(s);
        strips.push({ el: s, shade: shade, x: (i + 0.5) * sw });
      }
      box.appendChild(wrap);
      box.classList.add("is-waving");
      var anims = [], self = this;
      this.opt = opt;
      this.box = box;

      function track(t0, ms, envOf) {
        var steps = Math.max(2, Math.round(ms / PERIOD * SAMPLES));
        return strips.map(function (s) {
          var tf = [], sh = [];
          for (var j = 0; j <= steps; j++) {
            var f = frame(cloth(s.x, W, H, (t0 + ms * j / steps) / 1000, envOf(j / steps)));
            tf.push({ transform: f.t }); sh.push({ backgroundColor: f.s });
          }
          return [tf, sh];
        });
      }
      function run(frames, opts) {
        frames.forEach(function (fs, i) {
          anims.push(strips[i].el.animate(fs[0], opts), strips[i].shade.animate(fs[1], opts));
        });
      }
      function still() {
        var f = strips.map(function (s) { return frame(cloth(s.x, W, H, 0.32, 0.55)); });
        strips.forEach(function (s, i) { s.el.style.transform = f[i].t; s.shade.style.backgroundColor = f[i].s; });
      }
      this.start = function () {
        if (reduce.matches || paused) { still(); return; }
        // two waves to catch the wind, then the same wave on a loop
        run(track(0, 2 * PERIOD, function (p) { return p * p * (3 - 2 * p); }), { duration: 2 * PERIOD, easing: "linear" });
        run(track(0, PERIOD, function () { return 1; }), { duration: PERIOD, delay: 2 * PERIOD, iterations: Infinity, easing: "linear", fill: "none" });
        anims[0].id = "flag catches the wind";
        anims[strips.length * 2].id = "flag waves";
      };
      this.animated = function () { return anims.length > 0; };
      this.pause = function () { anims.forEach(function (a) { a.pause(); }); };
      this.play = function () { anims.forEach(function (a) { if (a.playState === "paused") a.play(); }); };
      this.stop = function (done) {
        if (reduce.matches || paused || !anims.length) { remove(); return; }
        // where the cloth is now, then the same wave dying away from there
        var a0 = anims[0], loop = anims[strips.length * 2];
        var t = loop.currentTime != null && loop.currentTime >= 2 * PERIOD ? loop.currentTime - 2 * PERIOD : null;
        var env0 = 1;
        if (t === null) { var c = Math.min(1, (a0.currentTime || 0) / (2 * PERIOD)); env0 = c * c * (3 - 2 * c); t = a0.currentTime || 0; }
        t = t % PERIOD;
        anims.forEach(function (a) { a.cancel(); });
        anims = [];
        run(track(t, SETTLE, function (p) { return env0 * (1 - p) * (1 - p); }), { duration: SETTLE, easing: "linear", fill: "forwards" });
        anims[0].id = "flag falls still";
        anims[0].finished.then(remove, function () {});
      };
      function remove() {
        anims.forEach(function (a) { a.cancel(); });
        anims = [];
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        box.classList.remove("is-waving");
        self.dead = true;
      }
      this.remove = remove;
    }

    var falling = [];
    function choose(opt, focus) {
      if (focus) opt.focus();
      if (opt.getAttribute("aria-selected") === "true" && flying) return;
      options.forEach(function (o) {
        var on = o === opt;
        o.setAttribute("aria-selected", on ? "true" : "false");
        o.tabIndex = on ? 0 : -1;
      });
      if (flying) { falling.push(flying); flying.stop(); }
      // a flag still falling from a moment ago is swapped out at once
      falling = falling.filter(function (g) { if (g.opt === opt) g.remove(); return !g.dead; });
      flying = new Flag(opt);
      flying.start();
      list.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { option: opt } }));
    }

    options.forEach(function (o, i) {
      o.tabIndex = o.getAttribute("aria-selected") === "true" ? 0 : -1;
      o.addEventListener("click", function () { choose(o, true); });
    });
    list.addEventListener("keydown", function (e) {
      var i = options.indexOf(document.activeElement), k = e.key, j = i;
      if (i < 0) return;
      if (k === "ArrowRight" || k === "ArrowDown") j = Math.min(options.length - 1, i + 1);
      else if (k === "ArrowLeft" || k === "ArrowUp") j = Math.max(0, i - 1);
      else if (k === "Home") j = 0;
      else if (k === "End") j = options.length - 1;
      else if (k === "Enter" || k === " ") j = i;
      else return;
      e.preventDefault();
      choose(options[j], true);
    });

    list.flagPicker = {
      pause: function () { paused = true; if (flying) flying.pause(); falling.forEach(function (f) { f.pause(); }); },
      play: function () {
        paused = false;
        falling.forEach(function (f) { f.play(); });
        if (!flying) return;
        if (flying.animated()) flying.play();
        else { var o = flying.opt; flying.remove(); flying = new Flag(o); flying.start(); }   // it was hanging still: give it wind
      },
      select: function (i) { choose(options[i], false); }
    };
    var first = options.filter(function (o) { return o.getAttribute("aria-selected") === "true"; })[0] || options[0];
    if (first.tabIndex !== 0) first.tabIndex = 0;
    list.classList.add("is-ready");
    // the chosen flag starts to wave when the picker scrolls into view
    function begin() { flying = new Flag(first); flying.start(); }
    if (reduce.matches || !("IntersectionObserver" in window)) begin();
    else {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); if (!flying) begin(); } }, { threshold: 0.3 });
      io.observe(list);
    }
  }

  function init() { document.querySelectorAll(".flag-picker").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
