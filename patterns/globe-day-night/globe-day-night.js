/*
 * globe-day-night.js: a dot globe lit by the real sun for a given date and time, with the
 * day and night line (the terminator) where it really falls.
 *
 *   <canvas class="globe-daynight" data-date="2026-06-22" data-utc="8" data-lon="60" data-lat="12"
 *           data-places="#cities" aria-label="..."></canvas>
 *   <ul id="cities"><li data-place="101.69 3.14">Kuala Lumpur</li></ul>
 *
 * data-utc is the time in hours UTC (decimals are fine). Change it and the line moves.
 * canvas.globe.play() sweeps a whole day in about nine seconds, canvas.globe.pause() stops it, and
 * every change fires a "globe:time" event with detail.utc. Each [data-place] gets the class
 * "is-night" when the sun is down there. Drag, flick or arrow-key the globe to turn it.
 * Land comes from window.GLOBE_LAND ([[lon, lat], ...]) in land.js. Colours come from CSS.
 */
(function () {
  "use strict";
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TWILIGHT = Math.sin(-6 * RAD); // civil twilight ends when the sun is 6 degrees below the horizon

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
  function wrap(lon) { return ((lon + 540) % 360) - 180; }
  function clampLat(lat) { return Math.max(-70, Math.min(70, lat)); }
  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // Where the sun is overhead: declination from the day of the year, longitude from the clock,
  // corrected by the equation of time (the sun runs up to 16 minutes ahead of or behind the clock).
  function subsolar(dateStr, utc) {
    var d = new Date(dateStr + "T00:00:00Z");
    var day = Math.round((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5) + 1;
    var b = (360 / 365) * (day - 81) * RAD;
    var decl = 23.44 * Math.sin(b);
    var eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
    return [wrap(-15 * (utc - 12 + eot / 60)), decl];
  }

  function setup(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var d = canvas.dataset;
    var land = (window.GLOBE_LAND || []).map(function (p) { return vec(p[0], p[1]); });
    var places = Array.prototype.map.call(document.querySelectorAll((d.places || "#none") + " [data-place]"), function (el) {
      var p = el.dataset.place.trim().split(/\s+/);
      return { el: el, v: vec(+p[0], +p[1]), label: p.slice(2).join(" ") };
    });
    var home = [+d.lon || 0, +d.lat || 0], center = home.slice();
    var utc = +d.utc || 0, sweep = null, sweepFrom = 0, turn = null;
    var vel = [0, 0], drag = null, size = { w: 0, h: 0 }, colors = {}, lastSig = "";
    var shade = document.createElement("canvas"), sctx = shade.getContext("2d");

    function readColors() {
      var cs = getComputedStyle(canvas);
      function c(n, f) { return cs.getPropertyValue(n).trim() || f; }
      colors = {
        ocean: c("--globe-ocean", "#dfe8ec"), land: c("--globe-land", "#3a5a52"), night: c("--globe-night", "#0f1d33"),
        nightLand: c("--globe-night-land", "#8fa4c4"), sun: c("--globe-sun", "#f2a516"), ink: c("--globe-ink", "#1e2229"),
        paper: c("--globe-paper", "#ffffff"), shadow: c("--globe-shadow", "rgba(20, 30, 40, .22)"),
        depth: parseFloat(c("--globe-night-depth", ".74")), limb: parseFloat(c("--globe-limb", ".16")),
        font: c("--globe-font", "600 11px system-ui, sans-serif")
      };
      var n = colors.night.replace("#", "");
      if (n.length === 3) n = n.replace(/./g, "$&$&");
      colors.nightRGB = [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
      lastSig = "";
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = { w: r.width, h: r.height };
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastSig = "";
    }
    function radius() { return Math.min(size.w, size.h * 0.92) * 0.45; }

    function draw() {
      var w = size.w, h = size.h;
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      var R = radius(), cx = w / 2, cy = h * 0.47;
      var rot = rotator(center[0], center[1]), o = [0, 0, 0];
      var ss = subsolar(d.date || "2026-03-20", utc), sunW = vec(ss[0], ss[1]), sun = rot(sunW, [0, 0, 0]);

      ctx.save();
      ctx.translate(cx, cy + R * 1.05); ctx.scale(1, 0.1);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.85);
      g.addColorStop(0, colors.shadow); g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 0.85, 0, 7); ctx.fill();
      ctx.restore();

      ctx.fillStyle = colors.ocean;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

      // Night, pixel by pixel at low resolution: the sun's height above each point's horizon is
      // the dot product of the surface normal and the sun. Twilight fades over the last 6 degrees.
      var S = Math.max(48, Math.min(200, Math.round(R))), img = sctx.createImageData(S, S), px = img.data;
      var nr = colors.nightRGB, depth = colors.depth * 255;
      for (var j = 0; j < S; j++) {
        var y = 1 - (2 * j + 1) / S;
        for (var i = 0; i < S; i++) {
          var x = (2 * i + 1) / S - 1, rr = x * x + y * y;
          if (rr > 1) continue;
          var z = Math.sqrt(1 - rr), el = x * sun[0] + y * sun[1] + z * sun[2];
          var night = 1 - smooth(TWILIGHT, 0.02, el), k = (j * S + i) * 4;
          px[k] = nr[0]; px[k + 1] = nr[1]; px[k + 2] = nr[2]; px[k + 3] = night * depth;
        }
      }
      shade.width = S; shade.height = S;
      sctx.putImageData(img, 0, 0);
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(shade, cx - R, cy - R, R * 2, R * 2);
      // the sunlit side brightens round the point under the sun; the rim darkens all round
      if (sun[2] > -0.3) {
        var gx = cx + sun[0] * R * 0.9, gy = cy - sun[1] * R * 0.9;
        var gl = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * 1.1);
        gl.addColorStop(0, "rgba(255, 250, 235, .32)"); gl.addColorStop(1, "rgba(255, 250, 235, 0)");
        ctx.fillStyle = gl; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      }
      var s = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R);
      s.addColorStop(0, "rgba(0, 0, 0, 0)"); s.addColorStop(1, "rgba(0, 0, 0, " + colors.limb + ")");
      ctx.fillStyle = s; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      // land dots: sunlit ones in land colour, shaded by the sun's height; night ones dim and cool
      var dr = Math.max(1.3, R * 0.0135);
      var day = [new Path2D(), new Path2D(), new Path2D()], dark = new Path2D();
      for (var n = 0; n < land.length; n++) {
        rot(land[n], o);
        if (o[2] < 0.03) continue;
        var lx = cx + o[0] * R, ly = cy - o[1] * R, ang = Math.atan2(ly - cy, lx - cx), rx = dr * Math.max(o[2], 0.3);
        var e = dot(o, sun), p;
        if (e < TWILIGHT * 0.5) p = dark;
        else p = day[e > 0.5 ? 2 : e > 0.15 ? 1 : 0];
        p.moveTo(lx + rx * Math.cos(ang), ly + rx * Math.sin(ang));
        p.ellipse(lx, ly, rx, dr, ang, 0, Math.PI * 2);
      }
      ctx.fillStyle = colors.land;
      ctx.globalAlpha = 0.55; ctx.fill(day[0]);
      ctx.globalAlpha = 0.8; ctx.fill(day[1]);
      ctx.globalAlpha = 1; ctx.fill(day[2]);
      ctx.fillStyle = colors.nightLand; ctx.globalAlpha = 0.7; ctx.fill(dark);
      ctx.globalAlpha = 1;

      // the point where the sun is straight overhead
      if (sun[2] > 0.05) {
        var sx = cx + sun[0] * R, sy = cy - sun[1] * R;
        ctx.fillStyle = colors.sun; ctx.strokeStyle = colors.paper; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, 7); ctx.stroke(); ctx.fill();
        ctx.strokeStyle = colors.sun; ctx.lineWidth = 1.5;
        for (var r = 0; r < 8; r++) {
          var a = (r * Math.PI) / 4;
          ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * 9, sy + Math.sin(a) * 9); ctx.lineTo(sx + Math.cos(a) * 12, sy + Math.sin(a) * 12); ctx.stroke();
        }
      }

      // places: a dot each, filled by day and hollow by night
      ctx.font = colors.font; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      places.forEach(function (pl) {
        var nightHere = dot(pl.v, sunW) < 0;
        pl.el.classList.toggle("is-night", nightHere);
        rot(pl.v, o);
        if (o[2] < 0.08) return;
        var x = cx + o[0] * R, y = cy - o[1] * R;
        ctx.lineWidth = 2;
        ctx.strokeStyle = nightHere ? colors.nightLand : colors.paper;
        ctx.fillStyle = nightHere ? colors.night : colors.ink;
        ctx.beginPath(); ctx.arc(x, y, 3.6, 0, 7); ctx.fill(); ctx.stroke();
        if (!pl.label) return;
        var left = o[0] > 0.45;
        ctx.textAlign = left ? "right" : "left";
        var tx = x + (left ? -9 : 9);
        ctx.lineWidth = 3.5; ctx.strokeStyle = nightHere ? colors.night : colors.ocean; ctx.strokeText(pl.label, tx, y);
        ctx.fillStyle = nightHere ? colors.nightLand : colors.ink; ctx.fillText(pl.label, tx, y);
      });
    }

    function setUtc(v, quiet) {
      utc = ((v % 24) + 24) % 24;
      d.utc = utc.toFixed(3);
      if (!quiet) canvas.dispatchEvent(new CustomEvent("globe:time", { detail: { utc: utc }, bubbles: true }));
    }

    // The day sweep is a Web Animation used as a clock (it shows on animation timelines and can be scrubbed).
    function play() {
      if (reduce.matches || !canvas.animate) return;
      pause();
      sweepFrom = utc;
      sweep = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 9000, fill: "forwards" });
      sweep.id = "day sweep";
      if (sweep.persist) sweep.persist();
      sweep.onfinish = function () { canvas.dispatchEvent(new CustomEvent("globe:sweepend", { bubbles: true })); };
    }
    function pause() {
      if (!sweep) return;
      sweep.cancel(); sweep = null;
      canvas.dispatchEvent(new CustomEvent("globe:sweepend", { bubbles: true }));
    }

    function frame(t) {
      if (sweep && sweep.playState !== "idle") {
        var p = sweep.effect.getComputedTiming().progress;
        if (p != null) { var nu = (sweepFrom + 24 * p) % 24; if (Math.abs(nu - utc) > 1e-4) setUtc(nu); }
      }
      if (turn && turn.anim.playState !== "idle") {
        var q = turn.anim.effect.getComputedTiming().progress;
        if (q != null) center = [wrap(turn.a[0] + turn.dl * q), turn.a[1] + (turn.b[1] - turn.a[1]) * q];
      }
      if (!drag && (vel[0] || vel[1])) {
        var dt = Math.min(48, t - (frame.t || t)) || 16;
        center = [wrap(center[0] + vel[0] * dt), clampLat(center[1] + vel[1] * dt)];
        var f = Math.exp(-dt / 380);
        vel = [vel[0] * f, vel[1] * f];
        if (Math.abs(vel[0]) + Math.abs(vel[1]) < 0.0015) vel = [0, 0];
      }
      frame.t = t;
      var sig = center[0].toFixed(3) + "," + center[1].toFixed(3) + "," + utc.toFixed(4) + "," + size.w;
      if (sig !== lastSig) { lastSig = sig; draw(); }
      requestAnimationFrame(frame);
    }

    // Keys turn by 20 degrees (45 with Shift) in a short eased move; Home goes back to the start view.
    function turnTo(lon, lat) {
      if (turn) turn.anim.cancel();
      turn = null; vel = [0, 0];
      if (reduce.matches || !canvas.animate) { center = [lon, lat]; return; }
      var dl = wrap(lon - center[0]);
      turn = { a: center.slice(), b: [lon, lat], dl: dl, anim: canvas.animate([{ opacity: 1 }, { opacity: 1 }], {
        duration: 420, easing: getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out", fill: "forwards" }) };
      turn.anim.id = "turn";
    }

    canvas.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      if (turn) { turn.anim.cancel(); turn = null; }
      canvas.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      vel = [0, 0];
      canvas.classList.add("is-dragging");
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var k = 1 / radius() / RAD, dt = Math.max(1, e.timeStamp - drag.t);
      var dLon = -(e.clientX - drag.x) * k / Math.max(0.35, Math.cos(center[1] * RAD)), dLat = (e.clientY - drag.y) * k;
      center = [wrap(center[0] + dLon), clampLat(center[1] + dLat)];
      vel = [vel[0] * 0.3 + (dLon / dt) * 0.7, vel[1] * 0.3 + (dLat / dt) * 0.7];
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    });
    function release(e) {
      if (!drag) return;
      if (e.timeStamp - drag.t > 90 || reduce.matches) vel = [0, 0];
      drag = null;
      canvas.classList.remove("is-dragging");
    }
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 45 : 20, c = turn ? turn.b : center;
      if (e.key === "ArrowLeft") turnTo(wrap(c[0] - step), c[1]);
      else if (e.key === "ArrowRight") turnTo(wrap(c[0] + step), c[1]);
      else if (e.key === "ArrowUp") turnTo(c[0], clampLat(c[1] + step));
      else if (e.key === "ArrowDown") turnTo(c[0], clampLat(c[1] - step));
      else if (e.key === "Home") turnTo(home[0], home[1]);
      else return;
      e.preventDefault();
    });

    new MutationObserver(function () {
      var v = +d.utc;
      if (!isNaN(v) && Math.abs(v - utc) > 1e-3) { pause(); utc = ((v % 24) + 24) % 24; }
    }).observe(canvas, { attributes: true, attributeFilter: ["data-utc", "data-date"] });

    readColors();
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
    if (document.fonts) document.fonts.ready.then(function () { lastSig = ""; });
    canvas.globe = { play: play, pause: pause, playing: function () { return !!sweep && sweep.playState === "running"; }, setUtc: function (v) { pause(); setUtc(v, true); } };
    canvas.classList.add("is-ready");
    requestAnimationFrame(frame);
  }

  function init() { document.querySelectorAll("canvas.globe-daynight").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
