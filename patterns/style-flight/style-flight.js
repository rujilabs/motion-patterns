/*
 * style-flight.js: one paper plane flight, drawn in ten looks. Every .sf-item names its look in
 * data-look; its .sf-canvas shows a still frame mid flight and plays the 4 s loop only while that card
 * is hovered (mouse), keyboard focused or tapped. One card plays at a time. A click or Enter opens the
 * look large in .sf-dialog; on a touch screen the first tap plays, a second tap or .sf-open opens.
 *   <li class="sf-item" data-look="pixel">
 *     <button class="sf-card" data-desc="..." data-days="5"><span class="sf-view"><span class="sf-still"></span>
 *       <canvas class="sf-canvas"></canvas></span><span class="sf-name">Pixel</span><span class="sf-price">...</span></button>
 *     <button class="sf-open" hidden>Open</button>
 *   </li>
 * The flight: pos(t) is a pure function of t (0 to 1) in a 4:3 box measured in units of its height,
 * y down: a curve from bottom left, a vertical loop of radius 0.2, a curve off the right edge, joined
 * with matching direction and speed. flight(t) adds the heading (from the path) and a gentle bank that
 * opens and closes the wing. Every look calls the same functions, so only the drawing differs.
 * Time comes from a Web Animations clock per playing canvas ("style flight"); only canvases that are
 * on screen and being previewed run, nothing runs in a hidden tab, and the drawing buffer is the CSS
 * size times devicePixelRatio, capped at 2. Under reduced motion every canvas shows the still frame.
 */
