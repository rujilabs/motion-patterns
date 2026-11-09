/*
 * ferrofluid.js: in every .ferro, a WebGL fragment shader on its .fo-canvas draws a glossy black
 * ferrofluid puddle whose spikes jump up on every kick of a demo track and settle between beats.
 *   <section class="ferro" data-fo-bpm="112">
 *     <canvas class="fo-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="fo-play" aria-pressed="false" hidden>Play the beat</button>
 *     <button type="button" class="fo-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * Colours come from --fo-base, --fo-cool and --fo-warm (6 digit hex), the same ones the CSS fallback uses.
 * The beat is simulated: an envelope worked out in JS from the clock (a kick on every beat, the first of
 * each bar louder), so it runs silent with no audio file. "Play the beat" (only on a click) synthesizes
 * the same pattern with Web Audio, scheduled against the same clock, and stops on a second click, on
 * Pause, in a hidden tab and on pagehide.
 * The maths: a heightfield raymarched from a camera looking down at the puddle: a shallow paraboloid
 * dome plus a cone spike on every point of a hexagonal lattice (the pattern real ferrofluid makes in a
 * field), each spike (1 - d / R)^1.6 tall, scaled by the beat and by distance from the middle. 32 steps
 * (only inside the puddle's cylinder) find the first crossing, 5 bisection steps refine it. The normal is analytic (the dome's and the
 * nearest spike's gradients), and the black surface shows only reflections of two strip lights, with
 * Schlick Fresnel.
 * Time runs on a Web Animations clock ("ferro beat", 16 bars long), so the gallery timeline and Pause stop
 * it. One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first 30 frames
 * average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the context
 * released on pagehide and rebuilt after webglcontextlost. Without WebGL the CSS fallback stays; under
 * reduced motion one still frame (spikes part way up) is drawn and the Pause button hides.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",      // drawing buffer, px
    "uniform vec3 u_view;",     // screen offset of the puddle (x, y, height units) and zoom
    "uniform float u_amp;",     // spike height from the beat, 0 to 1
    "uniform float u_spin;",    // slow turn of the lattice, radians
    "uniform vec3 u_base;",
    "uniform vec3 u_cool;",
    "uniform vec3 u_warm;",
    "const float S = 0.2;",     // lattice spacing, world units
    "const float R = 0.115;",   // spike foot radius
    // offset from the nearest point of a hexagonal lattice (in lattice units)
    "vec2 hexOff(vec2 q){",
    "  vec2 r = vec2(1.0, 1.7320508); vec2 hh = r * 0.5;",
    "  vec2 a = mod(q, r) - hh; vec2 b = mod(q - hh, r) - hh;",
    "  return dot(a, a) < dot(b, b) ? a : b;",
    "}",
    "mat2 rot;",
    // height and its gradient (x, z) at a point on the floor plane
    "vec3 field(vec2 xz){",
    "  float r2 = dot(xz, xz);",
    "  float dome = max(0.0, 1.0 - r2);",
    "  vec3 h = vec3(0.06 * dome, r2 < 1.0 ? -0.12 * xz : vec2(0.0));",
    "  vec2 q = rot * xz / S;",
    "  vec2 g = hexOff(q);",
    "  vec2 c = (q - g) * S;",                     // the spike's foot, in turned world units
    "  float rc = length(c);",
    "  float reach = 0.62 + 0.35 * u_amp;",          // a stronger beat wakes spikes further out
    "  float e = (1.0 - smoothstep(reach * 0.3, reach, rc)) * u_amp;",
    "  float d = length(g) * S;",
    "  float k = max(0.0, 1.0 - d / R);",
    "  float sp = 0.46 * e * pow(k, 1.6);",
    "  vec2 sg = d > 0.0001 ? -0.46 * e * 1.6 * pow(k, 0.6) / R * (g * S / d) : vec2(0.0);",
    "  sg = sg * rot;",                             // back to unturned world
    "  return vec3(h.x + sp, h.yz + sg);",
    "}",
    "vec3 env(vec3 r){",
    // a dim cool room above, the lit shelf below, a long strip light overhead and a warm one on the right
    "  vec3 c = mix(u_base * 2.2 + u_warm * 0.05, u_cool * 0.32, smoothstep(-0.15, 0.9, r.y));",
    "  c += u_cool * 2.4 * smoothstep(0.94, 0.98, r.y) * (1.0 - smoothstep(0.2, 0.3, abs(r.x)));",
    "  c += u_warm * 1.8 * smoothstep(0.6, 0.8, r.x) * (1.0 - smoothstep(0.1, 0.25, abs(r.y - 0.3)));",
    "  c += u_cool * 0.9 * smoothstep(0.65, 0.85, -r.x) * (1.0 - smoothstep(0.05, 0.16, abs(r.y - 0.45)));",
    // the far wall at eye level: a soft band that outlines the spikes against the black puddle
    "  c += mix(u_cool, u_warm, 0.35) * 0.32 * (1.0 - smoothstep(0.0, 0.22, abs(r.y - 0.08)));",
    "  return c;",
    "}",
    "void main(){",
    "  rot = mat2(cos(u_spin), sin(u_spin), -sin(u_spin), cos(u_spin));",
    "  vec2 p = ((gl_FragCoord.xy - 0.5 * u_res) / u_res.y - u_view.xy) / u_view.z;",
    "  vec3 ro = vec3(0.0, 1.7, -2.6);",
    "  vec3 fw = normalize(vec3(0.0, 0.05, 0.0) - ro);",
    "  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));",
    "  vec3 up = cross(fw, rt);",
    "  vec3 rd = normalize(fw * 1.05 + rt * p.x + up * p.y);",
    "  float t0 = (ro.y - 0.56) / -rd.y, t1 = ro.y / -rd.y;",
    "  vec3 fl = ro + rd * t1;",
    // march only where the ray is inside the puddle's cylinder (radius 1.02): most floor pixels skip it
    "  float ca = dot(rd.xz, rd.xz), cb = dot(ro.xz, rd.xz), cc = dot(ro.xz, ro.xz) - 1.04;",
    "  float disc = cb * cb - ca * cc;",
    "  float hit = 0.0, ta = 0.0, tb = 0.0;",
    "  if (disc > 0.0) {",
    "    float sq = sqrt(disc);",
    "    float m0 = max(t0, (-cb - sq) / ca), m1 = min(t1, (-cb + sq) / ca);",
    "    float dt = (m1 - m0) / 32.0;",
    "    for (int i = 0; i < 32; i++) {",
    "      float t = m0 + dt * float(i + 1);",
    "      vec3 q = ro + rd * t;",
    "      if (dt > 0.0 && hit < 0.5 && q.y < field(q.xz).x - 0.002) { hit = 1.0; tb = t; ta = t - dt; }",
    "    }",
    "  }",
    "  vec3 col;",
    "  if (hit > 0.5) {",
    "    for (int i = 0; i < 5; i++) {",
    "      float tm = 0.5 * (ta + tb); vec3 q = ro + rd * tm;",
    "      if (q.y < field(q.xz).x) tb = tm; else ta = tm;",
    "    }",
    "    vec3 q = ro + rd * tb;",
    "    vec3 f = field(q.xz);",
    "    vec3 n = normalize(vec3(-f.y, 1.0, -f.z));",
    "    vec3 rf = reflect(rd, n);",
    "    float fres = 0.05 + 0.95 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);",
    "    col = u_base * 0.2 + env(rf) * (0.3 + 0.7 * fres);",
    "  } else {",
    // the shelf: dark, a soft pool of light round the puddle, darker right under its edge
    "    float r = length(fl.xz);",
    "    col = u_base * 1.6 + (u_base * 2.0 + u_warm * 0.12 + u_cool * 0.08) * exp(-r * r * 0.35);",
    "    col *= 0.45 + 0.55 * smoothstep(1.0, 1.35, r);",
    "  }",
    "  col *= 1.0 - 0.25 * dot(p, p);",
    "  gl_FragColor = vec4(col / (1.0 + col * 0.25), 1.0);",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function setup(root) {
    var canvas = root.querySelector(".fo-canvas");
    if (!canvas || canvas.foOn) return;
    canvas.foOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".fo-pause"), playBtn = root.querySelector(".fo-play");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var clock = null, paused = false, raf = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var bpm = Math.min(160, Math.max(60, +root.getAttribute("data-fo-bpm") || 112));
    var BEAT = 60 / bpm, PERIOD = BEAT * 64 * 1000;   // 16 bars of 4/4, ms
    var base, cool, warm, vx = 0.34, vy = 0, vz = 0.95;
    var actx = null, timer = 0, noise = null, nextBeat = 0;

    function colours() {
      var cs = getComputedStyle(root);
      base = hex(cs.getPropertyValue("--fo-base"), [0.05, 0.06, 0.07]);
      cool = hex(cs.getPropertyValue("--fo-cool"), [0.62, 0.83, 1]);
      warm = hex(cs.getPropertyValue("--fo-warm"), [1, 0.71, 0.28]);
      // where the puddle sits on screen (height units from the middle) and how big, read on every resize
      vx = +cs.getPropertyValue("--fo-x") || 0;
      vy = +cs.getPropertyValue("--fo-y") || 0;
      vz = +cs.getPropertyValue("--fo-zoom") || 0.95;
    }

    // the beat envelope at clock time s (seconds): a fast rise, then a decay, every beat
    function amp(s) {
      var b = s / BEAT, ph = b - Math.floor(b), n = Math.floor(b) % 4;
      var kick = (1 - Math.exp(-ph * 40)) * Math.exp(-ph * 4.2) * (n === 0 ? 1 : 0.72);
      var off = Math.exp(-Math.abs(ph - 0.5) * 18) * 0.12;   // the off-beat hat lifts it a touch
      return Math.min(1, 0.2 + 0.8 * kick + off);
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("ferrofluid shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("ferrofluid link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "view", "amp", "spin", "base", "cool", "warm"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      return true;
    }

    function now() { return clock && clock.currentTime != null ? (clock.currentTime % PERIOD) / 1000 : -1; }
    function render(s) {
      if (!prog || lost || !w) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform3f(U.view, vx, vy, vz);
      gl.uniform1f(U.amp, s < 0 ? 0.62 : amp(s));
      // the lattice turns once per loop, so the loop has no seam
      gl.uniform1f(U.spin, s < 0 ? 0.3 : s / (PERIOD / 1000) * 6.2831853);
      gl.uniform3f(U.base, base[0], base[1], base[2]);
      gl.uniform3f(U.cool, cool[0], cool[1], cool[2]);
      gl.uniform3f(U.warm, warm[0], warm[1], warm[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-live");
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      colours();
      if (reduce.matches) still(); else { render(now()); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && prog && !paused; }
    function kick() { if (!raf && live()) { if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(t) {
      raf = 0;
      if (!live()) return;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = t;
        else if (++frames === 30) { checked = true; if ((t - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      render(now());
      raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      render(-1);
    }

    // ---- the demo beat, synthesized only after a click ----
    function hit(at, kind, note) {
      var o, g;
      if (kind === "kick") {
        o = actx.createOscillator(); g = actx.createGain();
        o.frequency.setValueAtTime(130, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.14);
        g.gain.setValueAtTime(0.9, at); g.gain.exponentialRampToValueAtTime(0.001, at + 0.38);
        o.connect(g); g.connect(actx.destination); o.start(at); o.stop(at + 0.4);
      } else if (kind === "hat") {
        var s = actx.createBufferSource(), f = actx.createBiquadFilter();
        g = actx.createGain(); s.buffer = noise;
        f.type = "highpass"; f.frequency.value = 7000;
        g.gain.setValueAtTime(0.16, at); g.gain.exponentialRampToValueAtTime(0.001, at + 0.06);
        s.connect(f); f.connect(g); g.connect(actx.destination); s.start(at); s.stop(at + 0.07);
      } else {
        o = actx.createOscillator(); g = actx.createGain();
        o.type = "triangle"; o.frequency.value = note;
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.22, at + 0.02); g.gain.exponentialRampToValueAtTime(0.001, at + BEAT * 0.9);
        o.connect(g); g.connect(actx.destination); o.start(at); o.stop(at + BEAT);
      }
    }
    var BASS = [41.2, 41.2, 49, 55];   // one note per bar: E, E, G, A
    function schedule() {
      if (!actx || !clock || clock.currentTime == null) return;
      var cs = clock.currentTime / 1000, ahead = 0.12;
      if (nextBeat < cs) nextBeat = Math.ceil(cs / (BEAT / 2)) * (BEAT / 2);
      while (nextBeat < cs + ahead) {
        var at = actx.currentTime + (nextBeat - cs), k = Math.round(nextBeat / (BEAT / 2));
        if (k % 2 === 0) {
          hit(at, "kick");
          hit(at, "bass", BASS[Math.floor(k / 8) % 4]);
        } else hit(at, "hat");
        nextBeat += BEAT / 2;
      }
    }
    function stopSound() {
      if (timer) { clearInterval(timer); timer = 0; }
      if (actx) { actx.close(); actx = null; }
      if (playBtn) { playBtn.setAttribute("aria-pressed", "false"); playBtn.textContent = "Play the beat"; }
    }
    function startSound() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !clock) return;
      if (paused) setPaused(false);
      actx = new AC();
      noise = actx.createBuffer(1, Math.round(actx.sampleRate * 0.07), actx.sampleRate);
      var d = noise.getChannelData(0), seed = 77;
      for (var i = 0; i < d.length; i++) { seed = (seed * 1103515245 + 12345) >>> 0; d[i] = (seed >>> 8) / 8388608 - 1; }
      nextBeat = 0;
      timer = setInterval(schedule, 25);
      schedule();
      playBtn.setAttribute("aria-pressed", "true"); playBtn.textContent = "Stop the beat";
    }

    function setPaused(p) {
      paused = p;
      if (p) stopSound();
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      render(now());
      kick();
    }
    function sync() {
      if (reduce.matches) {
        stopSound();
        if (clock) { clock.cancel(); clock = null; }
        if (btn) btn.hidden = true;
        if (playBtn) playBtn.hidden = true;
        still();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: PERIOD, iterations: Infinity });
        clock.id = "ferro beat";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = !clock;
      if (playBtn) playBtn.hidden = !clock || !(window.AudioContext || window.webkitAudioContext);
      kick();
    }

    if (!build()) return;
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    if (playBtn) playBtn.addEventListener("click", function () { if (actx) stopSound(); else startSound(); });
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      canvas.classList.remove("is-live");
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; if (build()) fit(); });
    window.addEventListener("pagehide", function () { stopSound(); if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stopSound(); kick(); });
    reduce.addEventListener("change", function () { sync(); if (!reduce.matches) fit(); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(reduce.matches ? -1 : now()); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".ferro").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
