/*
 * globe-flight-arcs.js: routes lift off a dot globe as arcs, and a plane rides each one.
 *
 *   <canvas class="globe-arcs" data-lon="106" data-lat="8" data-routes="#routes" aria-label="..."></canvas>
 *   <ol id="routes">
 *     <li data-from="101.71 2.75 KUL" data-to="140.39 35.77 NRT">...</li>
 *   </ol>
 *
 * data-lon and data-lat aim the view. Each route is a great circle between two places ("lon lat CODE"),
 * lifted off the surface in the middle in proportion to its length. The planes leave one after
 * another when the globe scrolls into view; each list item gets the class "is-landed" as its plane
 * lands. canvas.globe.play() flies them again.
 * Land comes from window.GLOBE_LAND ([[lon, lat], ...]) in land.js. Colours come from CSS.
 */
(function () {
  "use strict";
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var LIGHT = norm([-0.5, 0.6, 0.62]);

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function vec(lon, lat) { var l = lon * RAD, p = lat * RAD, c = Math.cos(p); return [c * Math.sin(l), Math.sin(p), c * Math.cos(l)]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function slerp(a, b, t) {
    var w = Math.acos(Math.max(-1, Math.min(1, dot(a, b)))), s = Math.sin(w);
    if (s < 1e-4) return a.slice();
    var ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
    return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
  }
  function rotator(lon0, lat0) {
    var sl = Math.sin(lon0 * RAD), cl = Math.cos(lon0 * RAD), sp = Math.sin(lat0 * RAD), cp = Math.cos(lat0 * RAD);
    return function (v, o) {
      var x = v[0] * cl - v[2] * sl, z = v[0] * sl + v[2] * cl;
      o[0] = x; o[1] = v[1] * cp - z * sp; o[2] = v[1] * sp + z * cp;
      return o;
    };
  }
  function token(name, fallback) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback; }
  function place(text) { var p = (text || "").trim().split(/\s+/); return { v: vec(+p[0], +p[1]), code: p[2] || "" }; }

  function setup(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var land = (window.GLOBE_LAND || []).map(function (p) { return vec(p[0], p[1]); });
    var list = document.querySelector(canvas.dataset.routes);
    var rot = rotator(+canvas.dataset.lon || 0, +canvas.dataset.lat || 0);
    var routes = list ? Array.prototype.map.call(list.querySelectorAll("[data-to]"), function (li) {
      var a = place(li.dataset.from), b = place(li.dataset.to);
      var ang = Math.acos(Math.max(-1, Math.min(1, dot(a.v, b.v))));
      // Longer flights climb higher: the arc's top is lifted by up to 0.36 of the radius.
      return { li: li, a: a, b: b, ang: ang, lift: Math.min(0.36, 0.06 + ang * 0.36), anim: null };
    }) : [];
    var size = { w: 0, h: 0 }, colors = {}, lastSig = "";

    function readColors() {
      var cs = getComputedStyle(canvas);
      function c(n, f) { return cs.getPropertyValue(n).trim() || f; }
      colors = {
        ocean: c("--globe-ocean", "#e6edf3"), land: c("--globe-land", "#24395a"), accent: c("--globe-accent", "#d63a2f"),
        ink: c("--globe-ink", "#1e2229"), paper: c("--globe-paper", "#ffffff"), shadow: c("--globe-shadow", "rgba(20, 30, 50, .22)"),
        limb: parseFloat(c("--globe-limb", ".18")), glint: parseFloat(c("--globe-glint", ".22")),
        font: c("--globe-font", "600 11px system-ui, sans-serif")
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

    // A point along a route at t (0 to 1): on the great circle, lifted by a sine bump.
    function along(r, t) {
      var g = slerp(r.a.v, r.b.v, t), k = 1 + r.lift * Math.sin(Math.PI * t);
      return { up: [g[0] * k, g[1] * k, g[2] * k], ground: g };
    }

    function draw(prog) {
      var w = size.w, h = size.h;
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      var R = Math.min(w, h * 0.92) * 0.42, cx = w / 2, cy = h * 0.48, o = [0, 0, 0];
      function sx(p) { return cx + p[0] * R; }
      function sy(p) { return cy - p[1] * R; }
      // hidden = behind the ball: on the far side and inside its outline
      function hidden(p) { return p[2] < 0 && p[0] * p[0] + p[1] * p[1] < 1; }

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

      var dr = Math.max(1.3, R * 0.016);
      var paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (var i = 0; i < land.length; i++) {
        rot(land[i], o);
        if (o[2] < 0.03) continue;
        var x = cx + o[0] * R, y = cy - o[1] * R, ang = Math.atan2(y - cy, x - cx), rx = dr * Math.max(o[2], 0.3);
        var a = (0.42 + 0.58 * Math.max(0, dot(o, LIGHT))) * Math.min(1, 0.35 + o[2] * 1.6);
        var p = paths[Math.max(0, Math.min(3, Math.round(a * 4) - 1))];
        p.moveTo(x + rx * Math.cos(ang), y + rx * Math.sin(ang));
        p.ellipse(x, y, rx, dr, ang, 0, Math.PI * 2);
      }
      ctx.fillStyle = colors.land;
      for (var k = 0; k < 4; k++) { ctx.globalAlpha = 0.4 + k * 0.2; ctx.fill(paths[k]); }
      ctx.globalAlpha = 1;

      ctx.lineCap = "round"; ctx.lineJoin = "round";
      routes.forEach(function (r, n) {
        var t = prog[n];
        if (t <= 0) return;
        var steps = Math.max(12, Math.round(r.ang / RAD)), end = Math.min(1, t);
        // the ground track under the flown part: a dotted line on the surface, so the lift reads as height
        ctx.setLineDash([1, 4]); ctx.lineWidth = 1.5; ctx.strokeStyle = colors.land; ctx.globalAlpha = 0.45;
        ctx.beginPath();
        var first = true;
        for (var gj = 0; gj <= steps; gj++) {
          var gu = Math.min(end, gj / steps), gq = rot(along(r, gu).ground, [0, 0, 0]);
          if (gq[2] < 0) { first = true; continue; }
          if (first) ctx.moveTo(sx(gq), sy(gq)); else ctx.lineTo(sx(gq), sy(gq));
          first = false;
          if (gu >= end) break;
        }
        ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;

        // the flown part of the arc: solid in front, faint where it passes behind the ball
        var prev = null, prevHidden = false;
        ctx.lineWidth = Math.max(1.5, R * 0.009);
        for (var j = 0; j <= steps; j++) {
          var u = Math.min(end, j / steps), q = rot(along(r, u).up, [0, 0, 0]);
          var hid = hidden(q);
          if (prev) {
            ctx.strokeStyle = colors.accent; ctx.globalAlpha = prevHidden || hid ? 0.2 : 1;
            ctx.beginPath(); ctx.moveTo(sx(prev), sy(prev)); ctx.lineTo(sx(q), sy(q)); ctx.stroke();
          }
          prev = q; prevHidden = hid;
          if (u >= end) break;
        }
        ctx.globalAlpha = 1;

        if (t < 1) {
          // the plane: its shadow sits on the ground right under it, and it grows a little as it climbs
          var at = along(r, t), up = rot(at.up, [0, 0, 0]), down = rot(at.ground, [0, 0, 0]);
          var ahead = rot(along(r, Math.min(1, t + 0.02)).up, [0, 0, 0]);
          var heading = Math.atan2(sy(ahead) - sy(up), sx(ahead) - sx(up));
          var climb = Math.sin(Math.PI * t);
          if (down[2] > 0) {
            ctx.fillStyle = colors.land; ctx.globalAlpha = 0.18 + 0.1 * (1 - climb);
            ctx.beginPath(); ctx.ellipse(sx(down), sy(down), 3.2, 2, heading, 0, 7); ctx.fill();
            ctx.globalAlpha = 1;
          }
          if (!hidden(up)) plane(sx(up), sy(up), heading, (R / 170) * (0.85 + 0.35 * climb));
        }
      });

      // airports: a ring goes out once as each plane lands
      ctx.font = colors.font; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      var hubDone = false;
      routes.forEach(function (r, n) {
        if (!hubDone) { pinAt(r.a, 1, true); hubDone = true; }
        var t = prog[n];
        pinAt(r.b, t >= 1 ? 1 : 0, false, t >= 1 ? Math.min(1, (prog.after[n] || 0)) : 0);
      });

      function pinAt(pl, on, hub, ring) {
        rot(pl.v, o);
        if (o[2] < 0.05) return;
        var x = cx + o[0] * R, y = cy - o[1] * R;
        if (ring > 0 && ring < 1) {
          ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.5; ctx.globalAlpha = 1 - ring;
          ctx.beginPath(); ctx.arc(x, y, 3 + ring * 16, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
        }
        ctx.fillStyle = hub ? colors.ink : on ? colors.accent : colors.land;
        ctx.strokeStyle = colors.paper; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, hub ? 4 : 3, 0, 7); ctx.stroke(); ctx.fill();
        if (!pl.code) return;
        var left = o[0] < -0.2;
        ctx.textAlign = left ? "right" : "left";
        var tx = x + (left ? -8 : 8);
        ctx.lineWidth = 3.5; ctx.strokeStyle = colors.ocean; ctx.strokeText(pl.code, tx, y);
        ctx.fillStyle = hub || on ? colors.ink : colors.land; ctx.fillText(pl.code, tx, y);
      }
    }

    // A small plane seen from above, nose along +x, about 16px long at scale 1.
    function plane(x, y, heading, k) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(heading); ctx.scale(k, k);
      ctx.fillStyle = colors.ink; ctx.strokeStyle = colors.paper; ctx.lineWidth = 1.6 / k;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.quadraticCurveTo(7, -1.3, 4, -1.3);
      ctx.lineTo(1, -1.3); ctx.lineTo(-2.5, -7.5); ctx.lineTo(-4.3, -7.5); ctx.lineTo(-2.4, -1.3);
      ctx.lineTo(-6, -1.2); ctx.lineTo(-7.6, -3.6); ctx.lineTo(-8.8, -3.6); ctx.lineTo(-8, 0);
      ctx.lineTo(-8.8, 3.6); ctx.lineTo(-7.6, 3.6); ctx.lineTo(-6, 1.2); ctx.lineTo(-2.4, 1.3);
      ctx.lineTo(-4.3, 7.5); ctx.lineTo(-2.5, 7.5); ctx.lineTo(1, 1.3); ctx.lineTo(4, 1.3);
      ctx.quadraticCurveTo(7, 1.3, 8, 0);
      ctx.closePath(); ctx.stroke(); ctx.fill();
      ctx.restore();
    }

    function read(anim) {
      if (!anim || anim.playState === "idle") return { t: reduce.matches ? 1 : 0, after: 0 };
      var c = anim.effect.getComputedTiming(), local = anim.currentTime - c.delay;
      var fly = c.duration - 600; // the last 600ms of each clock is the landing ring
      var t = c.progress == null ? (local > 0 ? 1 : 0) : Math.min(1, (c.progress * c.duration) / fly);
      return { t: t, after: local > fly ? (local - fly) / 600 : 0 };
    }

    function play() {
      routes.forEach(function (r, n) {
        if (r.anim) r.anim.cancel();
        r.anim = null;
        r.li.classList.remove("is-landed");
        if (reduce.matches || !canvas.animate) { r.li.classList.add("is-landed"); return; }
        var fly = Math.round(1300 + r.ang * 600);
        // linear clock; the flight eases inside it so the landing ring keeps its own pace
        r.anim = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: fly + 600, delay: n * 240, fill: "both" });
        r.anim.id = (r.li.dataset.flight || "flight " + (n + 1));
        if (r.anim.persist) r.anim.persist();
      });
      lastSig = "";
    }

    var ease = parseEase(token("--ease-inout", ""));
    function frame() {
      var prog = [], sig = "";
      prog.after = [];
      routes.forEach(function (r, n) {
        var s = read(r.anim);
        var t = ease(s.t);
        prog.push(t); prog.after.push(s.after);
        r.li.classList.toggle("is-landed", s.t >= 1);
        sig += t.toFixed(4) + "/" + s.after.toFixed(3) + ",";
      });
      sig += size.w;
      if (sig !== lastSig) { lastSig = sig; draw(prog); }
      requestAnimationFrame(frame);
    }

    readColors();
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
    if (document.fonts) document.fonts.ready.then(function () { lastSig = ""; });
    canvas.globe = { play: play };
    if (reduce.matches || !("IntersectionObserver" in window)) play();
    else {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.3 });
      io.observe(canvas);
    }
    canvas.classList.add("is-ready");
    requestAnimationFrame(frame);
  }

  // The token is a cubic-bezier(); solve it so the plane speeds up off the runway and slows to land.
  function parseEase(s) {
    var m = /cubic-bezier\(([^)]+)\)/.exec(s);
    if (!m) return function (t) { return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t); };
    var p = m[1].split(",").map(Number), x1 = p[0], y1 = p[1], x2 = p[2], y2 = p[3];
    function b(a1, a2, t) { return 3 * a1 * t * (1 - t) * (1 - t) + 3 * a2 * t * t * (1 - t) + t * t * t; }
    return function (x) {
      if (x <= 0 || x >= 1) return Math.max(0, Math.min(1, x));
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 24; i++) { t = (lo + hi) / 2; if (b(x1, x2, t) < x) lo = t; else hi = t; }
      return b(y1, y2, t);
    };
  }

  function init() { document.querySelectorAll("canvas.globe-arcs").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