(function () {
  var PERIOD = 4000;   // one flight, ms
  var STILL = 0.74;    // the still frame: just out of the loop, gliding right, the loop behind it
  var TAU = Math.PI * 2;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- the one flight -------------------------------------------------------------------------
  function bez(a, b, c, d, u) { var v = 1 - u; return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d; }
  function pos(t) {
    if (t < 0.3) { var u = t / 0.3; return [bez(-0.12, 0.1, 0.27, 0.62, u), bez(0.92, 0.95, 0.65, 0.65, u)]; }
    if (t < 0.66) { var a = (t - 0.3) / 0.36 * TAU; return [0.62 + 0.2 * Math.sin(a), 0.45 + 0.2 * Math.cos(a)]; }
    var w = (t - 0.66) / 0.34; return [bez(0.62, 1.015, 1.2, 1.56, w), bez(0.65, 0.65, 0.42, 0.28, w)];
  }
  function flight(t) {
    var p = pos(t), q = pos(t + 0.003);
    return { x: p[0], y: p[1], a: Math.atan2(q[1] - p[1], q[0] - p[0]), bank: 0.5 * Math.sin(TAU * (2 * t + 0.77)) };
  }
  // the plane from the side, nose along +x, in plane lengths: far wing, near wing, keel
  function plane(t, H, L, jx, jy, ja) {
    var f = flight(t), w = 0.62 + 0.38 * f.bank, a = f.a + (ja || 0);
    var cs = Math.cos(a), sn = Math.sin(a), ox = f.x * H + (jx || 0), oy = f.y * H + (jy || 0);
    function p(x, y) { return [ox + (x * cs - y * sn) * L, oy + (x * sn + y * cs) * L]; }
    var N = p(1, 0), A = p(-0.62, -0.44 * w - 0.08), A2 = p(-0.54, -0.44 * w - 0.22), F = p(-0.36, 0.02), K = p(-0.5, 0.25);
    return { f: f, x: ox, y: oy, N: N, A: A, F: F, K: K, far: [N, A2, A], wing: [N, A, F], keel: [N, F, K] };
  }
  function trail(t, H, span, n) {
    var t0 = Math.max(0, t - span), out = [];
    for (var i = 0; i <= n; i++) { var tt = t0 + (t - t0) * i / n, p = pos(tt); out.push([p[0] * H, p[1] * H, tt]); }
    return out;
  }

  // ---- helpers ---------------------------------------------------------------------------------
  function rng(s) {
    return function () {
      s = (s + 0x6d2b79f5) | 0; var x = Math.imul(s ^ (s >>> 15), 1 | s);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shape(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); }
  function line(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); }
  function fill(c, pts, col) { shape(c, pts); c.fillStyle = col; c.fill(); }
  function inTri(x, y, t) {
    var d1 = (x - t[1][0]) * (t[0][1] - t[1][1]) - (t[0][0] - t[1][0]) * (y - t[1][1]);
    var d2 = (x - t[2][0]) * (t[1][1] - t[2][1]) - (t[1][0] - t[2][0]) * (y - t[2][1]);
    var d3 = (x - t[0][0]) * (t[2][1] - t[0][1]) - (t[2][0] - t[0][0]) * (y - t[0][1]);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  }
  // which face covers each cell of a gw x gh grid of cell px (later faces win)
  function raster(gw, gh, cell, faces) {
    var m = new Uint8Array(gw * gh), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    faces.forEach(function (f) { f.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); });
    var i0 = Math.max(0, Math.floor(x0 / cell)), i1 = Math.min(gw - 1, Math.ceil(x1 / cell));
    var j0 = Math.max(0, Math.floor(y0 / cell)), j1 = Math.min(gh - 1, Math.ceil(y1 / cell));
    for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
      for (var k = 0; k < faces.length; k++) if (inTri((i + 0.5) * cell, (j + 0.5) * cell, faces[k])) m[j * gw + i] = k + 1;
    }
    return m;
  }
  // a cached background drawn once per size
  function layer(st, key, draw) {
    var k = st.W + "x" + st.H + "@" + st.dpr, e = st.cache[key];
    if (e && e.k === k) return e.c;
    var cv = document.createElement("canvas"); cv.width = Math.round(st.W * st.dpr); cv.height = Math.round(st.H * st.dpr);
    var x = cv.getContext("2d"); x.scale(st.dpr, st.dpr); draw(x, st.W, st.H);
    st.cache[key] = { k: k, c: cv }; return cv;
  }
  function bg(c, st, key, draw) { c.drawImage(layer(st, key, draw), 0, 0, st.W, st.H); }

  // ---- the ten looks -----------------------------------------------------------------------------
  var LOOKS = {
    // a 80 x 60 grid, every face filled cell by cell, a dark outline around the plane, scaled up hard
    pixel: function (c, W, H, t, st) {
      var gw = 80, gh = 60, o = st.lo || (st.lo = document.createElement("canvas"));
      if (o.width !== gw) { o.width = gw; o.height = gh; }
      var x = o.getContext("2d"), sky = ["#4f9cf5", "#68adf8", "#86c0fb", "#a6d3fd"], i, j;
      for (i = 0; i < 4; i++) { x.fillStyle = sky[i]; x.fillRect(0, i * 12, gw, 12); }
      x.fillStyle = "#5cbf4a"; x.fillRect(0, 50, gw, 10); x.fillStyle = "#3f9a35"; x.fillRect(0, 50, gw, 1);
      for (i = 2; i < gw; i += 7) x.fillRect(i, 49, 2, 1);
      [[6, 9], [50, 6], [64, 30]].forEach(function (p) {
        x.fillStyle = "#fff"; x.fillRect(p[0], p[1], 13, 3); x.fillRect(p[0] + 3, p[1] - 2, 6, 2);
        x.fillStyle = "#cfe5ff"; x.fillRect(p[0] + 1, p[1] + 3, 11, 1);
      });
      x.fillStyle = "#fff";
      trail(t, gh, 0.36, 18).slice(0, -2).forEach(function (p, k) { if (k % 2 === 0) x.fillRect(Math.round(p[0]), Math.round(p[1]), 1, 1); });
      var P = plane(t, gh, 0.24 * gh), m = raster(gw, gh, 1, [P.far, P.keel, P.wing]), col = [null, "#c3cee4", "#2b3a67", "#ffffff"];
      for (j = 0; j < gh; j++) for (i = 0; i < gw; i++) {
        var v = m[j * gw + i];
        if (v) { x.fillStyle = col[v]; x.fillRect(i, j, 1, 1); }
        else if ((i > 0 && m[j * gw + i - 1]) || (i < gw - 1 && m[j * gw + i + 1]) || (j > 0 && m[(j - 1) * gw + i]) || (j < gh - 1 && m[(j + 1) * gw + i])) {
          x.fillStyle = "#16204a"; x.fillRect(i, j, 1, 1);
        }
      }
      c.imageSmoothingEnabled = false; c.drawImage(o, 0, 0, W, H);
    },

    // rough doubled strokes that boil 8 times a second, hatching, a dotted path and falling dust
    chalk: function (c, W, H, t, st) {
      bg(c, st, "chalk", function (x, W, H) {
        x.fillStyle = "#2e4a3c"; x.fillRect(0, 0, W, H);
        var r = rng(11), i;
        for (i = 0; i < 16; i++) {
          var gx = r() * W, gy = r() * H, gr = (0.1 + r() * 0.25) * H, g = x.createRadialGradient(gx, gy, 0, gx, gy, gr);
          g.addColorStop(0, "rgba(255,255,255,.07)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
        }
        x.strokeStyle = "rgba(255,255,255,.045)"; x.lineWidth = H * 0.09; x.lineCap = "round";
        for (i = 0; i < 3; i++) { x.beginPath(); x.moveTo(r() * W, r() * H); x.quadraticCurveTo(r() * W, r() * H, r() * W, r() * H); x.stroke(); }
        x.fillStyle = "#6b4a2b"; x.fillRect(0, H * 0.93, W, H * 0.07); x.fillStyle = "#86603a"; x.fillRect(0, H * 0.93, W, H * 0.015);
        x.fillStyle = "#f1efe6"; x.fillRect(W * 0.74, H * 0.9, W * 0.08, H * 0.03);
      });
      var lw = Math.max(1, H / 110), r = rng(Math.floor(t * 32) + 1), k, i;
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "rgba(240,240,230,.5)"; c.lineWidth = lw; c.setLineDash([lw * 1.5, lw * 4]);
      line(c, trail(t, H, 0.38, 44)); c.stroke(); c.setLineDash([]);
      for (k = 0; k < 26; k++) {
        var tb = k / 26, age = t - tb; if (age < 0 || age > 0.4) continue;
        var p = pos(tb), d = rng(k * 7 + 3);
        c.fillStyle = "rgba(240,240,230," + (0.55 * (1 - age / 0.4)).toFixed(3) + ")";
        for (i = 0; i < 3; i++) c.fillRect((p[0] + (d() - 0.5) * 0.07) * H, (p[1] + age * age * 1.4 + age * 0.12 + d() * 0.03) * H, lw * 1.2, lw * 1.2);
      }
      var P = plane(t, H, 0.24 * H);
      fill(c, P.keel, "rgba(235,240,232,.32)"); fill(c, P.far, "rgba(235,240,232,.12)");
      c.save(); shape(c, P.wing); c.clip(); c.strokeStyle = "rgba(240,240,230,.4)"; c.lineWidth = lw * 0.8;
      for (i = -H; i < W; i += lw * 3.2) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + H, H); c.stroke(); }
      c.restore();
      c.strokeStyle = "rgba(246,246,238,.88)"; c.lineWidth = lw * 1.25;
      [P.far, P.wing, P.keel].forEach(function (f) {
        for (var pass = 0; pass < 2; pass++) {
          c.beginPath();
          f.concat([f[0]]).forEach(function (q, n) { var jx = (r() - 0.5) * lw * 1.8, jy = (r() - 0.5) * lw * 1.8; if (n) c.lineTo(q[0] + jx, q[1] + jy); else c.moveTo(q[0] + jx, q[1] + jy); });
          c.stroke();
        }
      });
    },

    // neon strokes, added light, a blurred wide pass under a thin bright one
    glow: function (c, W, H, t, st) {
      bg(c, st, "glow", function (x, W, H) {
        x.fillStyle = "#0a0e1d"; x.fillRect(0, 0, W, H);
        x.strokeStyle = "rgba(90,130,255,.1)"; x.lineWidth = 1;
        for (var g = H / 10; g < W; g += H / 10) { x.beginPath(); x.moveTo(g, 0); x.lineTo(g, H); x.stroke(); }
        for (g = H / 10; g < H; g += H / 10) { x.beginPath(); x.moveTo(0, g); x.lineTo(W, g); x.stroke(); }
        var v = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.75);
        v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.6)"); x.fillStyle = v; x.fillRect(0, 0, W, H);
      });
      var lw = Math.max(1, H / 120), r = rng(Math.floor(t * 48) + 9), tr = trail(t, H, 0.38, 36), i;
      c.globalCompositeOperation = "lighter"; c.lineCap = "round"; c.lineJoin = "round";
      c.shadowColor = "#ff4fd8"; c.shadowBlur = lw * 6; c.lineWidth = lw * 1.6;
      for (i = 1; i < tr.length; i++) {
        c.strokeStyle = "rgba(255,79,216," + (0.85 * i / tr.length).toFixed(3) + ")";
        c.beginPath(); c.moveTo(tr[i - 1][0], tr[i - 1][1]); c.lineTo(tr[i][0], tr[i][1]); c.stroke();
      }
      var P = plane(t, H, 0.24 * H);
      function pass(f, col, w, blur, j) {
        c.shadowColor = col; c.shadowBlur = blur; c.strokeStyle = col; c.lineWidth = w;
        c.beginPath(); f.concat([f[0]]).forEach(function (q, n) { var a = q[0] + (r() - 0.5) * j, b = q[1] + (r() - 0.5) * j; if (n) c.lineTo(a, b); else c.moveTo(a, b); }); c.stroke();
      }
      [P.far, P.wing].forEach(function (f) { pass(f, "rgba(95,244,255,.45)", lw * 2.6, lw * 10, lw * 1.4); pass(f, "#e4feff", lw, lw * 3, lw * 0.8); });
      pass(P.keel, "rgba(255,79,216,.5)", lw * 2.6, lw * 10, lw * 1.4); pass(P.keel, "#ffd6f6", lw, lw * 3, lw * 0.8);
    },

    // a jittered triangle sky and ridge, flat facets on the plane lit by heading, falling shards
    poly: function (c, W, H, t, st) {
      bg(c, st, "poly", function (x, W, H) {
        var r = rng(5), cols = 9, rows = 7, v = [], i, j;
        for (i = 0; i <= cols; i++) { v.push([]); for (j = 0; j <= rows; j++) {
          var ex = i === 0 || i === cols, ey = j === 0 || j === rows;
          v[i].push([i / cols * W + (ex ? 0 : (r() - 0.5) * W / cols * 0.7), j / rows * H + (ey ? 0 : (r() - 0.5) * H / rows * 0.7)]);
        } }
        function tone(y, d) {
          var s = [[52, 67, 127], [200, 107, 132], [245, 171, 106]], u = Math.min(1.999, Math.max(0, y / H * 2)), k = Math.floor(u), f = u - k;
          var a = s[k], b = s[k + 1];
          return "rgb(" + [0, 1, 2].map(function (n) { return Math.round((a[n] + (b[n] - a[n]) * f) * d); }).join(",") + ")";
        }
        function tri(p, q, s) { var col = tone((p[1] + q[1] + s[1]) / 3, 0.93 + r() * 0.14); shape(x, [p, q, s]); x.fillStyle = col; x.strokeStyle = col; x.lineWidth = 0.6; x.fill(); x.stroke(); }
        for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) { tri(v[i][j], v[i + 1][j], v[i][j + 1]); tri(v[i + 1][j], v[i + 1][j + 1], v[i][j + 1]); }
        var sun = [], sx = W * 0.2, sy = H * 0.66;
        for (i = 0; i < 6; i++) sun.push([sx + Math.cos(i / 6 * TAU) * H * 0.09, sy + Math.sin(i / 6 * TAU) * H * 0.09]);
        fill(x, sun, "#ffd890");
        var ridge = [], n = 8;
        for (i = 0; i <= n; i++) ridge.push([i / n * W, H * (0.76 + (i % 2 ? 0.1 : 0) + r() * 0.06)]);
        for (i = 0; i < n; i++) {
          fill(x, [ridge[i], ridge[i + 1], [ridge[i + 1][0], H], [ridge[i][0], H]], i % 2 ? "#2b2f58" : "#363b6c");
          fill(x, [ridge[i], ridge[i + 1], [(ridge[i][0] + ridge[i + 1][0]) / 2, H]], i % 2 ? "#41477e" : "#262a50");
        }
      });
      var P = plane(t, H, 0.24 * H), k = 0.5 + 0.5 * Math.cos(P.f.a + 2.2), i;
      for (i = 1; i <= 5; i++) {
        var tp = t - i * 0.035; if (tp < 0) break;
        var p = pos(tp), s = H * 0.022, sp = tp * 40;
        c.globalAlpha = 0.8 - i * 0.14;
        fill(c, [[p[0] * H + Math.cos(sp) * s, p[1] * H + Math.sin(sp) * s], [p[0] * H + Math.cos(sp + 2.2) * s, p[1] * H + Math.sin(sp + 2.2) * s], [p[0] * H + Math.cos(sp + 4) * s * 0.6, p[1] * H + Math.sin(sp + 4) * s * 0.6]], "#ffe1b0");
      }
      c.globalAlpha = 1;
      [[P.far, "hsl(28,55%," + (48 + 14 * k) + "%)"], [P.keel, "hsl(350,48%," + (36 + 14 * (1 - k)) + "%)"], [P.wing, "hsl(38,95%," + (74 + 18 * k) + "%)"]].forEach(function (f) {
        shape(c, f[0]); c.fillStyle = f[1]; c.strokeStyle = f[1]; c.lineWidth = 0.8; c.fill(); c.stroke();
      });
    },

    // halftone panel, ink outlines, speed lines, puffs and a sound effect
    comic: function (c, W, H, t, st) {
      bg(c, st, "comic", function (x, W, H) {
        x.fillStyle = "#ffe45c"; x.fillRect(0, 0, W, H);
        var sp = H / 22, md = Math.hypot(W, H); x.fillStyle = "#f4b400";
        for (var y = sp / 2; y < H; y += sp) for (var xx = sp / 2 + ((y / sp) % 2 ? sp / 2 : 0); xx < W; xx += sp) {
          var rr = sp * 0.46 * Math.hypot(xx, y) / md; x.beginPath(); x.arc(xx, y, rr, 0, TAU); x.fill();
        }
        x.lineWidth = H / 32; x.strokeStyle = "#111"; x.strokeRect(x.lineWidth / 2, x.lineWidth / 2, W - x.lineWidth, H - x.lineWidth);
      });
      var lw = H / 55, r = rng(Math.floor(t * 24) + 2), P = plane(t, H, 0.24 * H), L = 0.24 * H, i;
      var dx = Math.cos(P.f.a), dy = Math.sin(P.f.a);
      c.lineCap = "round"; c.strokeStyle = "#111";
      for (i = 0; i < 6; i++) {
        var o = (i - 2.5) * L * 0.15, b = L * (0.45 + r() * 0.3), len = L * (0.5 + r() * 0.9);
        var sx = P.x - dx * b - dy * o, sy = P.y - dy * b + dx * o;
        c.lineWidth = lw * (0.5 + r() * 0.5); c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx - dx * len, sy - dy * len); c.stroke();
      }
      for (i = 3; i >= 1; i--) {
        var tp = t - i * 0.055; if (tp < 0) continue;
        var p = pos(tp); c.beginPath(); c.arc(p[0] * H, p[1] * H, H * (0.028 + i * 0.012), 0, TAU);
        c.fillStyle = "#fff"; c.fill(); c.lineWidth = lw * 0.6; c.stroke();
      }
      if (t > 0.3 && t < 0.86) {
        var bx = H * 0.24, by = H * 0.2, star = [];
        for (i = 0; i < 24; i++) { var ra = (i % 2 ? 0.09 : 0.14) * H, an = i / 24 * TAU; star.push([bx + Math.cos(an) * ra * 1.35, by + Math.sin(an) * ra]); }
        fill(c, star, "#fff"); c.lineWidth = lw * 0.7; c.lineJoin = "miter"; c.stroke();
        c.font = "italic 900 " + Math.round(H * 0.058) + "px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
        c.save(); c.translate(bx, by); c.rotate(-0.12); c.fillStyle = "#e8402f"; c.fillText("ZOOM!", 0, 0);
        c.lineWidth = Math.max(1, lw * 0.35); c.strokeText("ZOOM!", 0, 0); c.restore();
      }
      c.lineJoin = "round";
      fill(c, P.far, "#d9dee8"); fill(c, P.keel, "#e8402f");
      c.save(); shape(c, P.keel); c.clip(); c.fillStyle = "#a8231a";
      for (var y = 0; y < H; y += lw * 1.6) for (var x = (y / lw) % 2 ? 0 : lw * 0.8; x < W; x += lw * 1.6) { if (Math.abs(x - P.x) > L || Math.abs(y - P.y) > L) continue; c.beginPath(); c.arc(x, y, lw * 0.38, 0, TAU); c.fill(); }
      c.restore(); fill(c, P.wing, "#fff");
      c.lineWidth = lw; c.strokeStyle = "#111";
      [P.far, P.keel, P.wing].forEach(function (f) { shape(c, f); c.stroke(); });
    },

    // calm flat shapes, no outlines, a dashed path
    flat: function (c, W, H, t, st) {
      bg(c, st, "flat", function (x, W, H) {
        x.fillStyle = "#ffe9dc"; x.fillRect(0, 0, W, H);
        x.fillStyle = "#ffb185"; x.beginPath(); x.arc(H * 1.1, H * 0.24, H * 0.13, 0, TAU); x.fill();
        x.fillStyle = "#9ad9c6"; x.beginPath(); x.ellipse(H * 0.3, H * 1.08, H * 0.75, H * 0.3, 0, 0, TAU); x.fill();
        x.fillStyle = "#64bfa9"; x.beginPath(); x.ellipse(H * 1.2, H * 1.12, H * 0.62, H * 0.3, 0, 0, TAU); x.fill();
        x.fillStyle = "#fff";
        [[0.1, 0.16, 0.24], [0.98, 0.56, 0.2]].forEach(function (q) {
          var h = H * 0.06; x.beginPath(); x.roundRect(q[0] * H, q[1] * H, q[2] * H, h, h / 2); x.fill();
          x.beginPath(); x.arc((q[0] + q[2] * 0.4) * H, q[1] * H, h * 0.75, 0, TAU); x.fill();
        });
      });
      var P = plane(t, H, 0.24 * H);
      c.strokeStyle = "#ff6f59"; c.lineWidth = H / 70; c.lineCap = "round"; c.setLineDash([H / 40, H / 28]);
      line(c, trail(t, H, 0.36, 36).slice(0, -3)); c.stroke(); c.setLineDash([]);
      fill(c, P.far, "#c9d5ea"); fill(c, P.keel, "#2f3e6e"); fill(c, P.wing, "#ffffff");
    },

    // one thin stroke: the whole path so far, then the plane outline
    line: function (c, W, H, t) {
      c.fillStyle = "#f7f5f0"; c.fillRect(0, 0, W, H);
      var P = plane(t, H, 0.24 * H), lw = Math.max(1, H / 150);
      c.strokeStyle = "rgba(29,29,31,.5)"; c.lineWidth = lw * 0.8; c.lineCap = "round"; c.lineJoin = "round";
      line(c, trail(t, H, 1, Math.ceil(90 * t) + 2).slice(0, -2)); c.stroke();
      c.strokeStyle = "#1d1d1f"; c.lineWidth = lw * 1.1;
      line(c, [P.F, P.N, P.far[1], P.A, P.F, P.K, P.N]); c.stroke();
    },

    // gradients, a specular edge, a soft drop shadow and a mirror floor
    gloss: function (c, W, H, t, st) {
      var fy = H * 0.8;
      bg(c, st, "gloss", function (x, W, H) {
        var g = x.createRadialGradient(W * 0.7, H * 0.05, 0, W * 0.7, H * 0.05, W * 0.9);
        g.addColorStop(0, "#4b98f5"); g.addColorStop(1, "#0a2160"); x.fillStyle = g; x.fillRect(0, 0, W, H);
        var f = x.createLinearGradient(0, fy, 0, H); f.addColorStop(0, "#14408f"); f.addColorStop(1, "#050f29");
        x.fillStyle = f; x.fillRect(0, fy, W, H - fy);
        var hl = x.createLinearGradient(0, 0, W, 0); hl.addColorStop(0, "rgba(255,255,255,0)"); hl.addColorStop(0.6, "rgba(255,255,255,.55)"); hl.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = hl; x.fillRect(0, fy, W, Math.max(1, H / 160));
        [[0.2, 0.25, 0.06], [0.95, 0.15, 0.04], [1.2, 0.5, 0.05]].forEach(function (b) {
          var rg = x.createRadialGradient(b[0] * H, b[1] * H, 0, b[0] * H, b[1] * H, b[2] * H);
          rg.addColorStop(0, "rgba(160,210,255,.35)"); rg.addColorStop(1, "rgba(160,210,255,0)"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
        });
      });
      var P = plane(t, H, 0.24 * H), tr = trail(t, H, 0.34, 28), i;
      var sh = Math.max(0.15, 1 - Math.abs(fy - P.y) / H), sg = c.createRadialGradient(P.x, fy + H * 0.06, 0, P.x, fy + H * 0.06, H * 0.14);
      sg.addColorStop(0, "rgba(0,4,20," + (0.5 * sh).toFixed(3) + ")"); sg.addColorStop(1, "rgba(0,4,20,0)");
      c.save(); c.translate(P.x, fy + H * 0.06); c.scale(1, 0.3); c.translate(-P.x, -(fy + H * 0.06)); c.fillStyle = sg; c.fillRect(0, 0, W, H * 2); c.restore();
      c.lineCap = "round"; c.lineWidth = H / 55;
      for (i = 1; i < tr.length; i++) { c.strokeStyle = "rgba(220,240,255," + (0.35 * i / tr.length).toFixed(3) + ")"; c.beginPath(); c.moveTo(tr[i - 1][0], tr[i - 1][1]); c.lineTo(tr[i][0], tr[i][1]); c.stroke(); }
      function body(P, shadow) {
        if (shadow) {
          c.save(); c.shadowColor = "rgba(0,8,40,.5)"; c.shadowBlur = H / 22; c.shadowOffsetY = H / 50;
          [P.far, P.keel, P.wing].forEach(function (f) { fill(c, f, "#9fb3d6"); }); c.restore();
        }
        function grad(f, a, b, c0, c1) { var g = c.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, c0); g.addColorStop(1, c1); fill(c, f, g); }
        grad(P.far, P.N, P.far[1], "#dbe5f5", "#7f98c6");
        grad(P.keel, P.F, P.K, "#ff6d74", "#9c0b26");
        grad(P.wing, P.F, P.A, "#ffffff", "#aebfdf");
        c.save(); c.strokeStyle = "rgba(255,255,255,.95)"; c.lineWidth = H / 90; c.shadowColor = "#fff"; c.shadowBlur = H / 40;
        c.beginPath(); c.moveTo(P.N[0] * 0.8 + P.A[0] * 0.2, P.N[1] * 0.8 + P.A[1] * 0.2); c.lineTo(P.N[0] * 0.25 + P.A[0] * 0.75, P.N[1] * 0.25 + P.A[1] * 0.75); c.stroke(); c.restore();
      }
      c.save(); c.beginPath(); c.rect(0, fy, W, H - fy); c.clip(); c.globalAlpha = 0.28;
      c.translate(0, 2 * fy); c.scale(1, -1); body(P, false); c.restore();
      body(P, true);
    },

    // a stud baseplate sky; the plane and its smoke snapped to a grid of studded bricks
    brick: function (c, W, H, t, st) {
      bg(c, st, "brick", function (x, W, H) {
        x.fillStyle = "#3f97d6"; x.fillRect(0, 0, W, H);
        var s = H / 14;
        for (var y = s / 2; y < H; y += s) for (var xx = s / 2; xx < W; xx += s) {
          x.fillStyle = "rgba(0,30,70,.18)"; x.beginPath(); x.arc(xx + s * 0.04, y + s * 0.06, s * 0.31, 0, TAU); x.fill();
          x.fillStyle = "#55a9e5"; x.beginPath(); x.arc(xx, y, s * 0.3, 0, TAU); x.fill();
          x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = s * 0.06; x.beginPath(); x.arc(xx, y, s * 0.22, Math.PI * 0.9, Math.PI * 1.6); x.stroke();
        }
      });
      var cell = H / 28, gw = Math.ceil(W / cell), gh = 28, i, j;
      function brick(i, j, col) {
        var x = i * cell, y = j * cell;
        c.fillStyle = col; c.fillRect(x, y, cell, cell);
        c.fillStyle = "rgba(0,0,0,.22)"; c.fillRect(x, y + cell * 0.86, cell, cell * 0.14); c.fillRect(x + cell * 0.86, y, cell * 0.14, cell);
        c.fillStyle = "rgba(255,255,255,.28)"; c.fillRect(x, y, cell, cell * 0.1);
        c.fillStyle = "rgba(0,0,0,.2)"; c.beginPath(); c.arc(x + cell * 0.47, y + cell * 0.5, cell * 0.3, 0, TAU); c.fill();
        c.fillStyle = col; c.beginPath(); c.arc(x + cell * 0.43, y + cell * 0.44, cell * 0.28, 0, TAU); c.fill();
        c.fillStyle = "rgba(255,255,255,.4)"; c.beginPath(); c.arc(x + cell * 0.36, y + cell * 0.37, cell * 0.1, 0, TAU); c.fill();
      }
      for (i = 2; i <= 6; i++) {
        var tp = t - i * 0.03; if (tp < 0) break;
        var p = pos(tp); c.globalAlpha = 1 - i * 0.14; brick(Math.floor(p[0] * H / cell), Math.floor(p[1] * H / cell), "#f2f2f2");
      }
      c.globalAlpha = 1;
      var P = plane(t, H, 0.3 * H), m = raster(gw, gh, cell, [P.far, P.keel, P.wing]), col = [null, "#ffcd03", "#f4f4f4", "#e3262b"];
      for (j = 0; j < gh; j++) for (i = 0; i < gw; i++) if (m[j * gw + i]) brick(i, j, col[m[j * gw + i]]);
    },

    // soft lumpy clay that changes shape a little every frame, 12 frames a second
    clay: function (c, W, H, t, st) {
      var fi = Math.floor(t * 48); t = fi / 48;
      bg(c, st, "clay", function (x, W, H) {
        x.fillStyle = "#c9e1e6"; x.fillRect(0, 0, W, H);
        var r = rng(21), i;
        for (i = 0; i < 18; i++) {
          var gx = r() * W, gy = r() * H, gr = (0.05 + r() * 0.18) * H, g = x.createRadialGradient(gx, gy, 0, gx, gy, gr);
          g.addColorStop(0, i % 2 ? "rgba(255,255,255,.2)" : "rgba(40,90,110,.08)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
        }
        [[0.22, 0.2], [1.05, 0.14]].forEach(function (q) {
          var cx = q[0] * H, cy = q[1] * H, g = x.createRadialGradient(cx - H * 0.04, cy - H * 0.05, 0, cx, cy, H * 0.12);
          g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#e6ddd5"); x.fillStyle = g;
          [[0, 0, 0.06], [-0.07, 0.02, 0.045], [0.07, 0.02, 0.05]].forEach(function (b) { x.beginPath(); x.arc(cx + b[0] * H, cy + b[1] * H, b[2] * H, 0, TAU); x.fill(); });
        });
        var top = [];
        for (i = 0; i <= 12; i++) top.push([i / 12 * W, H * (0.84 + Math.sin(i * 1.7) * 0.015 + r() * 0.012)]);
        var gg = x.createLinearGradient(0, H * 0.82, 0, H); gg.addColorStop(0, "#a9d585"); gg.addColorStop(1, "#6fa552");
        shape(x, top.concat([[W, H], [0, H]])); x.fillStyle = gg; x.fill();
        line(x, top); x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = H / 80; x.stroke();
      });
      var r = rng(fi * 13 + 5), P = plane(t, H, 0.2 * H, (r() - 0.5) * H * 0.006, (r() - 0.5) * H * 0.006, (r() - 0.5) * 0.05), amp = H * 0.012;
      function lump(f) {
        var pts = [];
        for (var e = 0; e < 3; e++) {
          var a = f[e], b = f[(e + 1) % 3];
          for (var s = 0; s < 4; s++) pts.push([a[0] + (b[0] - a[0]) * s / 4 + (r() - 0.5) * amp, a[1] + (b[1] - a[1]) * s / 4 + (r() - 0.5) * amp]);
        }
        c.beginPath();
        var m0 = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2]; c.moveTo(m0[0], m0[1]);
        for (var i = 1; i <= pts.length; i++) { var p = pts[i % pts.length], q = pts[(i + 1) % pts.length]; c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
        c.closePath();
      }
      function soft(f, c0, c1) {
        var cx = (f[0][0] + f[1][0] + f[2][0]) / 3, cy = (f[0][1] + f[1][1] + f[2][1]) / 3, g = c.createRadialGradient(cx - H * 0.03, cy - H * 0.04, 0, cx, cy, H * 0.16);
        g.addColorStop(0, c0); g.addColorStop(1, c1); lump(f); c.fillStyle = g; c.fill();
      }
      c.save(); c.shadowColor = "rgba(90,50,20,.35)"; c.shadowBlur = H / 26; c.shadowOffsetY = H / 30;
      [P.far, P.keel, P.wing].forEach(function (f) { lump(f); c.fillStyle = "#d9c4ab"; c.fill(); }); c.restore();
      soft(P.far, "#fff6e2", "#d6c19c"); soft(P.keel, "#f3835a", "#b6401c"); soft(P.wing, "#ffe7a6", "#dcac46");
      var cx = P.N[0] * 0.3 + P.A[0] * 0.35 + P.F[0] * 0.35, cy = P.N[1] * 0.3 + P.A[1] * 0.35 + P.F[1] * 0.35;
      c.strokeStyle = "rgba(120,80,40,.16)"; c.lineWidth = Math.max(0.6, H / 260);
      for (var k = 1; k <= 3; k++) { c.beginPath(); c.arc(cx, cy, H * 0.012 * k, 0.4, 2.6); c.stroke(); }
    }
  };

  // ---- cards, the clock and the dialog ------------------------------------------------------------
  var all = [], current = null, hovered = null, armed = null, raf = 0, lastPointer = "mouse";

  function make(canvas, look) { return { cv: canvas, c: canvas.getContext("2d"), look: look, W: 0, H: 0, dpr: 1, cache: {}, clock: null, on: false, vis: true }; }
  function tOf(st) { return st.clock && st.clock.currentTime != null ? (STILL + st.clock.currentTime / PERIOD) % 1 : STILL; }
  function paint(st) {
    if (!st.W || !st.c) return;
    var c = st.c; c.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); c.clearRect(0, 0, st.W, st.H);
    c.save(); LOOKS[st.look](c, st.W, st.H, tOf(st), st); c.restore();
  }
  function fit(st) {
    var b = st.cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    if (!b.width || !b.height) return;
    if (b.width !== st.W || b.height !== st.H || d !== st.dpr) {
      st.W = b.width; st.H = b.height; st.dpr = d;
      st.cv.width = Math.round(b.width * d); st.cv.height = Math.round(b.height * d);
    }
    paint(st);
  }
  function loop() {
    raf = 0; var any = false;
    all.forEach(function (st) { if (st.clock) { paint(st); any = true; } });
    if (any) raf = requestAnimationFrame(loop);
  }
  function sync(st) {
    var go = st.on && st.vis && !reduce.matches && !document.hidden && !!st.cv.animate;
    if (go && !st.clock) { st.clock = st.cv.animate([{ opacity: 1 }, { opacity: 1 }], { duration: PERIOD, iterations: Infinity }); st.clock.id = "style flight"; }
    else if (!go && st.clock) { st.clock.cancel(); st.clock = null; paint(st); }
    if (st.card) st.card.classList.toggle("is-playing", go);
    if (go && !raf) raf = requestAnimationFrame(loop);
  }
  function play(st) {
    if (current === st) return;
    var prev = current; current = st;
    if (prev) { prev.on = false; sync(prev); }
    if (st) { st.on = true; sync(st); }
  }
  function focusedCard() {
    for (var i = 0; i < all.length; i++) if (all[i].card && all[i].card === document.activeElement && visibleFocus(all[i].card)) return all[i];
    return null;
  }
  function visibleFocus(el) { try { return el.matches(":focus-visible"); } catch (e) { return true; } }

  var DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function when(d) { return DAY[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; }
  var BRIEF = new Date(2026, 10, 9);   // the demo's today: Monday 9 November 2026
  function ready(n) { var d = new Date(BRIEF.getTime()); while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n--; } return when(d); }

  function init() {
    var items = document.querySelectorAll(".sf-item");
    if (!items.length) return;
    var dlg = document.querySelector(".sf-dialog"), dst = null, opener = null, shown = null;
    var picked = document.querySelector(".sfd-picked");

    items.forEach(function (item, n) {
      var cv = item.querySelector(".sf-canvas"), card = item.querySelector(".sf-card"), open = item.querySelector(".sf-open");
      if (!cv || !cv.getContext || !LOOKS[item.dataset.look]) return;
      var st = make(cv, item.dataset.look); st.card = card; st.item = item; st.n = n + 1;
      all.push(st);
      card.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hovered = st; play(st); } });
      card.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hovered = null; if (current === st) play(focusedCard()); } });
      card.addEventListener("focus", function () { if (visibleFocus(card)) play(st); });
      card.addEventListener("blur", function () { if (current === st && armed !== st) play(hovered); });
      card.addEventListener("click", function (e) {
        // a tap on a touch screen plays first; a second tap (or Open) opens
        if (e.detail && lastPointer === "touch" && armed !== st && !reduce.matches) { armed = st; play(st); return; }
        show(st, card);
      });
      if (open && dlg) { open.hidden = false; open.addEventListener("click", function () { show(st, open); }); }
    });

    document.addEventListener("pointerdown", function (e) {
      lastPointer = e.pointerType;
      if (armed && !armed.item.contains(e.target)) { var a = armed; armed = null; if (current === a) play(null); }
    }, true);

    if (dlg && dlg.showModal) {
      var dcv = dlg.querySelector(".sf-d-canvas");
      dst = make(dcv, "pixel"); all.push(dst);
      var close = dlg.querySelector(".sf-d-close"), pick = dlg.querySelector(".sf-d-pick");
      close.addEventListener("click", function () { dlg.close(); });
      pick.addEventListener("click", function () {
        all.forEach(function (s) { if (s.item) s.item.classList.toggle("is-picked", s === shown); });
        if (picked) picked.textContent = "Picked: " + shown.card.querySelector(".sf-name").textContent + ", " +
          shown.card.querySelector(".sf-price .num").textContent + ", ready " + ready(+shown.card.dataset.days) + ".";
        dlg.close();
      });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
      // keep Tab and Shift+Tab inside the dialog
      dlg.addEventListener("keydown", function (e) {
        if (e.key !== "Tab") return;
        var f = dlg.querySelectorAll("button"), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
      dlg.addEventListener("close", function () {
        dst.on = false; sync(dst);
        if (opener && opener.isConnected) opener.focus();
      });
    }

    function show(st, from) {
      if (!dst) return;
      shown = st; opener = from; armed = null; play(null);
      var card = st.card, days = +card.dataset.days;
      dlg.setAttribute("data-look", st.look);
      dlg.querySelector(".sf-d-count").textContent = "Style " + st.n + " of " + items.length;
      dlg.querySelector("#sf-d-name").textContent = card.querySelector(".sf-name").textContent;
      dlg.querySelector("#sf-d-desc").textContent = card.dataset.desc || "";
      var price = dlg.querySelector(".sf-d-price"), num = document.createElement("span");
      num.className = "num"; num.textContent = card.querySelector(".sf-price .num").textContent;
      price.replaceChildren(num, " per 15 second spot. Brief us today (" + when(BRIEF) + ") and it is ready " + ready(days) + ", " + days + " working days.");
      dst.look = st.look; dst.cache = {}; dst.lo = null;
      dlg.showModal();
      dst.on = true; fit(dst); sync(dst);
    }

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function (es) { es.forEach(function (e) { all.forEach(function (s) { if (s.cv === e.target) fit(s); }); }); });
      all.forEach(function (s) { ro.observe(s.cv); });
    } else window.addEventListener("resize", function () { all.forEach(fit); });
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { all.forEach(function (s) { if (s.cv === e.target) { s.vis = e.isIntersecting; sync(s); } }); });
      });
      all.forEach(function (s) { if (s !== dst) io.observe(s.cv); });
    }
    document.addEventListener("visibilitychange", function () { all.forEach(sync); });
    reduce.addEventListener("change", function () { all.forEach(sync); });
    window.matchMedia("(resolution: 1dppx)").addEventListener("change", function () { all.forEach(fit); });
    all.forEach(fit);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
