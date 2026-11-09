/*
 * voice-orb.js: in every .voiceorb, a WebGL fragment shader on its .vo-canvas draws a glowing orb that
 * swells, wobbles and sends out rings with the caller's voice level, and goes grey and still when the
 * caller presses Mute.
 *   <section class="voiceorb">
 *     <canvas class="vo-canvas" aria-hidden="true"></canvas> ...your call screen...
 *     <button type="button" class="vo-mute" aria-pressed="false" hidden>Mute</button>
 *     <button type="button" class="vo-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --vo-bg, --vo-core, --vo-rim and --vo-mute (6 digit hex), the same ones the CSS
 * fallback uses; the orb's place from --vo-x and --vo-y (fractions of the box) and its radius from
 * --vo-size (a fraction of the box height).
 * The voice is simulated, no microphone is used: a seeded table of phrases (1.1 to 3.4 s, with pauses
 * for the agent's turn) made of syllables (5 a second or so, each a sin squared bump with its own
 * peak), read at the clock time and smoothed with a fast attack and a slow release, like a real level
 * meter. Feed your own 0 to 1 level instead with el.voiceOrbLevel = function () { return v; }.
 * The maths: the orb's edge is a circle whose radius is pushed by value noise read round a circle in
 * noise space (so the edge has no seam), scaled by the level. Inside, the circle is shaded as a sphere
 * (z = sqrt(1 - r^2), a light from the top left, a Fresnel rim). Outside, an exponential halo and two
 * rings that grow out, 20 per loop. The fast turns are worked out in JS, where they stay precise. Muted, it all eases to grey and rests.
 * Time runs on a Web Animations clock ("voice level"), so the gallery timeline and the Pause button
 * both stop it.
 * One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays;
 * under reduced motion one still frame is drawn (Mute still redraws it) and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 60000;   // one loop of the simulated voice, ms: the clock period
  var STILL = 2.0;      // the clock angle of the reduced motion frame

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform vec4 u_o;",        // two noise offsets on circles, worked out in JS (fast turns lose precision at mediump)
    "uniform vec2 u_t;",        // x: breathing, -1 to 1; y: ring phase, 0 to 1
    "uniform float u_lv;",      // smoothed voice level, 0 to 1
    "uniform float u_mute;",    // 0 talking, 1 muted (eased)
    "uniform vec2 u_c;",        // orb centre, height units from the bottom left
    "uniform float u_r;",       // orb radius, height units
    "uniform vec3 u_bg;",
    "uniform vec3 u_core;",
    "uniform vec3 u_rim;",
    "uniform vec3 u_grey;",
    "uniform sampler2D u_rnd;", // 64 x 64 random bytes, linear, repeat
    "float vn(vec2 x){ vec2 i = floor(x); vec2 f = x - i; f = f * f * (3.0 - 2.0 * f); return texture2D(u_rnd, (i + f + 0.5) / 64.0).r; }",
    "void main(){",
    "  vec2 q = gl_FragCoord.xy / u_res.y - u_c;",
    "  float d = length(q);",
    "  vec2 dir = q / max(d, 0.0001);",
    "  float lv = u_lv * (1.0 - u_mute);",
    // the edge: noise read round a circle, its offsets on circles too, a whole number of turns per loop
    "  vec2 o1 = u_o.xy; vec2 o2 = u_o.zw;",
    "  float n = (vn(dir * 1.7 + o1) - 0.5) + 0.5 * (vn(dir * 3.4 + o2) - 0.5);",
    "  float breathe = 0.025 * u_t.x * (1.0 - lv);",
    "  float r = u_r * (0.86 + 0.2 * lv - 0.08 * u_mute + breathe) * (1.0 + n * (0.035 + 0.17 * lv) * (1.0 - u_mute));",
    "  float rho = min(d / r, 1.0);",
    "  float z = sqrt(1.0 - rho * rho);",
    // inside: a lit sphere with a slow swirl of colour
    "  vec3 nrm = vec3(q / r, z);",
    "  float diff = max(dot(nrm, vec3(-0.42, 0.55, 0.72)), 0.0);",
    "  float sw = vn(q / u_r * 2.0 + o2 * 0.35);",
    "  vec3 body = mix(u_core, u_rim, clamp(smoothstep(0.55, 1.0, rho) * 0.8 + (sw - 0.5) * 0.45, 0.0, 1.0));",
    "  vec3 inner = body * (0.3 + 0.6 * diff + 0.45 * lv * z) + u_rim * pow(1.0 - z, 3.0) * 0.55;",
    "  inner += vec3(1.0) * pow(diff, 18.0) * 0.35;",
    // outside: halo and two rings that grow out and fade
    "  float out1 = max(d - r, 0.0);",
    "  vec3 glow = mix(u_core, u_rim, 0.45) * exp(-out1 / (u_r * (0.1 + 0.3 * lv))) * (0.25 + 0.6 * lv);",
    "  for (int i = 0; i < 2; i++) {",
    "    float ph = fract(u_t.y + float(i) * 0.5);",
    "    float rr = r + ph * u_r * 0.7;",
    "    float e = (d - rr) / (0.004 + 0.01 * ph);",
    "    glow += u_rim * exp(-e * e) * (1.0 - ph) * lv * 0.55;",
    "  }",
    "  float edge = 1.0 - smoothstep(r - 0.003, r + 0.003, d);",
    "  vec3 col = u_bg * (1.0 - 0.35 * smoothstep(0.2, 1.1, length(gl_FragCoord.xy / u_res - 0.5))) + glow;",
    "  col = mix(col, inner, edge);",
    // muted: the same orb in grey, resting
    "  float l = dot(col - u_bg, vec3(0.3, 0.55, 0.15));",
    "  col = mix(col, u_bg + u_grey * l * 1.4, u_mute);",
    "  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  // the simulated voice: one shared table of syllables over the loop, [start s, length s, peak] flat
  var SYL = (function () {
    var out = [], s = 20261109, t = 0.8, end = PERIOD / 1000 - 1.2;
    function rand() { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }
    while (t < end) {
      var phrase = 1.1 + rand() * 2.3, stop = Math.min(t + phrase, end), first = true;
      while (t < stop) {
        var len = 0.12 + rand() * 0.14, peak = (first ? 0.95 : 0.45 + rand() * 0.5) * (1 - 0.35 * (t - stop + phrase) / phrase);
        out.push(t, len, peak);
        t += len + (rand() < 0.18 ? 0.12 + rand() * 0.1 : 0.02 + rand() * 0.04);
        first = false;
      }
      t += rand() < 0.3 ? 2.2 + rand() * 2.6 : 0.5 + rand() * 1.1;   // a breath, or the agent's turn
    }
    return out;
  })();
  function voice(sec) {
    // binary search the syllable that starts at or before sec
    var lo = 0, hi = SYL.length / 3 - 1, i = -1;
    while (lo <= hi) { var m = (lo + hi) >> 1; if (SYL[m * 3] <= sec) { i = m; lo = m + 1; } else hi = m - 1; }
    if (i < 0) return 0;
    var x = (sec - SYL[i * 3]) / SYL[i * 3 + 1];
    if (x >= 1) return 0;
    var b = Math.sin(x * Math.PI);
    return SYL[i * 3 + 2] * b * b;
  }

  function setup(root) {
    var canvas = root.querySelector(".vo-canvas");
    if (!canvas || canvas.voOn) return;
    canvas.voOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".vo-pause"), muteBtn = root.querySelector(".vo-mute");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var lv = 0, muted = false, mu = 0;
    var ox = 0.7, oy = 0.45, os = 0.24, bg, core, rim, grey;

    function colours() {
      var cs = getComputedStyle(root);
      bg = hex(cs.getPropertyValue("--vo-bg"), [0.05, 0.1, 0.09]);
      core = hex(cs.getPropertyValue("--vo-core"), [0.31, 0.88, 0.71]);
      rim = hex(cs.getPropertyValue("--vo-rim"), [0.95, 0.76, 0.31]);
      grey = hex(cs.getPropertyValue("--vo-mute"), [0.49, 0.54, 0.53]);
      // place and size are read here too, so a media query can move the orb
      ox = parseFloat(cs.getPropertyValue("--vo-x")); oy = parseFloat(cs.getPropertyValue("--vo-y"));
      if (!(ox >= 0 && ox <= 1)) ox = 0.7;
      if (!(oy >= 0 && oy <= 1)) oy = 0.45;
      os = parseFloat(cs.getPropertyValue("--vo-size"));
      if (!(os >= 0.05 && os <= 0.45)) os = 0.24;
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("voice-orb shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("voice-orb link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "o", "t", "lv", "mute", "c", "r", "bg", "core", "rim", "grey", "rnd"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      // random bytes from a fixed seed (xorshift), so every load draws the same orb
      var bytes = new Uint8Array(64 * 64 * 4), s = 14172;
      for (var i = 0; i < bytes.length; i++) { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; bytes[i] = (s >>> 8) & 255; }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.uniform1i(U.rnd, 0);
      return true;
    }

    function ms() { return clock && clock.currentTime != null ? clock.currentTime % PERIOD : STILL / 6.2831853 * PERIOD; }
    function render(t) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      var a = t / PERIOD * 6.2831853, ring = t / PERIOD * 20;
      // 24 and 37 turns of the noise offsets, 8 breaths and 20 rings per loop
      gl.uniform4f(U.o, 7 + 1.3 * Math.cos(a * 24), 7 + 1.3 * Math.sin(a * 24), 21 + 0.9 * Math.cos(a * 37), 21 - 0.9 * Math.sin(a * 37));
      gl.uniform2f(U.t, Math.sin(a * 8), ring - Math.floor(ring));
      gl.uniform1f(U.lv, lv);
      gl.uniform1f(U.mute, mu);
      gl.uniform2f(U.c, ox * w / h, 1 - oy);
      gl.uniform1f(U.r, os);
      gl.uniform3f(U.bg, bg[0], bg[1], bg[2]);
      gl.uniform3f(U.core, core[0], core[1], core[2]);
      gl.uniform3f(U.rim, rim[0], rim[1], rim[2]);
      gl.uniform3f(U.grey, grey[0], grey[1], grey[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      colours();
      if (reduce.matches) still(); else { render(ms()); kick(); }
    }

    function target(t) {
      if (muted) return 0;
      if (typeof root.voiceOrbLevel === "function") { var v = +root.voiceOrbLevel(); return v > 0 ? Math.min(v, 1) : 0; }
      return voice(t / 1000);
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog; }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      var t = ms(), goal = target(t);
      // a level meter: fast attack, slow release
      var dl = goal - lv;
      lv += dl * (1 - Math.exp(-dt / (dl > 0 ? 45 : 170)));
      var dm = (muted ? 1 : 0) - mu;
      mu += dm * (1 - Math.exp(-dt / 220));
      render(t);
      if (!paused || Math.abs(dl) > 0.002 || Math.abs(dm) > 0.002) raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      lv = muted ? 0 : 0.5; mu = muted ? 1 : 0;
      render(ms());
    }

    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      kick();
    }
    function setMuted(m) {
      muted = m;
      if (muteBtn) muteBtn.setAttribute("aria-pressed", m ? "true" : "false");
      root.classList.toggle("is-muted", m);
      if (reduce.matches) still(); else kick();
    }
    function sync() {
      if (reduce.matches) {
        if (clock) { clock.cancel(); clock = null; }
        if (btn) btn.hidden = true;
        still();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: PERIOD, iterations: Infinity });
        clock.id = "voice level";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      kick();
    }

    if (!build()) return;
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    if (muteBtn) {
      muteBtn.hidden = false;
      muteBtn.addEventListener("click", function () { setMuted(!muted); });
    }
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      canvas.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; if (build()) fit(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", function () { sync(); if (!reduce.matches) fit(); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(ms()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".voiceorb").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
