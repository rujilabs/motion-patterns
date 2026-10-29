/*
 * globe-live-dots.js: live visitors on a dot globe. Each place is a dot sized by how many people
 * are there right now, and it sends out a ring now and then; busy places ring more often.
 *
 *   <canvas class="globe-live" data-lon="108" data-lat="6" aria-label="..."></canvas>
 *   canvas.globe.set([{ lon: 101.69, lat: 3.14, count: 84, label: "KL" }, ...]);
 *
 * The dots grow in, one after another, when the globe scrolls into view. Call set() again and
 * every dot eases to its new size (new places grow in, empty ones shrink away).
 * canvas.globe.pause() and .play() stop and start the rings.
 * Land comes from window.GLOBE_LAND ([[lon, lat], ...]) in land.js. Colours come from CSS.
 */
(function () {
  "use strict";
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var LIGHT = norm([-0.5, 0.6, 0.62]);
  var PERIOD = 2400; // one ring cycle, ms

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function vec(lon, lat) { var l = lon * RAD, p = lat * RAD, c = Math.cos(p); return [c * Math.sin(l), Math.sin(p), c * Math.cos(l)]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function rotator(lon0, lat0) {
    var sl = Math.sin(lon0 * RAD), cl = Math.cos(lon0 * RAD), sp = Math.sin(lat0 * RAD), cp = Math.cos(lat0 * RAD);
    return function (v, o) {
      var x = v[0] * cl - v[2] * sl, z = v[0] * sl + v[2] * cl;
      o[0] = x; o[1] = v[1] * cp - z * sp; o[2] = v[1] * sp + z * cp;
      return o;
    };
  }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  // a fixed phase per place, so the rings do not fire in step and look the same on every run
  function phase(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997; return h / 997; }
  function size(count) { return count > 0 ? 2.6 + Math.sqrt(count) * 0.9 : 0; }

  function setup(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var land = (window.GLOBE_LAND || []).map(function (p) { return vec(p[0], p[1]); });
    var rot = rotator(+canvas.dataset.lon || 0, +canvas.dataset.lat || 0);
    var places = {};           // key -> { v, label, from, to, ph, order }
    var arrive = null, change = null, pulse = null;
    var dims = { w: 0, h: 0 }, colors = {}, lastSig = "", started = false, pending = null;

    function readColors() {
      var cs = getComputedStyle(canvas);
      function c(n, f) { return cs.getPropertyValue(n).trim() || f; }
      colors = {
        ocean: c("--globe-ocean", "#e9ecf1"), land: c("--globe-land", "#8a94a6"), accent: c("--globe-accent", "#2456e6"),
        ink: c("--globe-ink", "#1e2229"), paper: c("--globe-paper", "#ffffff"), shadow: c("--globe-shadow", "rgba(20, 30, 50, .2)"),
        limb: parseFloat(c("--globe-limb", ".16")), glint: parseFloat(c("--globe-glint", ".24")),
        font: c("--globe-font", "600 11px system-ui, sans-serif")
      };
      lastSig = "";
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      dims = { w: r.width, h: r.height };
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastSig = "";
    }
    function clock(duration, id, opts) {
      var a = canvas.animate([{ opacity: 1 }, { opacity: 1 }], Object.assign({ duration: duration, fill: "both" }, opts || {}));
      a.id = id;
      if (a.persist) a.persist();
      return a;
    }
    function p(anim) {
      if (!anim || anim.playState === "idle") return 1;
      var v = anim.effect.getComputedTiming().progress;
      return v == null ? 1 : v;
    }

    function draw(arriveT, changeT, pulseMs) {
      var w = dims.w, h = dims.h;
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      var R = Math.min(w, h * 0.92) * 0.44, cx = w / 2, cy = h * 0.47, o = [0, 0, 0];

      ctx.save();
      ctx.translate(cx, cy + R * 1.06); ctx.scale(1, 0.1);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.85);
      g.addColorStop(0, colors.shadow); g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 0.85, 0, 7); ctx.fill();
      ctx.restore();

      ctx.fillStyle = colors.ocean;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      var s = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, 0, cx - R * 0.12, cy - R * 0.12, R * 1.18);
      s.addColorStop(0, "rgba(255, 255, 255, " + colors.glint + ")");
      s.addColorStop(0.45, "rgba(255, 255, 255, 0)");
      s.addColorStop(0.8, "rgba(0, 0, 0, 0)");
      s.addColorStop(1, "rgba(0, 0, 0, " + colors.limb + ")");
      ctx.fillStyle = s; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

      var dr = Math.max(1.2, R * 0.0135);
      var paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (var i = 0; i < land.length; i++) {
        rot(land[i], o);
        if (o[2] < 0.03) continue;
        var x = cx + o[0] * R, y = cy - o[1] * R, ang = Math.atan2(y - cy, x - cx), rx = dr * Math.max(o[2], 0.3);
        var a = (0.42 + 0.58 * Math.max(0, dot(o, LIGHT))) * Math.min(1, 0.35 + o[2] * 1.6);
        var pa = paths[Math.max(0, Math.min(3, Math.round(a * 4) - 1))];
        pa.moveTo(x + rx * Math.cos(ang), y + rx * Math.sin(ang));
        pa.ellipse(x, y, rx, dr, ang, 0, Math.PI * 2);
      }
      ctx.fillStyle = colors.land;
      for (var k = 0; k < 4; k++) { ctx.globalAlpha = 0.45 + k * 0.18; ctx.fill(paths[k]); }
      ctx.globalAlpha = 1;

      var list = Object.keys(places).map(function (key) { return places[key]; });
      var scale = R / 180;
      // rings first, under every dot
      list.forEach(function (pl) {
        var grow = clamp01((arriveT - pl.order * 70) / 520);
        var r = (size(pl.from) + (size(pl.to) - size(pl.from)) * easeOut(changeT)) * easeOut(grow) * scale;
        rot(pl.v, o);
        pl.screen = o[2] > 0.05 && r > 0.3 ? { x: cx + o[0] * R, y: cy - o[1] * R, r: r, z: o[2] } : null;
        if (!pl.screen || pulseMs == null) return;
        var rings = pl.to >= 40 ? 2 : 1; // a busy place rings twice per cycle
        for (var n = 0; n < rings; n++) {
          var t = ((pulseMs / PERIOD + pl.ph + n / rings) % 1);
          var rr = r + (6 + r * 1.6) * easeOut(t);
          ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.5; ctx.globalAlpha = (1 - t) * 0.7 * grow;
          ctx.beginPath(); ctx.ellipse(pl.screen.x, pl.screen.y, rr, rr * Math.max(0.35, pl.screen.z), Math.atan2(pl.screen.y - cy, pl.screen.x - cx) + Math.PI / 2, 0, 7); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
      list.forEach(function (pl) {
        if (!pl.screen) return;
        ctx.fillStyle = colors.accent; ctx.strokeStyle = colors.paper; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(pl.screen.x, pl.screen.y, pl.screen.r, 0, 7); ctx.fill(); ctx.stroke();
      });
      // labels for the busiest few, so the map names its own hot spots
      ctx.font = colors.font; ctx.textBaseline = "middle"; ctx.lineJoin = "round"; ctx.textAlign = "left";
      var boxes = [];
      list.filter(function (pl) { return pl.screen && pl.label && pl.to > 0; })
        .sort(function (a, b) { return b.to - a.to; }).slice(0, 5)
        .forEach(function (pl) {
          var tx = pl.screen.x + pl.screen.r + 5, ty = pl.screen.y, tw = ctx.measureText(pl.label).width;
          var box = [tx - 2, ty - 8, tx + tw + 2, ty + 8];
          // skip a label that would sit on one already drawn
          if (boxes.some(function (b) { return box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]; })) return;
          boxes.push(box);
          ctx.lineWidth = 3.5; ctx.strokeStyle = colors.ocean; ctx.strokeText(pl.label, tx, ty);
          ctx.fillStyle = colors.ink; ctx.fillText(pl.label, tx, ty);
        });
    }

    function set(data) {
      if (!started) { pending = data; return; }
      var seen = {};
      // freeze where every dot is now, then ease all of them to their new sizes together
      var t = change ? easeOut(p(change)) : 1;
      Object.keys(places).forEach(function (k) { var pl = places[k]; pl.from = pl.from + (pl.to - pl.from) * t; });
      data.forEach(function (d, i) {
        var key = d.label || d.lon + "," + d.lat;
        seen[key] = true;
        var pl = places[key];
        if (!pl) pl = places[key] = { v: vec(d.lon, d.lat), label: d.label || "", from: 0, ph: phase(key), order: i };
        pl.to = Math.max(0, d.count || 0);
      });
      Object.keys(places).forEach(function (k) { if (!seen[k]) places[k].to = 0; });
      if (change) change.cancel();
      change = reduce.matches || !canvas.animate ? null : clock(650, "visitors change", { easing: "linear" });
      if (!change) Object.keys(places).forEach(function (k) { places[k].from = places[k].to; });
      lastSig = "";
    }

    function start() {
      started = true;
      if (!reduce.matches && canvas.animate) {
        arrive = clock(1800, "dots arrive", { easing: "linear" });
        pulse = clock(PERIOD, "rings", { iterations: Infinity, easing: "linear", fill: "none" });
      }
      if (pending) {
        var d = pending; pending = null;
        set(d);
        if (change) { change.cancel(); change = null; }
        Object.keys(places).forEach(function (k) { places[k].from = places[k].to; });
      }
    }

    function frame() {
      var aT = arrive ? p(arrive) * 1800 : 1e9, cT = change ? p(change) : 1;
      var pm = null;
      if (pulse && pulse.playState !== "idle" && pulse.currentTime != null) pm = pulse.currentTime % PERIOD;
      var sig = (aT | 0) + "," + cT.toFixed(4) + "," + (pm == null ? "-" : pm | 0) + "," + dims.w + "," + Object.keys(places).length;
      if (sig !== lastSig) { lastSig = sig; draw(aT, cT, pm); }
      requestAnimationFrame(frame);
    }

    readColors();
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
    if (document.fonts) document.fonts.ready.then(function () { lastSig = ""; });
    canvas.globe = {
      set: set,
      pause: function () { if (pulse) pulse.pause(); },
      play: function () { if (pulse) pulse.play(); },
      running: function () { return !!pulse && pulse.playState === "running"; }
    };
    if (reduce.matches || !("IntersectionObserver" in window)) start();
    else {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); start(); } }, { threshold: 0.3 });
      io.observe(canvas);
    }
    canvas.classList.add("is-ready");
    requestAnimationFrame(frame);
  }

  function init() { document.querySelectorAll("canvas.globe-live").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
