/*
 * data-candles.js: a live candlestick chart. Give it OHLC candles, oldest first; the last one may still
 * be forming. Call update() again on every price tick:
 *
 *   var chart = DataCandles(document.getElementById("chart"));
 *   chart.update([{ t: "10:29", o: 541.2, h: 541.42, l: 541.08, c: 541.31 }, ...]);
 *
 * A candle with a new `t` slides the whole strip one step left and enters at the right edge. The same
 * `t` with new prices stretches that candle's body and wick to them. The price scale only changes
 * when the candles outgrow it or use less than half of it, and then every candle eases to the new
 * scale together. Options as data attributes: data-visible (candles shown, 30), data-decimals (2).
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var css = getComputedStyle(document.documentElement);
  var EASE = css.getPropertyValue("--ease-out").trim() || "ease-out";
  var TICK = 220, SHIFT = 380, RESCALE = 420;
  var STEPS = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100];

  function node(cls, parent, tag) {
    var n = document.createElement(tag || "div");
    n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }

  // Move an element to a transform. A move already running starts from where it is now, not from its end.
  function move(el, to, dur, instant) {
    if (el._to === to) return;
    var from = el._anim ? getComputedStyle(el).transform : el._to;
    if (el._anim) el._anim.cancel();
    el.style.transform = to;
    el._to = to;
    el._anim = null;
    if (instant || reduce.matches || !from || !el.animate) return;
    var a = el._anim = el.animate([{ transform: from }, { transform: to }], { duration: dur, easing: EASE });
    a.onfinish = function () { if (el._anim === a) el._anim = null; };
  }

  function DataCandles(el) {
    var visible = +(el.dataset.visible || 30);
    var dec = +(el.dataset.decimals || 2);
    var fmt = function (v) { return v.toFixed(dec); };

    el.textContent = "";
    el.classList.add("candles");
    var plot = node("cd-plot", el);
    var grid = node("cd-grid", plot);
    var track = node("cd-track", plot);
    var last = node("cd-last", plot);
    var tag = node("cd-tag num", last, "span");
    var table = node("", node("cd-table", el), "table");
    table.innerHTML = "<caption></caption><thead><tr><th scope=\"col\">Time</th><th scope=\"col\">Open</th><th scope=\"col\">High</th><th scope=\"col\">Low</th><th scope=\"col\">Close</th></tr></thead><tbody></tbody>";

    var W = 0, H = 0, gutter = 0, step = 0;
    var lo = 0, hi = 1, gridStep = 1;
    var shown = {}; // t -> element
    var data = [];
    var lines = {};
    var lastClosed = null;

    function measure() {
      W = plot.clientWidth;
      var cs = getComputedStyle(el);
      gutter = parseFloat(cs.getPropertyValue("--cd-gutter")) || 58;
      H = plot.clientHeight - (parseFloat(cs.getPropertyValue("--cd-axis")) || 22);
      step = (W - gutter) / visible;
      el.style.setProperty("--cd-body", Math.max(2, Math.round(step * 0.62)) + "px");
    }
    function y(p) { return (hi - p) / (hi - lo) * H; }

    // Keep the scale unless the candles leave it or shrink to under half of it, so it does not twitch.
    function scale(view) {
      var min = Infinity, max = -Infinity;
      view.forEach(function (c) { if (c.l < min) min = c.l; if (c.h > max) max = c.h; });
      var span = Math.max(max - min, Math.pow(10, -dec) * 10);
      var margin = span * 0.08;
      if (min - margin >= lo && max + margin <= hi && span > (hi - lo) * 0.5) return false;
      var pad = span * 0.22;
      lo = min - pad; hi = max + pad;
      var target = (hi - lo) / 5;
      gridStep = STEPS.filter(function (s) { return s >= target; })[0] || STEPS[STEPS.length - 1];
      return true;
    }

    function drawGrid(instant) {
      var keep = {};
      var first = Math.ceil(lo / gridStep) * gridStep;
      for (var v = first; v <= hi; v += gridStep) {
        var key = v.toFixed(4);
        keep[key] = true;
        var line = lines[key];
        var at = "translateY(" + y(v).toFixed(1) + "px)";
        if (!line) {
          line = lines[key] = node("cd-line", grid);
          node("cd-price num", line, "span").textContent = fmt(v);
          move(line, at, 0, true);
          if (!instant && !reduce.matches && line.animate) line.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RESCALE, easing: EASE });
        } else move(line, at, RESCALE, instant);
      }
      Object.keys(lines).forEach(function (k) {
        if (keep[k]) return;
        var gone = lines[k];
        delete lines[k];
        var v = +k;
        if (instant || reduce.matches || !gone.animate) { gone.remove(); return; }
        // a line leaving the scale rides it out of the plot as it fades
        move(gone, "translateY(" + y(v).toFixed(1) + "px)", RESCALE);
        gone.animate([{ opacity: 1 }, { opacity: 0 }], { duration: RESCALE, easing: EASE, fill: "forwards" }).onfinish = function () { gone.remove(); };
      });
    }

    function candle(c) {
      var n = node("cd-candle", track);
      n.wick = node("cd-wick", n);
      n.body = node("cd-body", n);
      if (c.label) node("cd-time num", n, "span").textContent = c.label;
      return n;
    }

    function place(n, c, i, opts) {
      var up = c.c >= c.o;
      n.classList.toggle("is-up", up);
      n.classList.toggle("is-down", !up);
      var top = y(Math.max(c.o, c.c)), bot = y(Math.min(c.o, c.c));
      var dur = opts.rescaled ? RESCALE : TICK;
      move(n, "translateX(" + (i * step).toFixed(1) + "px)", SHIFT, opts.instant);
      move(n.body, "translateY(" + top.toFixed(1) + "px) scaleY(" + Math.max(1, bot - top).toFixed(1) + ")", dur, opts.instant);
      move(n.wick, "translateY(" + y(c.h).toFixed(1) + "px) scaleY(" + Math.max(1, y(c.l) - y(c.h)).toFixed(1) + ")", dur, opts.instant);
    }

    function writeTable(view) {
      var closed = view.slice(-6, -1).reverse();
      table.querySelector("caption").textContent = (el.getAttribute("aria-label") || "Candles") + ", the last " + closed.length + " closed";
      var body = table.querySelector("tbody");
      body.textContent = "";
      closed.forEach(function (c) {
        var tr = node("", body, "tr");
        var th = node("", tr, "th");
        th.scope = "row";
        th.textContent = c.t;
        [c.o, c.h, c.l, c.c].forEach(function (v) { node("", tr, "td").textContent = fmt(v); });
      });
    }

    function update(candles, options) {
      var opts = options || {};
      data = candles;
      if (!W) measure();
      var view = candles.slice(-visible);
      var offset = visible - view.length; // fewer candles than slots: pack them to the right
      var rescaled = scale(view);
      var instant = !!opts.instant;
      drawGrid(instant);
      var keep = {};
      view.forEach(function (c, k) {
        var i = k + offset;
        keep[c.t] = true;
        var n = shown[c.t];
        if (!n) {
          n = shown[c.t] = candle(c);
          // a new candle rides in with the strip from one step to the right, starting as a flat line at its open
          if (!instant && !reduce.matches) {
            move(n, "translateX(" + ((i + 1) * step).toFixed(1) + "px)", 0, true);
            var flat = "translateY(" + y(c.o).toFixed(1) + "px) scaleY(1)";
            move(n.body, flat, 0, true);
            move(n.wick, flat, 0, true);
          }
        }
        place(n, c, i, { instant: instant, rescaled: rescaled });
      });
      Object.keys(shown).forEach(function (t) {
        if (keep[t]) return;
        var gone = shown[t];
        delete shown[t];
        if (instant || reduce.matches || !gone.animate) { gone.remove(); return; }
        move(gone, "translateX(" + (-step).toFixed(1) + "px)", SHIFT);
        gone._anim.onfinish = function () { gone.remove(); };
      });

      var now = view[view.length - 1];
      if (now) {
        last.classList.toggle("is-up", now.c >= now.o);
        last.classList.toggle("is-down", now.c < now.o);
        tag.textContent = fmt(now.c);
        move(last, "translateY(" + y(now.c).toFixed(1) + "px)", rescaled ? RESCALE : TICK, instant);
      }
      // the readable copy changes when a candle closes, not on every tick
      var closed = view.length > 1 ? view[view.length - 2] : null;
      if (closed && closed !== lastClosed) { lastClosed = closed; writeTable(view); }
    }

    function relayout() {
      if (!data.length) return;
      W = 0;
      measure();
      lo = 0; hi = 0;
      update(data, { instant: true });
    }
    if ("ResizeObserver" in window) {
      var seen = false;
      new ResizeObserver(function () { if (seen) relayout(); seen = true; }).observe(plot);
    }

    var api = { update: update, relayout: relayout };
    el.candles = api;
    return api;
  }

  window.DataCandles = DataCandles;
})();
