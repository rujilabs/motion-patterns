/*
 * metal-badge.js: in every .metalbadge, the .mb-plate (real HTML text on a still brushed gradient) is
 * redrawn in WebGL on .mb-canvas as a brushed steel plate in 3D. The plate tilts toward the pointer (on
 * touch, drag a finger over it), sways slowly when nobody points, and a light band rolls across the
 * brushing as it turns. The plate's text is drawn into a 2D canvas, turned into a height map and
 * embossed: raised polished letters, a raised border and four screw heads.
 *   <div class="metalbadge">
 *     <div class="mb-plate"><p class="mb-shop">Shop</p><p class="mb-no">0418 2207</p><p class="mb-tier">Gold</p></div>
 *     <canvas class="mb-canvas" aria-hidden="true"></canvas>
 *     <button type="button" class="mb-pause" aria-pressed="false" hidden>Pause</button>
 *   </div>
 * The maths: each pixel casts a ray from a pinhole camera and meets the plate's plane (rotated by two
 * angles worked out in JS); a rounded box distance gives the outline and the bevel. The brushing is
 * value noise stretched 65 times along the plate. The light band is an anisotropic (Kajiya-Kay)
 * highlight: brightness pow(sqrt(1 - (T.H)^2), k), with T the brushing direction and H the half vector,
 * so the highlight is a streak across the brushing that slides as the plate turns.
 * The sway runs on a Web Animations clock ("brushed metal"), so the gallery timeline and the Pause
 * button stop it. One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first
 * 30 frames average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the
 * context released on pagehide and rebuilt after webglcontextlost. Under reduced motion it draws one
 * still, tilted frame.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 9000;          // one sway, ms
  var TW = 768, TH = 480;     // emboss map, plate aspect 1.6

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",          // drawing buffer, px
    "uniform float u_unit;",        // px per scene unit
    "uniform float u_size;",        // plate half width
    "uniform vec3 u_ax, u_ay, u_az;", // plate axes in camera space (az faces the camera)
    "uniform vec3 u_lp;",           // light position
    "uniform vec3 u_metal;",
    "uniform vec2 u_sh;",           // shadow offset
    "uniform sampler2D u_emb;",     // rg emboss normal, b letter mask
    "uniform sampler2D u_rnd;",     // 64 x 64 randoms
    "const float F = 2.4;",
    "float vn(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  return texture2D(u_rnd, (mod(i, 64.0) + f + 0.5) / 64.0).r;",
    "}",
    "float rbox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }",
    "void main(){",
    "  vec2 s = (gl_FragCoord.xy - 0.5 * u_res) / u_unit;",
    "  vec3 rd = normalize(vec3(s, F));",
    "  vec3 C = vec3(0.0, 0.0, F);",
    "  float dn = dot(rd, u_az);",
    "  float t = dot(C, u_az) / dn;",
    "  vec3 P = rd * t;",
    "  vec2 q = vec2(dot(P - C, u_ax), dot(P - C, u_ay));",
    "  vec2 hb = vec2(u_size, u_size / 1.6);",
    "  float rr = u_size * 0.1;",
    "  float d = rbox(q, hb, rr);",
    "  float px = t / (F * u_unit * max(-dn, 0.3));",
    "  float a = clamp(0.5 - d / px, 0.0, 1.0);",
    // a soft shadow on the board, offset by the tilt
    "  float ds = rbox(s - u_sh, hb, rr);",
    "  float sh = (1.0 - smoothstep(-0.03, 0.1, ds)) * 0.42;",
    "  if (a <= 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, sh); return; }",
    "  vec2 uv = vec2(q.x / hb.x, -q.y / hb.y) * 0.5 + 0.5;",
    "  vec4 e = texture2D(u_emb, uv);",
    "  vec2 nxy = (e.rg - 0.5) * 2.0;",
    "  float letter = e.b;",
    // bevel: the normal leans outward over the last strip of the plate (rounded box gradient)
    "  vec2 qq = abs(q) - hb + rr;",
    "  vec2 g = (qq.x > 0.0 || qq.y > 0.0) ? normalize(max(qq, 0.0)) : (qq.x > qq.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));",
    "  g *= sign(q);",
    "  float bw = u_size * 0.05;",
    "  float bev = clamp(1.0 + d / bw, 0.0, 1.0);",
    "  nxy += g * bev * bev * 1.6;",
    // the brushing: value noise stretched along x
    "  vec2 bq = q / u_size;",
    "  float st = 0.6 * vn(vec2(bq.x * 4.0, bq.y * 260.0)) + 0.4 * vn(vec2(bq.x * 1.5 + 9.0, bq.y * 90.0));",
    "  float brush = 1.0 - letter;",
    "  nxy.y += (st - 0.5) * 0.08 * brush;",
    "  vec3 N = normalize(nxy.x * u_ax + nxy.y * u_ay + u_az);",
    "  vec3 T = normalize(u_ax - N * dot(u_ax, N));",
    "  vec3 V = normalize(-P);",
    "  vec3 L = normalize(u_lp - P);",
    "  vec3 H = normalize(L + V);",
    "  float th = dot(T, H);",
    "  float sTH = sqrt(max(1.0 - th * th, 0.0));",
    "  float nl = max(dot(N, L), 0.0);",
    "  float aniso = (pow(sTH, 140.0) * (0.7 + 0.8 * st) + pow(sTH, 14.0) * 0.22) * nl;",
    "  float polish = pow(max(dot(N, H), 0.0), 90.0) * 1.3;",
    "  float spec = mix(aniso, polish, letter);",
    // a soft studio around it: bright overhead, warm board below
    "  vec3 R = reflect(-V, N);",
    "  vec3 env = mix(vec3(0.36, 0.27, 0.19), vec3(1.0, 0.98, 0.95), smoothstep(-0.2, 0.7, R.y));",
    "  vec3 col = u_metal * (0.34 + 0.38 * env + 0.18 * nl) * mix(0.86 + 0.26 * st, 0.62, letter);",
    "  col += spec * vec3(1.0, 0.98, 0.94);",
    "  col *= 1.0 - 0.35 * bev * smoothstep(0.0, 1.0, -dot(g, vec2(-0.5, 0.8)));",
    "  gl_FragColor = vec4(col * a, a + sh * (1.0 - a));",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  // the plate's text into a height map, then into emboss normals (rg) and a letter mask (b)
  function embossMap(root) {
    var c = document.createElement("canvas"); c.width = TW; c.height = TH;
    var x = c.getContext("2d");
    var shop = root.querySelector(".mb-shop"), no = root.querySelector(".mb-no"), tier = root.querySelector(".mb-tier");
    var fam = getComputedStyle(no || root).fontFamily || "sans-serif";
    x.fillStyle = "#000"; x.fillRect(0, 0, TW, TH);
    x.fillStyle = "#fff"; x.strokeStyle = "#fff";
    x.textAlign = "center"; x.textBaseline = "middle";
    function line(el, size, y, spacing) {
      if (!el) return;
      var tx = el.textContent.trim();
      if (getComputedStyle(el).textTransform === "uppercase") tx = tx.toUpperCase();
      x.font = "800 " + size + "px " + fam;
      if ("letterSpacing" in x) x.letterSpacing = spacing + "px";
      var w = x.measureText(tx).width;
      if (w > TW * 0.78) { x.font = "800 " + Math.floor(size * TW * 0.78 / w) + "px " + fam; }
      x.fillText(tx, TW / 2, y);
    }
    line(shop, 40, 112, 6);
    line(no, 128, 248, 6);
    line(tier, 34, 374, 4);
    if ("letterSpacing" in x) x.letterSpacing = "0px";
    // a raised border line
    x.lineWidth = 6;
    x.beginPath();
    if (x.roundRect) x.roundRect(30, 30, TW - 60, TH - 60, 36); else x.rect(30, 30, TW - 60, TH - 60);
    x.stroke();
    var raw = x.getImageData(0, 0, TW, TH).data, n = TW * TH;
    var h0 = new Float32Array(n), h1 = new Float32Array(n), i, j, k;
    for (i = 0; i < n; i++) h0[i] = raw[i * 4] / 255;
    // four domed screw heads in the corners (height only, not letters)
    var dome = new Float32Array(n);
    [[62, 62], [TW - 62, 62], [62, TH - 62], [TW - 62, TH - 62]].forEach(function (p) {
      for (j = -20; j <= 20; j++) for (i = -20; i <= 20; i++) {
        var r2 = (i * i + j * j) / 324;
        if (r2 < 1) { var v = Math.sqrt(1 - r2); if (Math.abs(i - j) < 2.2 && r2 < 0.8) v *= 0.35; dome[(p[1] + j) * TW + p[0] + i] = v; }
      }
    });
    // blur the letters twice with a radius 3 box, both ways, so the edges slope
    function boxH(src, dst) { for (j = 0; j < TH; j++) { var s = 0, o = j * TW; for (i = -3; i <= 3; i++) s += src[o + Math.min(TW - 1, Math.max(0, i))]; for (i = 0; i < TW; i++) { dst[o + i] = s / 7; s += src[o + Math.min(TW - 1, i + 4)] - src[o + Math.max(0, i - 3)]; } } }
    function boxV(src, dst) { for (i = 0; i < TW; i++) { var s = 0; for (j = -3; j <= 3; j++) s += src[Math.min(TH - 1, Math.max(0, j)) * TW + i]; for (j = 0; j < TH; j++) { dst[j * TW + i] = s / 7; s += src[Math.min(TH - 1, j + 4) * TW + i] - src[Math.max(0, j - 3) * TW + i]; } } }
    k = new Float32Array(n);
    boxH(h0, h1); boxV(h1, k); boxH(k, h1); boxV(h1, k);
    var out = new Uint8Array(n * 4), kk = 5.5;
    for (j = 0; j < TH; j++) for (i = 0; i < TW; i++) {
      var o = j * TW + i;
      var l = k[j * TW + Math.max(0, i - 1)] + dome[j * TW + Math.max(0, i - 1)] * 0.5;
      var r = k[j * TW + Math.min(TW - 1, i + 1)] + dome[j * TW + Math.min(TW - 1, i + 1)] * 0.5;
      var u = k[Math.max(0, j - 1) * TW + i] + dome[Math.max(0, j - 1) * TW + i] * 0.5;
      var dd = k[Math.min(TH - 1, j + 1) * TW + i] + dome[Math.min(TH - 1, j + 1) * TW + i] * 0.5;
      // plate y is up, canvas rows go down
      var nx = Math.max(-1, Math.min(1, -(r - l) * 0.5 * kk)), ny = Math.max(-1, Math.min(1, (dd - u) * 0.5 * kk));
      out[o * 4] = Math.round((nx * 0.5 + 0.5) * 255);
      out[o * 4 + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      out[o * 4 + 2] = Math.round(Math.min(1, h0[o] + (dome[o] > 0 ? 0.6 : 0)) * 255);
      out[o * 4 + 3] = 255;
    }
    return out;
  }

  function setup(root) {
    var canvas = root.querySelector(".mb-canvas");
    if (!canvas || canvas.mbOn) return;
    canvas.mbOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the HTML plate stays
    var btn = root.querySelector(".mb-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, emb = null, ready = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, cw = 1, ch = 1;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var size = 0.55, metal = [0.79, 0.8, 0.82];
    var yaw = 0.3, pitch = 0.1, tyaw = yaw, tpitch = pitch, pointerIn = false, pointerAt = -1e9, dragging = false;
    var ax = new Float32Array(3), ay = new Float32Array(3), az = new Float32Array(3);

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("metal-badge shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function texture(unit, data, size2, wrap) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size2[0], size2[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("metal-badge link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "unit", "size", "ax", "ay", "az", "lp", "metal", "sh", "emb", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      var bytes = new Uint8Array(64 * 64 * 4), seed = 41822;
      for (var i = 0; i < bytes.length; i++) { seed = (seed * 1103515245 + 12345) >>> 0; bytes[i] = seed >>> 24; }
      texture(1, bytes, [64, 64], gl.REPEAT);
      gl.uniform1i(U.rnd, 1);
      if (emb) upload();
      return true;
    }
    function upload() {
      if (!prog || lost || !emb) return;
      texture(0, emb, [TW, TH], gl.CLAMP_TO_EDGE);
      gl.uniform1i(U.emb, 0);
      ready = true;
      if (btn) btn.hidden = !clock;
      fit();
    }

    // yaw about the vertical axis, then pitch about the horizontal: plate axes in camera space
    function axes() {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      // Rx(pitch) then Ry(yaw) applied to (1,0,0), (0,1,0), (0,0,-1)
      ax[0] = cy; ax[1] = 0; ax[2] = -sy;
      ay[0] = sy * sp; ay[1] = cp; ay[2] = cy * sp;
      az[0] = -sy * cp; az[1] = sp; az[2] = -cy * cp;
    }
    function render() {
      if (!prog || lost || !w || !ready) return;
      axes();
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.unit, Math.min(h, 0.75 * w));
      gl.uniform1f(U.size, size);
      gl.uniform3fv(U.ax, ax); gl.uniform3fv(U.ay, ay); gl.uniform3fv(U.az, az);
      gl.uniform3f(U.lp, -0.9, 1.1, 0.3);
      gl.uniform3f(U.metal, metal[0], metal[1], metal[2]);
      gl.uniform2f(U.sh, 0.04 + yaw * 0.08, -0.05 - pitch * 0.08);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      root.classList.add("is-live");
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), cs = getComputedStyle(root);
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      w = Math.max(1, Math.round(cw * scale)); h = Math.max(1, Math.round(ch * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      size = Math.max(0.2, Math.min(0.8, parseFloat(cs.getPropertyValue("--mb-size")) || 0.55));
      metal = hex(cs.getPropertyValue("--mb-metal"), [0.79, 0.8, 0.82]);
      render();
      kick();
    }

    function settled() { return Math.abs(tyaw - yaw) + Math.abs(tpitch - pitch) < 0.0008; }
    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && ready; }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (!checked) {
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      if (!pointerIn && now - pointerAt > 1200) {
        // nobody is pointing: a slow sway on the clock
        var a = (clock && clock.currentTime != null ? clock.currentTime % PERIOD : 0) / PERIOD * 6.2831853;
        tyaw = 0.34 * Math.sin(a); tpitch = 0.05 + 0.1 * Math.sin(2 * a + 0.5);
      }
      var k = 1 - Math.exp(-dt / (pointerIn ? 110 : 380));
      yaw += (tyaw - yaw) * k; pitch += (tpitch - pitch) * k;
      render();
      if (!paused || !settled()) raf = requestAnimationFrame(frame);
    }

    function point(e) {
      if (reduce.matches) return;
      if (e.pointerType === "touch" && !dragging) return;
      var b = root.getBoundingClientRect();
      var px = (e.clientX - b.left) / b.width, py = 1 - (e.clientY - b.top) / b.height;
      tyaw = -Math.max(-0.5, Math.min(0.5, px - 0.5)) * 0.9;
      tpitch = Math.max(-0.5, Math.min(0.5, py - 0.5)) * 0.7;
      pointerIn = true; pointerAt = performance.now();
      kick();
    }
    function down(e) { if (e.pointerType === "touch") dragging = true; point(e); }
    function leave() { dragging = false; pointerIn = false; pointerAt = performance.now(); kick(); }
    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      kick();
    }
    function sync() {
      if (reduce.matches) {
        // one still, tilted frame
        if (clock) { clock.cancel(); clock = null; }
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (btn) btn.hidden = true;
        yaw = tyaw = 0.3; pitch = tpitch = 0.1;
        fit();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: PERIOD, iterations: Infinity });
        clock.id = "brushed metal";   // a timer only: it animates nothing visible
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !(clock && ready);
      fit();
    }

    if (!build()) return;
    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointerup", function (e) { if (e.pointerType === "touch") leave(); });
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    if (btn) {
      btn.addEventListener("click", function () { setPaused(!paused); });
      btn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    }
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null; ready = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      root.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; build(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(canvas); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", sync);
    sync();
    // the text needs its font before it is embossed
    var no = root.querySelector(".mb-no");
    var font = "800 128px " + (no ? getComputedStyle(no).fontFamily : "sans-serif");
    var go = function () { emb = embossMap(root); upload(); };
    if (document.fonts && document.fonts.load) document.fonts.load(font).then(go, go); else go();
  }

  function init() { document.querySelectorAll(".metalbadge").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
