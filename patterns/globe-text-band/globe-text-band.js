/*
 * globe-text-band.js: a line of text runs on a tilted ring round a turning dot globe.
 *
 *   <canvas class="globe-band" data-text="WE SHIP WORLDWIDE • 41 COUNTRIES •" data-lon="102" data-lat="12"
 *           data-tilt="16" aria-label="..."></canvas>
 *
 * The text is printed on a ribbon: a flat strip that wraps the ball on a tilted ring. The far half
 * of the ribbon passes behind the ball and shows its plain inside, each letter narrows as it turns
 * away, and the ribbon darkens toward its edges where it turns side-on. The text is repeated to fill the ring and spaced
 * so it closes without a gap. The ring winds on when the globe scrolls into view, then the ring
 * and the globe turn (one globe turn a minute). canvas.globe.pause() and .play() stop and start it.
 * Land comes from window.GLOBE_LAND ([[lon, lat], ...]) in land.js. Colours and the band font come from CSS.
 */
(function () {
  "use strict";
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var LIGHT = norm([-0.5, 0.6, 0.62]);
  var CYCLE = 60000; // one loop: the globe turns once, the ring three times the other way

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
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function setup(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var d = canvas.dataset;
    var land = (window.GLOBE_LAND || []).map(function (p) { return vec(p[0], p[1]); });
    var lon0 = +d.lon || 0, lat0 = +d.lat || 0;
    var tilt = (d.tilt ? +d.tilt : 16) * RAD, roll = -7 * RAD;
    var text = (d.text || "WE SHIP WORLDWIDE • ").replace(/\s+$/, "") + " ";
    var wind = null, loop = null;
    var dims = { w: 0, h: 0 }, colors = {}, lastSig = "", glyphs = null;

    function readColors() {
      var cs = getComputedStyle(canvas);
      function c(n, f) { return cs.getPropertyValue(n).trim() || f; }
      colors = {
        ocean: c("--globe-ocean", "#2b2118"), land: c("--globe-land", "#f3e3c3"), band: c("--globe-band", "#2b2118"),
        ribbon: c("--globe-ribbon", "#fbf1dc"), inside: c("--globe-ribbon-inside", "#c9b48d"),
        shadow: c("--globe-shadow", "rgba(40, 25, 5, .3)"), limb: parseFloat(c("--globe-limb", ".3")),
        glint: parseFloat(c("--globe-glint", ".14")), font: c("--globe-band-font", "800 16px system-ui, sans-serif")
      };
      glyphs = null; lastSig = "";
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      dims = { w: r.width, h: r.height, dpr: dpr };
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      glyphs = null; lastSig = "";
    }

    // Lay the letters round the ring: measure the line, repeat it to fill the circumference, then
    // stretch the spacing a touch so the last letter meets the first.
    function layout(rr, px) {
      ctx.font = colors.font.replace(/\d+(\.\d+)?px/, px.toFixed(2) + "px");
      var one = ctx.measureText(text).width, circ = 2 * Math.PI * rr;
      var reps = Math.max(1, Math.round(circ / one)), k = circ / (one * reps), out = [];
      // start half the first phrase to the left, so at rest the first phrase sits centred on the front
      var cut = text.search(/\s*[\u2022\u00b7|]/), first = ctx.measureText(cut > 0 ? text.slice(0, cut) : text.trim()).width;
      var at = -first * k / 2;
      for (var r = 0; r < reps; r++) {
        for (var i = 0; i < text.length; i++) {
          var w = ctx.measureText(text[i]).width;
          out.push({ ch: text[i], a: at / rr, w: w });
          at += w * k;
        }
      }
      return { list: out, font: ctx.font, px: px };
    }

    // The ring's own frame, tilted toward the viewer and rolled a little: a point at angle a, the
    // direction the text runs there, and the ring's up.
    function frameAt(a) {
      var sa = Math.sin(a), ca = Math.cos(a);
      return { p: tiltv([sa, 0, ca]), t: tiltv([ca, 0, -sa]) };
    }
    function tiltv(v) {
      var ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(roll), sr = Math.sin(roll);
      var y = v[1] * ct - v[2] * st, z = v[1] * st + v[2] * ct, x = v[0];
      return [x * cr - y * sr, x * sr + y * cr, z];
    }
    var UP = tiltv([0, 1, 0]);

    function draw(windT, loopT) {
      var w = dims.w, h = dims.h, dpr = dims.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      var R = Math.min(w, h) * 0.33, cx = w / 2, cy = h * 0.48, rr = 1.32;
      var px = Math.max(10, R * 0.15);
      if (!glyphs || glyphs.px !== px) glyphs = layout(rr * R, px);
      var spin = loopT * 2 * Math.PI * 3; // the ring: three turns per cycle
      var rot = rotator(lon0 - loopT * 360, lat0), o = [0, 0, 0];
      var wound = easeOut(windT) * 2 * Math.PI; // how much of the ribbon has wound on, as an angle

      var hh = (px * 0.78) / R; // half the ribbon's height, in globe radii
      // The ribbon in short flat panels. front: the near half (outside showing), else the far half (inside showing).
      function ribbon(front) {
        var n = 120, da = (2 * Math.PI) / n;
        for (var i = 0; i < n; i++) {
          if (i * da > wound) break;
          var a0 = i * da - spin, a1 = a0 + Math.min(da * 1.04, wound - i * da + 0.001), mid = frameAt(a0 + da / 2);
          if ((mid.p[2] >= 0) !== front) continue;
          var p0 = frameAt(a0).p, p1 = frameAt(a1).p;
          ctx.beginPath();
          corner(p0, hh, true); corner(p1, hh, false); corner(p1, -hh, false); corner(p0, -hh, false);
          ctx.closePath();
          ctx.fillStyle = front ? colors.ribbon : colors.inside; ctx.fill();
          // side-on panels catch less light
          var side = 1 - Math.abs(mid.p[2]);
          if (side > 0.05) { ctx.fillStyle = "rgba(0, 0, 0, " + (side * side * 0.28).toFixed(3) + ")"; ctx.fill(); }
        }
      }
      function corner(p, off, first) {
        var x = cx + (p[0] * rr + UP[0] * off) * R, y = cy - (p[1] * rr + UP[1] * off) * R;
        if (first) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      function letters() {
        ctx.font = glyphs.font; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.fillStyle = colors.band;
        for (var i = 0; i < glyphs.list.length; i++) {
          var g = glyphs.list[i];
          if (g.ch === " ") continue;
          var fade = Math.max(0, Math.min(1, (wound - (g.a - glyphs.list[0].a)) / 0.25));
          if (fade <= 0) continue;
          var a = g.a - spin, f = frameAt(a), mid = frameAt(a + (g.w / 2) / (rr * R));
          if (mid.p[2] < 0.02) continue; // printed on the outside: hidden once the ribbon turns away
          // a flat letter on the ribbon: orthographic projection is affine, so one transform places it
          var x = cx + f.p[0] * rr * R, y = cy - f.p[1] * rr * R;
          ctx.setTransform(f.t[0] * dpr, -f.t[1] * dpr, -UP[0] * dpr, UP[1] * dpr, x * dpr, y * dpr);
          ctx.globalAlpha = fade;
          ctx.fillText(g.ch, 0, 1);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = 1;
      }

      // contact shadow
      ctx.save();
      ctx.translate(cx, cy + R * 1.5); ctx.scale(1, 0.12);
      var sg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.1);
      sg.addColorStop(0, colors.shadow); sg.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, R * 1.1, 0, 7); ctx.fill();
      ctx.restore();

      ribbon(false); // the far side of the ribbon, behind the ball

      ctx.fillStyle = colors.ocean;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      var s = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, 0, cx - R * 0.12, cy - R * 0.12, R * 1.18);
      s.addColorStop(0, "rgba(255, 255, 255, " + colors.glint + ")");
      s.addColorStop(0.45, "rgba(255, 255, 255, 0)");
      s.addColorStop(0.8, "rgba(0, 0, 0, 0)");
      s.addColorStop(1, "rgba(0, 0, 0, " + colors.limb + ")");
      ctx.fillStyle = s; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

      var dr = Math.max(1.1, R * 0.016);
      var paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (var i = 0; i < land.length; i++) {
        rot(land[i], o);
        if (o[2] < 0.03) continue;
        var lx = cx + o[0] * R, ly = cy - o[1] * R, ang = Math.atan2(ly - cy, lx - cx), rx = dr * Math.max(o[2], 0.3);
        var al = (0.42 + 0.58 * Math.max(0, dot(o, LIGHT))) * Math.min(1, 0.35 + o[2] * 1.6);
        var pa = paths[Math.max(0, Math.min(3, Math.round(al * 4) - 1))];
        pa.moveTo(lx + rx * Math.cos(ang), ly + rx * Math.sin(ang));
        pa.ellipse(lx, ly, rx, dr, ang, 0, Math.PI * 2);
      }
      ctx.fillStyle = colors.land;
      for (var k = 0; k < 4; k++) { ctx.globalAlpha = 0.35 + k * 0.21; ctx.fill(paths[k]); }
      ctx.globalAlpha = 1;

      ribbon(true); // the near side, over the ball
      letters();
    }

    function frame() {
      var wT = wind ? (wind.effect.getComputedTiming().progress) : null;
      if (wT == null) wT = wind ? 0 : 1;
      var lT = 0;
      if (loop && loop.playState !== "idle" && loop.currentTime != null) lT = (loop.currentTime % CYCLE) / CYCLE;
      else if (loop) lT = loop.lastT || 0;
      if (loop) loop.lastT = lT;
      var sig = wT.toFixed(4) + "," + lT.toFixed(5) + "," + dims.w + "," + (glyphs ? 1 : 0);
      if (sig !== lastSig) { lastSig = sig; draw(wT, lT); }
      requestAnimationFrame(frame);
    }

    function start() {
      if (reduce.matches || !canvas.animate) return;
      var still = [{ opacity: 1 }, { opacity: 1 }];
      wind = canvas.animate(still, { duration: 1600, easing: "linear", fill: "both" });
      wind.id = "band winds on";
      // the turn: a linear clock that never ends; the ring and the globe read their angles off it
      loop = canvas.animate(still, { duration: CYCLE, iterations: Infinity, easing: "linear" });
      loop.id = "turn";
      if (wind.persist) wind.persist();
    }

    readColors();
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
    // measure the band only once its font is in, or the spacing is set for the fallback face
    if (document.fonts) {
      document.fonts.load(colors.font).then(function () { glyphs = null; lastSig = ""; }, function () {});
      document.fonts.ready.then(function () { glyphs = null; lastSig = ""; });
    }
    canvas.globe = {
      pause: function () { if (loop) loop.pause(); },
      play: function () { if (loop) loop.play(); },
      running: function () { return !!loop && loop.playState === "running"; }
    };
    if (reduce.matches || !("IntersectionObserver" in window)) start();
    else {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); start(); } }, { threshold: 0.3 });
      io.observe(canvas);
    }
    canvas.classList.add("is-ready");
    requestAnimationFrame(frame);
  }

  function init() { document.querySelectorAll("canvas.globe-band").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
