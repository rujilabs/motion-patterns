/*
 * globe-country-picker.js: a dot globe that turns to the country someone picks.
 *
 *   <canvas class="globe-picker" data-lon="138.3" data-lat="36.2" data-label="Japan"
 *           data-spots="139.5 36.5 3.2, 135 34.5 2.5, 142.8 43.3 2.4"
 *           data-from-lon="101.1" data-from-lat="4.6" data-from-label="Ipoh" aria-label="..."></canvas>
 *
 * data-spots: the country's land as circles, "lon lat radius" in degrees, comma separated. Leave it
 * out and a 4 degree circle round the pin lights instead.
 * Change data-lon and data-lat (with data-label and data-spots) and the globe turns the short way
 * round, along a great circle (slerp), then the country's land lights up and its pin lands.
 * Drag or flick it to turn it by hand (it keeps turning a little and slows down), or use the arrow
 * keys when it has focus; Home turns back to the picked country.
 * Land comes from window.GLOBE_LAND ([[lon, lat], ...]) in land.js. Colours come from CSS.
 */
(function () {
  "use strict";
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var LIGHT = norm([-0.5, 0.6, 0.62]); // the sun sits up and to the left of the viewer

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function vec(lon, lat) { var l = lon * RAD, p = lat * RAD, c = Math.cos(p); return [c * Math.sin(l), Math.sin(p), c * Math.cos(l)]; }
  function lonLat(v) { return [Math.atan2(v[0], v[2]) / RAD, Math.asin(Math.max(-1, Math.min(1, v[1]))) / RAD]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  // Spherical linear interpolation: the centre of the view moves along the great circle between two places.
  function slerp(a, b, t) {
    var w = Math.acos(Math.max(-1, Math.min(1, dot(a, b)))), s = Math.sin(w);
    if (s < 1e-4) return norm([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    var ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
    return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
  }
  // Orthographic view looking at (lon0, lat0), north kept up. Returns x right, y up, z toward the viewer.
  function rotator(lon0, lat0) {
    var sl = Math.sin(lon0 * RAD), cl = Math.cos(lon0 * RAD), sp = Math.sin(lat0 * RAD), cp = Math.cos(lat0 * RAD);
    return function (v, o) {
      var x = v[0] * cl - v[2] * sl, z = v[0] * sl + v[2] * cl;
      o[0] = x; o[1] = v[1] * cp - z * sp; o[2] = v[1] * sp + z * cp;
      return o;
    };
  }
  function token(name, fallback) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback; }
  function progress(anim) {
    if (!anim || anim.playState === "idle") return null;
    var p = anim.effect.getComputedTiming().progress;
    return p == null ? null : p;
  }
  function wrap(lon) { return ((lon + 540) % 360) - 180; }
  function clampLat(lat) { return Math.max(-70, Math.min(70, lat)); }

  function setup(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var land = (window.GLOBE_LAND || []).map(function (p) { return vec(p[0], p[1]); });
    var d = canvas.dataset;
    var from = d.fromLon ? { v: vec(+d.fromLon, +d.fromLat), label: d.fromLabel || "" } : null;
    var pick = null;              // { v, label, spots: [{ v, cos }] }
    var center = from ? lonLat(from.v) : [+d.lon || 0, +d.lat || 0];
    var turn = null, pin = null;  // Web Animations used as clocks, so the motion shows on any animation timeline
    var vel = [0, 0], drag = null;
    var size = { w: 0, h: 0 }, colors = {}, lastSig = "";

    function readColors() {
      var cs = getComputedStyle(canvas);
      function c(n, f) { return cs.getPropertyValue(n).trim() || f; }
      colors = {
        ocean: c("--globe-ocean", "#e8edf2"), land: c("--globe-land", "#3b4a5c"), accent: c("--globe-accent", "#d9482b"),
        ink: c("--globe-ink", "#1e2229"), paper: c("--globe-paper", "#ffffff"), shadow: c("--globe-shadow", "rgba(20, 30, 40, .22)"),
        limb: parseFloat(c("--globe-limb", ".18")), glint: parseFloat(c("--globe-glint", ".22")),
        font: c("--globe-font", "600 12px system-ui, sans-serif")
      };
      lastSig = "";
    }

    function fit() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = { w: r.width, h: r.height };
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastSig = "";
    }

    function draw(lit) {
      var w = size.w, h = size.h;
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      var R = Math.min(w, h * 0.92) * 0.45, cx = w / 2, cy = h * 0.47;
      var rot = rotator(center[0], center[1]), o = [0, 0, 0];

      // contact shadow: one soft ellipse on the floor under the ball
      ctx.save();
      ctx.translate(cx, cy + R * 1.05); ctx.scale(1, 0.1);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.85);
      g.addColorStop(0, colors.shadow); g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 0.85, 0, 7); ctx.fill();
      ctx.restore();

      // the sea, then a limb shade: lighter where the sun faces, darker toward the rim
      ctx.fillStyle = colors.ocean;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      var s = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, 0, cx - R * 0.12, cy - R * 0.12, R * 1.18);
      s.addColorStop(0, "rgba(255, 255, 255, " + colors.glint + ")");
      s.addColorStop(0.45, "rgba(255, 255, 255, 0)");
      s.addColorStop(0.8, "rgba(0, 0, 0, 0)");
      s.addColorStop(1, "rgba(0, 0, 0, " + colors.limb + ")");
      ctx.fillStyle = s; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

      // land dots: hidden on the far side, squashed toward the rim, shaded by the light
      var dr = Math.max(1.3, R * 0.0135);
      var paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()], hot = new Path2D();
      for (var i = 0; i < land.length; i++) {
        rot(land[i], o);
        if (o[2] < 0.03) continue;
        var x = cx + o[0] * R, y = cy - o[1] * R;
        var ang = Math.atan2(y - cy, x - cx), rx = dr * Math.max(o[2], 0.3);
        var light = 0.42 + 0.58 * Math.max(0, dot(o, LIGHT));
        var a = light * Math.min(1, 0.35 + o[2] * 1.6);
        var isHot = pick && lit > 0 && inside(land[i]);
        var p = isHot ? hot : paths[Math.max(0, Math.min(3, Math.round(a * 4) - 1))];
        var k2 = isHot ? 1 + 0.4 * lit : 1; // the picked country's dots swell a little as they light
        p.moveTo(x + rx * k2 * Math.cos(ang), y + rx * k2 * Math.sin(ang));
        p.ellipse(x, y, rx * k2, dr * k2, ang, 0, Math.PI * 2);
      }
      ctx.fillStyle = colors.land;
      for (var k = 0; k < 4; k++) { ctx.globalAlpha = (k + 1) / 4; ctx.fill(paths[k]); }
      // the picked country's land fades from land colour to the accent as the pin lands
      ctx.globalAlpha = 1; ctx.fill(hot);
      ctx.globalAlpha = lit; ctx.fillStyle = colors.accent; ctx.fill(hot);
      ctx.globalAlpha = 1;

      ctx.font = colors.font; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      function label(text, x, y, color) {
        var tw = ctx.measureText(text).width, left = x + 10 + tw > cx + R + 8;
        ctx.textAlign = left ? "right" : "left";
        var tx = left ? x - 10 : x + 10;
        ctx.lineWidth = 4; ctx.strokeStyle = colors.ocean; ctx.strokeText(text, tx, y);
        ctx.fillStyle = color; ctx.fillText(text, tx, y);
      }
      // where the parcel leaves from
      if (from) {
        rot(from.v, o);
        if (o[2] > 0.1) {
          var fx = cx + o[0] * R, fy = cy - o[1] * R;
          ctx.fillStyle = colors.ink; ctx.strokeStyle = colors.paper; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(fx, fy, 3.5, 0, 7); ctx.stroke(); ctx.fill();
          if (!pick || dot(pick.v, from.v) < Math.cos(6 * RAD)) label(from.label, fx, fy, colors.ink);
        }
      }
      // the pin: a ring goes out once as it lands, then a solid dot with the country's name
      if (pick && lit > 0) {
        rot(pick.v, o);
        if (o[2] > 0.1) {
          var px = cx + o[0] * R, py = cy - o[1] * R;
          if (lit < 1) {
            ctx.strokeStyle = colors.accent; ctx.lineWidth = 2; ctx.globalAlpha = 1 - lit;
            ctx.beginPath(); ctx.arc(px, py, 5 + lit * 22, 0, 7); ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = colors.accent; ctx.strokeStyle = colors.paper; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(px, py, 2 + 3 * Math.min(1, lit * 2), 0, 7); ctx.stroke(); ctx.fill();
          ctx.globalAlpha = Math.min(1, lit * 2);
          label(pick.label, px, py, colors.ink);
          ctx.globalAlpha = 1;
        }
      }
    }

    function inside(v) {
      for (var j = 0; j < pick.spots.length; j++) if (dot(v, pick.spots[j].v) > pick.spots[j].cos) return true;
      return false;
    }

    function stop() {
      if (turn) { turn.anim.cancel(); turn = null; }
    }

    // Turn the view centre to (lon, lat) along the great circle. `land` = light the picked country afterwards.
    function turnTo(lon, lat, lands) {
      stop();
      vel = [0, 0];
      var a = vec(center[0], center[1]), b = vec(lon, lat);
      var deg = Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) / RAD;
      if (lands && pin) { pin.cancel(); pin = null; }
      if (reduce.matches || !canvas.animate) {
        center = [lon, lat];
        return;
      }
      var dur = Math.round(Math.min(1500, 520 + deg * 7));
      var still = [{ opacity: 1 }, { opacity: 1 }]; // a clock: the canvas reads its progress every frame
      turn = { a: a, b: b, anim: canvas.animate(still, { duration: dur, easing: token("--ease-inout", "ease-in-out"), fill: "both" }) };
      turn.anim.id = "turn";
      if (turn.anim.persist) turn.anim.persist(); // keep the clock readable after a later one overrides it
      if (lands) {
        pin = canvas.animate(still, { duration: 700, delay: Math.max(0, dur - 160), easing: token("--ease-out", "ease-out"), fill: "both" });
        pin.id = "pin lands";
        if (pin.persist) pin.persist();
      }
    }

    function choose() {
      var lon = +d.lon, lat = +d.lat;
      if (isNaN(lon) || isNaN(lat)) return;
      var spots = (d.spots || lon + " " + lat + " 4").split(",").map(function (t) {
        var n = t.trim().split(/\s+/).map(Number);
        return { v: vec(n[0], n[1]), cos: Math.cos((n[2] || 2) * RAD) };
      });
      pick = { v: vec(lon, lat), label: d.label || "", spots: spots };
      turnTo(lon, lat, true);
    }

    function frame(t) {
      var p = turn ? progress(turn.anim) : null;
      if (p != null) center = lonLat(slerp(turn.a, turn.b, p));
      var lit = pick ? (pin ? progress(pin) : 1) : 0;
      if (lit == null) lit = pin ? 0 : 1;
      if (!drag && (vel[0] || vel[1])) {
        var dt = Math.min(48, t - (frame.t || t)) || 16;
        center = [wrap(center[0] + vel[0] * dt), clampLat(center[1] + vel[1] * dt)];
        var f = Math.exp(-dt / 380); // friction: a flick fades over about a second
        vel = [vel[0] * f, vel[1] * f];
        if (Math.abs(vel[0]) + Math.abs(vel[1]) < 0.0015) vel = [0, 0];
      }
      frame.t = t;
      var sig = center[0].toFixed(3) + "," + center[1].toFixed(3) + "," + lit.toFixed(3) + "," + size.w;
      if (sig !== lastSig) { lastSig = sig; draw(lit); }
      requestAnimationFrame(frame);
    }

    // Drag: the land under the finger follows it, one radius of travel = one radian of turn.
    canvas.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      stop();
      canvas.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      vel = [0, 0];
      canvas.classList.add("is-dragging");
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var R = Math.min(size.w, size.h * 0.92) * 0.45;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt = Math.max(1, e.timeStamp - drag.t);
      var k = 1 / R / RAD; // pixels to degrees at the centre of the ball
      var dLon = -dx * k / Math.max(0.35, Math.cos(center[1] * RAD)), dLat = dy * k;
      center = [wrap(center[0] + dLon), clampLat(center[1] + dLat)];
      vel = [vel[0] * 0.3 + (dLon / dt) * 0.7, vel[1] * 0.3 + (dLat / dt) * 0.7];
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    });
    function release(e) {
      if (!drag) return;
      if (e.timeStamp - drag.t > 90 || reduce.matches) vel = [0, 0]; // held still before letting go: no fling
      drag = null;
      canvas.classList.remove("is-dragging");
    }
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    canvas.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 45 : 20, c = center;
      if (e.key === "ArrowLeft") turnTo(wrap(c[0] - step), c[1]);
      else if (e.key === "ArrowRight") turnTo(wrap(c[0] + step), c[1]);
      else if (e.key === "ArrowUp") turnTo(c[0], clampLat(c[1] + step));
      else if (e.key === "ArrowDown") turnTo(c[0], clampLat(c[1] - step));
      else if (e.key === "Home" && pick) turnTo(+d.lon, +d.lat);
      else return;
      e.preventDefault();
    });

    readColors();
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
    if (document.fonts) document.fonts.ready.then(function () { lastSig = ""; });
    new MutationObserver(choose).observe(canvas, { attributes: true, attributeFilter: ["data-lon", "data-lat", "data-spots"] });
    canvas.globe = { turnTo: turnTo };

    // First turn: from the origin to the picked country when the globe scrolls into view.
    if (reduce.matches || !("IntersectionObserver" in window)) choose();
    else {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); choose(); } }, { threshold: 0.3 });
      io.observe(canvas);
    }
    canvas.classList.add("is-ready");
    requestAnimationFrame(frame);
  }

  function init() { document.querySelectorAll("canvas.globe-picker").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
