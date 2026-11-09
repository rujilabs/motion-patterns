/*
 * laser-line.js: in every .laserline, a WebGL fragment shader on its .ll-canvas draws a wooden board and
 * a laser that engraves the .ll-name text into it, row by row like a real raster engraver: a white hot
 * spot runs back and forth, the wood chars behind it and glows orange while it cools, sparks fly off the
 * spot and smoke rises from the row being burnt. The name stays real HTML text: the script draws the
 * mask from that element's own font and place, then makes the HTML text transparent over its engraving.
 *   <div class="laserline">
 *     <canvas class="ll-canvas" aria-hidden="true"></canvas>
 *     <p class="ll-name">Nurul Aina</p>
 *     <button type="button" class="ll-pause" aria-pressed="false" hidden>Pause</button>
 *   </div>
 *   <form class="ll-form" hidden> <input class="ll-input"> <button>Engrave</button> </form>
 * A form with class ll-form (inside the .laserline, or pointed to with data-ll-form="#id") changes the
 * name and engraves it again. Colours come from --ll-wood, --ll-grain and --ll-burn (6 digit hex).
 * The maths: wood grain is fbm value noise (a 64 x 64 random texture, LINEAR on smoothstepped
 * coordinates) stretched along the board, bending sine streaks. The scan is a boustrophedon: a pixel in
 * row k at share x of the row is reached at s = k + x (even rows) or k + 1 - x (odd rows), so it is burnt
 * once the scan s passes it, and its glow cools as exp(-1.2 (s - its s)). The mask is the name drawn
 * into a 2D canvas; four offset reads of it make the scorch halo. Sparks are a pool of six in JS (spawned
 * at the spot while it fires, thrown up and pulled down by gravity), drawn as Gaussian streaks. Smoke is
 * fbm noise moved up the board, kept to the box of the name and above the current row; the move wraps at
 * 64 noise units, the texture's period, so it never jumps.
 * One loop (engrave, hold, a fresh board) runs on a Web Animations clock ("laser engraving"), so the
 * gallery timeline and the Pause button stop it. One full-screen triangle, drawing buffer at most
 * 1.5 x the CSS size (1 x if the first 30 frames average over 20 ms), no allocation per frame, no drawing
 * off screen or in a hidden tab, the context released on pagehide and rebuilt after webglcontextlost.
 * Without WebGL the CSS fallback shows the name as plain engraved text on a wood gradient (the form
 * still changes it); under reduced motion one still frame of the finished engraving is drawn.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 9000;                  // one loop, ms: the clock period
  var T0 = 600, T1 = 6000, T2 = 8400; // engraving starts, engraving ends, the board is swapped
  var ROW = 2.2;                      // engraver row height, CSS px
  var NS = 6;                         // sparks in the pool

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",          // drawing buffer, px
    "uniform vec4 u_box;",          // the name's box: left, bottom, width, height (buffer px, y up)
    "uniform vec4 u_scan;",         // row height, rows, scan position s, burn opacity
    "uniform vec4 u_head;",         // spot x, y, fire (1 firing, 0 aiming, -1 hidden), smoke amount
    "uniform vec2 u_t;",            // smoke offset (noise units, wraps at 64), buffer px per CSS px
    "uniform vec4 u_sp[" + NS + "];", // sparks: x, y, trail x, trail y (buffer px)
    "uniform sampler2D u_mask;",
    "uniform sampler2D u_rnd;",
    "uniform vec3 u_wood;",
    "uniform vec3 u_grain;",
    "uniform vec3 u_burn;",
    "float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return texture2D(u_rnd, (i + f + 0.5) / 64.0).r; }",
    // octaves at exactly 1, 2 and 4: a shift of 64 is a whole period of every octave
    "float fbm(vec2 p){ return (0.5 * vn(p) + 0.25 * vn(p * 2.0 + 17.0) + 0.125 * vn(p * 4.0 + 31.0)) / 0.875; }",
    "float gauss(float x){ x = min(abs(x), 6.0); return exp(-x * x); }",
    "void main(){",
    "  vec2 fc = gl_FragCoord.xy;",
    "  float px = u_t.y;",
    "  vec2 p = fc / px;",
    // the board: streaks of grain that wander along its length
    "  float g = fbm(vec2(p.x * 0.007, p.y * 0.06));",
    "  float streak = 0.5 + 0.5 * sin(p.y * 0.42 + g * 14.0);",
    "  float fine = vn(vec2(p.x * 0.05, p.y * 1.1));",
    "  vec3 col = mix(u_wood, u_grain, streak * streak * 0.55 + fine * 0.18);",
    "  vec2 e = (fc - 0.5 * u_res) / u_res;",
    "  col *= 1.0 - 0.22 * dot(e, e);",
    // the engraving: burnt once the scan has passed this pixel
    "  vec2 uv = fc / u_res;",
    "  float m = texture2D(u_mask, uv).r;",
    "  vec2 o = 2.5 * px / u_res;",
    "  float halo = 0.25 * (texture2D(u_mask, uv + o).r + texture2D(u_mask, uv - o).r + texture2D(u_mask, uv + vec2(o.x, -o.y)).r + texture2D(u_mask, uv - vec2(o.x, -o.y)).r);",
    "  float row = floor((u_box.y + u_box.w - fc.y) / u_scan.x);",
    "  float xf = clamp((fc.x - u_box.x) / u_box.z, 0.0, 1.0);",
    "  float at = row + mix(xf, 1.0 - xf, mod(row, 2.0));",
    "  float done = step(at, u_scan.z) * u_scan.w;",
    "  col *= 1.0 - 0.35 * halo * done;",
    "  vec3 charr = u_burn * (0.8 + 0.4 * fine);",
    "  col = mix(col, charr, m * done * 0.94);",
    "  float heat = m * done * exp(-1.2 * max(u_scan.z - at, 0.0));",
    "  col += vec3(1.0, 0.42, 0.08) * heat * 1.4;",
    // smoke from the row being burnt, kept to the name's box
    "  if (u_head.w > 0.01) {",
    "    float dy = fc.y - u_head.y;",
    "    float inx = smoothstep(u_box.x - 24.0 * px, u_box.x + 20.0 * px, fc.x) * (1.0 - smoothstep(u_box.x + u_box.z - 20.0 * px, u_box.x + u_box.z + 24.0 * px, fc.x));",
    "    float rise = smoothstep(-6.0 * px, 12.0 * px, dy) * exp(-max(dy, 0.0) / (80.0 * px));",
    "    float n = fbm(p / 26.0 + vec2(0.15 * u_t.x, -u_t.x));",
    "    float sm = u_head.w * inx * rise * smoothstep(0.42, 0.78, n);",
    "    col = mix(col, vec3(0.9, 0.89, 0.87), sm * 0.6);",
    "  }",
    // sparks: short hot streaks
    "  float sp = 0.0;",
    "  for (int i = 0; i < " + NS + "; i++) {",
    "    vec4 s = u_sp[i];",
    "    vec2 ab = -s.zw, ap = fc - s.xy;",
    "    float l2 = dot(ab, ab);",
    "    float k = clamp(dot(ap, ab) / max(l2, 0.001), 0.0, 1.0);",
    "    sp += gauss(length(ap - ab * k) / (0.9 * px)) * clamp(sqrt(l2) / (5.0 * px), 0.0, 1.0) * (1.0 - 0.6 * k);",
    "  }",
    "  col += vec3(1.0, 0.78, 0.4) * min(sp, 1.5);",
    // the spot: white hot while it fires, a dim red aiming dot between strokes
    "  float d = length(fc - u_head.xy) / px;",
    "  float fire = max(u_head.z, 0.0);",
    "  col += fire * (vec3(1.0, 0.96, 0.88) * gauss(d / 2.4) * 1.8 + vec3(1.0, 0.5, 0.15) * gauss(d / 10.0) * 0.7);",
    "  col += step(-0.5, u_head.z) * (1.0 - fire) * vec3(1.0, 0.12, 0.08) * gauss(d / 2.0) * 0.7;",
    "  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function setup(root) {
    var canvas = root.querySelector(".ll-canvas"), name = root.querySelector(".ll-name");
    if (!canvas || !name || canvas.llOn) return;
    canvas.llOn = true;
    var formSel = root.getAttribute("data-ll-form");
    var form = formSel ? document.querySelector(formSel) : root.querySelector(".ll-form");
    var input = form && form.querySelector(".ll-input");
    var baseSize = parseFloat(getComputedStyle(name).fontSize) || 64;

    // shrink the name to fit the board (the HTML text and the engraving share this size)
    function fitName() {
      name.style.fontSize = "";
      baseSize = parseFloat(getComputedStyle(name).fontSize) || baseSize;
      var size = baseSize, room = root.clientWidth * 0.86;
      while (name.scrollWidth > room && size > 14) { size -= 2; name.style.fontSize = size + "px"; }
    }
    function setName(v) {
      v = (v || "").replace(/\s+/g, " ").trim().slice(0, 24);
      if (!v) return false;
      name.textContent = v;
      fitName();
      return true;
    }

    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (form) {
      form.hidden = false;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (input && setName(input.value) && engrave) engrave();
      });
    }
    fitName();
    if (!gl) return;   // no WebGL: the CSS fallback shows the name, and the form still changes it
    var engrave = null;
    var btn = root.querySelector(".ll-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, ready = false, maskTex = null;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var wood, grain, burn, maskData = null, mw = 0, mh = 0;
    var bx = 0, by = 0, bw = 1, bh = 1, rowH = 3, rows = 1;
    var smoke = 0, seed = 7;
    var sx = new Float32Array(NS), sy = new Float32Array(NS), svx = new Float32Array(NS), svy = new Float32Array(NS);
    var sl = new Float32Array(NS), sm = new Float32Array(NS), spk = new Float32Array(NS * 4), spawnAcc = 0;

    function rand() { seed = (seed * 1103515245 + 12345) >>> 0; return (seed >>> 8) / 16777216; }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("laser-line shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("laser-line link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "box", "scan", "head", "t", "sp", "mask", "rnd", "wood", "grain", "burn"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed, so every load grows the same wood
      var bytes = new Uint8Array(64 * 64 * 4), s = 20261113;
      for (var i = 0; i < bytes.length; i++) { s = (s * 1103515245 + 12345) >>> 0; bytes[i] = s >>> 24; }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.uniform1i(U.rnd, 1);
      maskTex = gl.createTexture();
      gl.uniform1i(U.mask, 0);
      ready = false;
      return true;
    }

    // draw the name into a 2D canvas the size of the drawing buffer, from the HTML text's own font and place
    function drawMask() {
      if (!prog || lost || !w) return;
      var c2 = document.createElement("canvas"), x2;
      c2.width = w; c2.height = h;
      x2 = c2.getContext("2d");
      var cs = getComputedStyle(name), cr = canvas.getBoundingClientRect(), er = name.getBoundingClientRect();
      var size = parseFloat(cs.fontSize) * scale;
      x2.fillStyle = "#000"; x2.fillRect(0, 0, w, h);
      x2.fillStyle = "#fff";
      x2.font = cs.fontStyle + " " + cs.fontWeight + " " + size + "px " + cs.fontFamily;
      x2.textAlign = "center"; x2.textBaseline = "middle";
      var cx = (er.left + er.width / 2 - cr.left) * scale, cy = (er.top + er.height / 2 - cr.top) * scale;
      var text = name.textContent;
      x2.fillText(text, cx, cy);
      var mt = x2.measureText(text), pad = 3 * scale;
      var l = cx - (mt.actualBoundingBoxLeft || mt.width / 2) - pad, r = cx + (mt.actualBoundingBoxRight || mt.width / 2) + pad;
      var t = cy - (mt.actualBoundingBoxAscent || size * 0.4) - pad, b = cy + (mt.actualBoundingBoxDescent || size * 0.3) + pad;
      bx = Math.max(0, l); bw = Math.max(1, Math.min(w, r) - bx);
      by = Math.max(0, h - b); bh = Math.max(1, Math.min(h, h - t) - by);
      rowH = Math.max(1, ROW * scale); rows = Math.max(1, Math.ceil(bh / rowH));
      maskData = x2.getImageData(0, 0, w, h).data; mw = w; mh = h;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, c2);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
    }

    // is the mask lit at (x, y) in buffer px, y up?
    function lit(x, y) {
      if (!maskData) return false;
      var ix = Math.round(x), iy = mh - 1 - Math.round(y);
      if (ix < 0 || iy < 0 || ix >= mw || iy >= mh) return false;
      return maskData[(iy * mw + ix) * 4] > 110;
    }

    function clockMs() { return clock && clock.currentTime != null ? clock.currentTime % PERIOD : T1 + 1200; }

    // the scan and spot at a moment of the loop; under reduced motion the finished board
    var st = { s: 0, fade: 1, hx: 0, hy: 0, fire: -1, on: false };
    function scanAt(ms) {
      var perRow = (T1 - T0) / rows;
      st.fade = ms > T2 ? Math.max(0, 1 - (ms - T2) / (PERIOD - T2)) : 1;
      st.on = ms >= T0 && ms < T1;
      st.s = ms < T0 ? -1 : (ms - T0) / perRow;   // keeps running past the last row so the glow cools
      if (st.on) {
        var k = Math.floor(st.s), f = st.s - k, xf = k % 2 ? 1 - f : f;
        st.hx = bx + xf * bw; st.hy = by + bh - (k + 0.5) * rowH;
        st.fire = lit(st.hx, st.hy) ? 1 : 0;
      } else st.fire = -1;
    }

    function render(ms) {
      if (!prog || lost || !w || !ready) return;
      scanAt(ms);
      gl.uniform2f(U.res, w, h);
      gl.uniform4f(U.box, bx, by, bw, bh);
      gl.uniform4f(U.scan, rowH, rows, st.s, st.fade);
      gl.uniform4f(U.head, st.hx, st.hy, st.fire, smoke);
      gl.uniform2f(U.t, (ms / 1000 * 0.9) % 64, scale);
      for (var i = 0; i < NS; i++) {
        var a = sl[i] > 0 ? sl[i] / sm[i] : 0;
        spk[i * 4] = sx[i]; spk[i * 4 + 1] = sy[i];
        spk[i * 4 + 2] = svx[i] * 0.03 * a; spk[i * 4 + 3] = svy[i] * 0.03 * a;
      }
      gl.uniform4fv(U.sp, spk);
      gl.uniform3f(U.wood, wood[0], wood[1], wood[2]);
      gl.uniform3f(U.grain, grain[0], grain[1], grain[2]);
      gl.uniform3f(U.burn, burn[0], burn[1], burn[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      root.classList.add("is-live");
    }

    // sparks: spawned at the spot while it fires, thrown up, pulled down; positions in buffer px, y up
    function stepSparks(dt) {
      var s = dt / 1000, alive = false, i;
      for (i = 0; i < NS; i++) {
        if (sl[i] <= 0) continue;
        sl[i] -= s;
        if (sl[i] <= 0) { sl[i] = 0; sx[i] = -1e4; sy[i] = -1e4; continue; }
        svy[i] -= 1500 * scale * s;
        sx[i] += svx[i] * s; sy[i] += svy[i] * s;
        alive = true;
      }
      if (st.fire === 1 && !paused) {
        spawnAcc += s * 34;
        while (spawnAcc >= 1) {
          spawnAcc -= 1;
          for (i = 0; i < NS && sl[i] > 0; i++);
          if (i === NS) break;
          sx[i] = st.hx; sy[i] = st.hy;
          svx[i] = (rand() * 2 - 1) * 380 * scale; svy[i] = (0.35 + rand() * 0.75) * 420 * scale;
          sm[i] = sl[i] = 0.16 + rand() * 0.2;
          alive = true;
        }
      }
      return alive;
    }
    function clearSparks() { for (var i = 0; i < NS; i++) { sl[i] = 0; sx[i] = -1e4; sy[i] = -1e4; } }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      var cs = getComputedStyle(root);
      wood = hex(cs.getPropertyValue("--ll-wood"), [0.89, 0.75, 0.55]);
      grain = hex(cs.getPropertyValue("--ll-grain"), [0.74, 0.55, 0.36]);
      burn = hex(cs.getPropertyValue("--ll-burn"), [0.2, 0.11, 0.06]);
      fitName();
      drawMask();
      if (reduce.matches) still(); else { render(clockMs()); kick(); }
    }

    var sparksAlive = false;
    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && ready && (!paused || sparksAlive); }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!onScreen || document.hidden || reduce.matches || lost || !prog || !ready) return;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      var ms = clockMs();
      scanAt(ms);
      if (!paused) smoke += ((st.on ? 1 : 0) - smoke) * (1 - Math.exp(-dt / (st.on ? 500 : 1400)));
      if (ms < T0) smoke = 0;
      sparksAlive = stepSparks(dt);
      render(ms);
      if (live()) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      clearSparks(); smoke = 0;
      render(T2 - 1);
    }

    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      kick();
    }
    engrave = function () {
      fit();
      clearSparks(); smoke = 0;
      if (reduce.matches || !clock) { still(); return; }
      clock.currentTime = 0;
      if (paused) setPaused(false);
      render(0); kick();
    };
    function sync() {
      if (reduce.matches) {
        if (clock) { clock.cancel(); clock = null; }
        if (btn) btn.hidden = true;
        still();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: PERIOD, iterations: Infinity });
        clock.id = "laser engraving";   // a timer only: it animates nothing visible
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      kick();
    }

    if (!build()) return;
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null; ready = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      root.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; if (build()) fit(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", function () { sync(); if (!reduce.matches) fit(); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fit);
    clearSparks();
    // wait for the web font, or the mask would be drawn in a fallback face
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(function () {
      if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else { window.addEventListener("resize", fit); fit(); }
      sync();
    });
  }

  function init() { document.querySelectorAll(".laserline").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
