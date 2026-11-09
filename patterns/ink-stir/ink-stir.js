/*
 * ink-stir.js: in every .inkstir, a real fluid simulation on its .ik-canvas: the pointer (mouse, pen or a
 * finger) stirs three watercolour inks into water on white paper, and they swirl, mix and fade.
 *   <section class="inkstir">
 *     <canvas class="ik-canvas" aria-hidden="true"></canvas> ...your content...
 *     <button type="button" class="ik-pause" aria-pressed="false" hidden>Pause</button>
 *   </section>
 * The three inks come from --ik-a, --ik-b and --ik-c (6 digit hex, the ink's colour at full strength on the
 * paper) and the paper from --ik-paper: the same values the CSS fallback uses.
 * The maths: stable fluids on ping-pong framebuffers. Each step adds splats (a Gaussian of velocity and ink
 * where the brush moved), adds back lost swirl (vorticity confinement from the curl), takes the divergence,
 * solves for pressure with a few Jacobi steps, subtracts the pressure gradient so the water does not
 * compress, then carries velocity and ink along the velocity (semi-Lagrangian advection). The paper shows
 * the inks subtractively: light through ink = exp(-sum of each ink's absorption), with darker pooled edges
 * where the ink changes fast and a little granulation from a value noise texture.
 * Textures: half float if it can be rendered to, else float, else a low-res byte path (velocity stored with
 * a zero at 128/255, an affine code, so hardware linear filtering stays correct). Without linear filtering
 * on the float type, the shaders filter by hand.
 * The simulation steps on a Web Animations clock ("ink stir"), so Pause and the gallery timeline stop it.
 * Idle for 1.5 s, an unseen brush stirs on its own. One full-screen triangle per pass, drawing buffer at
 * most 1.5 x the CSS size (1 x if the first 30 frames average over 20 ms), no allocation per frame, no
 * drawing off screen or in a hidden tab, the context released on pagehide and rebuilt after
 * webglcontextlost. Without WebGL the CSS fallback stays; under reduced motion the brush stirs 150 steps
 * unseen and one still frame is shown.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 60000;          // the clock period, ms (the simulation itself never repeats)
  var STEP = 1 / 60;           // fixed simulation step, s
  var JACOBI = 14;             // pressure iterations per step
  var VR = 400, PR = 800;      // byte path ranges: velocity (and divergence, curl), pressure

  var VS = [
    "attribute vec2 a_p;",
    "uniform vec2 u_tx;",          // texel size of the target grid
    "varying vec2 v_uv, v_l, v_r, v_t, v_b;",
    "void main(){",
    "  v_uv = a_p * 0.5 + 0.5;",
    "  v_l = v_uv - vec2(u_tx.x, 0.0); v_r = v_uv + vec2(u_tx.x, 0.0);",
    "  v_t = v_uv + vec2(0.0, u_tx.y); v_b = v_uv - vec2(0.0, u_tx.y);",
    "  gl_Position = vec4(a_p, 0.0, 1.0);",
    "}"
  ].join("\n");

  // shared head of every fragment shader: precision, the byte code, and hand filtering when needed
  function head(o) {
    return [
      "precision mediump float;",
      o.bytes ? "#define BYTES 1" : "",
      o.linear ? "" : "#define HAND 1",
      "varying vec2 v_uv, v_l, v_r, v_t, v_b;",
      "#ifdef BYTES",
      "vec4 dec(vec4 t, float r){ return (t - 0.50196) * 2.00787 * r; }",
      "vec4 enc(vec4 v, float r){ return v / (2.00787 * r) + 0.50196; }",
      "#else",
      "vec4 dec(vec4 t, float r){ return t; }",
      "vec4 enc(vec4 v, float r){ return v; }",
      "#endif",
      // bilinear read: the GPU does it, or four nearest reads mixed by hand
      "vec4 bil(sampler2D s, vec2 uv, vec2 tx){",
      "#ifdef HAND",
      "  vec2 g = uv / tx - 0.5; vec2 i = floor(g); vec2 f = g - i;",
      "  vec2 a = (i + 0.5) * tx;",
      "  vec4 p = texture2D(s, a), q = texture2D(s, a + vec2(tx.x, 0.0));",
      "  vec4 r = texture2D(s, a + vec2(0.0, tx.y)), w = texture2D(s, a + tx);",
      "  return mix(mix(p, q, f.x), mix(r, w, f.x), f.y);",
      "#else",
      "  return texture2D(s, uv);",
      "#endif",
      "}"
    ].join("\n") + "\n";
  }

  var FS = {
    // add a Gaussian of value u_val round u_pt (uv units) to the field
    splat: [
      "uniform sampler2D u_src;",
      "uniform vec2 u_pt; uniform vec4 u_val; uniform float u_rad; uniform float u_asp; uniform float u_rng;",
      "void main(){",
      "  vec2 d = v_uv - u_pt; d.x *= u_asp;",
      "  float x = min(dot(d, d) / u_rad, 12.0);",
      // u_rng 0 = ink, stored as it is (0 to 1); else a coded signed field of that range
      "  vec4 t = texture2D(u_src, v_uv);",
      "  if (u_rng > 0.0) gl_FragColor = enc(dec(t, u_rng) + u_val * exp(-x), u_rng);",
      "  else gl_FragColor = clamp(t + u_val * exp(-x), 0.0, 1.0);",
      "}"
    ],
    // curl of the velocity (one number per cell)
    curl: [
      "uniform sampler2D u_vel;",
      "void main(){",
      "  float l = dec(texture2D(u_vel, v_l), " + VR + ".0).y, r = dec(texture2D(u_vel, v_r), " + VR + ".0).y;",
      "  float t = dec(texture2D(u_vel, v_t), " + VR + ".0).x, b = dec(texture2D(u_vel, v_b), " + VR + ".0).x;",
      "  gl_FragColor = enc(vec4(0.5 * (r - l - t + b), 0.0, 0.0, 0.0), " + VR + ".0);",
      "}"
    ],
    // vorticity confinement: push along the curl gradient's normal so small swirls survive the solver
    vort: [
      "uniform sampler2D u_vel; uniform sampler2D u_curl; uniform float u_k; uniform float u_dt;",
      "void main(){",
      "  float l = dec(texture2D(u_curl, v_l), " + VR + ".0).x, r = dec(texture2D(u_curl, v_r), " + VR + ".0).x;",
      "  float t = dec(texture2D(u_curl, v_t), " + VR + ".0).x, b = dec(texture2D(u_curl, v_b), " + VR + ".0).x;",
      "  float c = dec(texture2D(u_curl, v_uv), " + VR + ".0).x;",
      "  vec2 n = vec2(abs(t) - abs(b), abs(r) - abs(l));",
      "  n = n / (length(n) + 0.0001) * u_k * c * vec2(1.0, -1.0);",
      "  vec4 v = dec(texture2D(u_vel, v_uv), " + VR + ".0);",
      "  v.xy += n * u_dt;",
      "  gl_FragColor = enc(vec4(v.xy, 0.0, 0.0), " + VR + ".0);",
      "}"
    ],
    // divergence: how much water leaves each cell
    div: [
      "uniform sampler2D u_vel;",
      "void main(){",
      "  float l = dec(texture2D(u_vel, v_l), " + VR + ".0).x, r = dec(texture2D(u_vel, v_r), " + VR + ".0).x;",
      "  float t = dec(texture2D(u_vel, v_t), " + VR + ".0).y, b = dec(texture2D(u_vel, v_b), " + VR + ".0).y;",
      "  vec2 c = dec(texture2D(u_vel, v_uv), " + VR + ".0).xy;",
      // solid walls: the velocity across the edge is the cell's own, mirrored
      "  if (v_l.x < 0.0) l = -c.x; if (v_r.x > 1.0) r = -c.x;",
      "  if (v_t.y > 1.0) t = -c.y; if (v_b.y < 0.0) b = -c.y;",
      "  gl_FragColor = enc(vec4(0.5 * (r - l + t - b), 0.0, 0.0, 0.0), " + VR + ".0);",
      "}"
    ],
    // keep part of last step's pressure as the first guess
    fade: [
      "uniform sampler2D u_src; uniform float u_k;",
      "void main(){ gl_FragColor = enc(dec(texture2D(u_src, v_uv), " + PR + ".0) * u_k, " + PR + ".0); }"
    ],
    // one Jacobi step of the pressure Poisson equation
    jacobi: [
      "uniform sampler2D u_p; uniform sampler2D u_div;",
      "void main(){",
      "  float l = dec(texture2D(u_p, v_l), " + PR + ".0).x, r = dec(texture2D(u_p, v_r), " + PR + ".0).x;",
      "  float t = dec(texture2D(u_p, v_t), " + PR + ".0).x, b = dec(texture2D(u_p, v_b), " + PR + ".0).x;",
      "  float d = dec(texture2D(u_div, v_uv), " + VR + ".0).x;",
      "  gl_FragColor = enc(vec4(0.25 * (l + r + t + b - d), 0.0, 0.0, 0.0), " + PR + ".0);",
      "}"
    ],
    // subtract the pressure gradient: what is left has no divergence
    grad: [
      "uniform sampler2D u_p; uniform sampler2D u_vel;",
      "void main(){",
      "  float l = dec(texture2D(u_p, v_l), " + PR + ".0).x, r = dec(texture2D(u_p, v_r), " + PR + ".0).x;",
      "  float t = dec(texture2D(u_p, v_t), " + PR + ".0).x, b = dec(texture2D(u_p, v_b), " + PR + ".0).x;",
      "  vec2 v = dec(texture2D(u_vel, v_uv), " + VR + ".0).xy - 0.5 * vec2(r - l, t - b);",
      "  gl_FragColor = enc(vec4(v, 0.0, 0.0), " + VR + ".0);",
      "}"
    ],
    // carry a field along the velocity: read it where this cell's water was one step ago
    advect: [
      "uniform sampler2D u_vel; uniform sampler2D u_src;",
      "uniform vec2 u_vtx; uniform vec2 u_stx; uniform float u_dt; uniform float u_keep; uniform float u_rng; uniform float u_sub;",
      "void main(){",
      "  vec2 v = dec(bil(u_vel, v_uv, u_vtx), " + VR + ".0).xy;",
      "  vec2 from = v_uv - u_dt * v * u_vtx;",
      "  vec4 s = bil(u_src, from, u_stx);",
      "  if (u_rng > 0.0) { gl_FragColor = enc(dec(s, u_rng) * u_keep, u_rng); return; }",
      // ink also loses a little: u_sub (a byte texture gets a whole byte now and then, or it stalls on rounding)
      "  gl_FragColor = clamp(s * u_keep - u_sub, 0.0, 1.0);",
      "}"
    ],
    // the paper: inks absorb light (subtractive mixing), pooled edges, granulation
    show: [
      "uniform sampler2D u_dye; uniform sampler2D u_rnd;",
      "uniform vec2 u_dtx; uniform vec2 u_res;",
      "uniform vec3 u_ka; uniform vec3 u_kb; uniform vec3 u_kc; uniform vec3 u_paper;",
      "float vnoise(vec2 p){",
      "  vec2 i = floor(p); vec2 f = p - i; f = f * f * (3.0 - 2.0 * f);",
      "  return texture2D(u_rnd, (mod(i, 64.0) + f + 0.5) / 64.0).r;",
      "}",
      "void main(){",
      "  vec3 c = bil(u_dye, v_uv, u_dtx).rgb;",
      "  vec3 cl = bil(u_dye, v_uv - vec2(u_dtx.x, 0.0), u_dtx).rgb, cr = bil(u_dye, v_uv + vec2(u_dtx.x, 0.0), u_dtx).rgb;",
      "  vec3 ct = bil(u_dye, v_uv + vec2(0.0, u_dtx.y), u_dtx).rgb, cb = bil(u_dye, v_uv - vec2(0.0, u_dtx.y), u_dtx).rgb;",
      "  float sum = c.r + c.g + c.b;",
      "  float edge = length(vec2(cr.r + cr.g + cr.b - cl.r - cl.g - cl.b, ct.r + ct.g + ct.b - cb.r - cb.g - cb.b));",
      "  vec2 px = gl_FragCoord.xy / u_res.y * 340.0;",
      "  float grain = vnoise(px * 0.5) * 0.6 + vnoise(px * 0.13) * 0.4;",
      // granulation: pigment settles in the paper's dips
      "  vec3 amt = c * (0.75 + 0.5 * grain) * (1.0 + min(edge * 3.0, 1.2));",
      "  vec3 col = u_paper * exp(-(amt.r * u_ka + amt.g * u_kb + amt.b * u_kc));",
      "  col *= 0.97 + 0.03 * vnoise(px);",
      "  gl_FragColor = vec4(col, 1.0);",
      "}"
    ]
  };

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    if (!m) return f;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  // absorption that makes concentration 1 show exactly this colour on this paper
  function absorb(c, paper) {
    return [0, 1, 2].map(function (i) { return Math.max(0, -Math.log(Math.max(c[i], 0.02) / Math.max(paper[i], 0.05))); });
  }

  function setup(root) {
    var canvas = root.querySelector(".ik-canvas");
    if (!canvas || canvas.ikOn) return;
    canvas.ikOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the CSS fallback stays
    var btn = root.querySelector(".ik-pause");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var P = {}, lost = false, fmt = null, buf = null, rnd = null;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0;
    var sim = null, dye = null, vel = null, prs = null, dv = null, crl = null;
    var clock = null, paused = false, raf = 0, lastClock = -1, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    // the brush: pointer target, eased position, last position, ink choice
    var bx = 0.5, by = 0.5, lx = 0.5, ly = 0.5, pointerIn = false, pointerAt = -1e9, auto = 0, inkAt = 0, ink = 0, ready = false;
    var ka, kb, kc, paper, cx = 0.68, cy = 0.5, cr = 0.3;
    var INK = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]];
    var val = new Float32Array(4), fades = 0;

    function colours() {
      var cs = getComputedStyle(root);
      // where the unseen brush stirs: centre (0 to 1 from the left and from the bottom) and reach (height units)
      cx = +cs.getPropertyValue("--ik-x") || 0.68; cy = +cs.getPropertyValue("--ik-y") || 0.5; cr = +cs.getPropertyValue("--ik-r") || 0.3;
      paper = hex(cs.getPropertyValue("--ik-paper"), [0.97, 0.95, 0.91]);
      ka = absorb(hex(cs.getPropertyValue("--ik-a"), [0.17, 0.29, 0.62]), paper);
      kb = absorb(hex(cs.getPropertyValue("--ik-b"), [0.75, 0.16, 0.29]), paper);
      kc = absorb(hex(cs.getPropertyValue("--ik-c"), [0.91, 0.66, 0.13]), paper);
    }

    // which texture type can be rendered to: half float, float, or bytes
    function canRender(type) {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, type, null);
      var f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(f); gl.deleteTexture(t);
      return ok;
    }
    function pickFormat() {
      var hf = gl.getExtension("OES_texture_half_float");
      if (hf) {
        gl.getExtension("EXT_color_buffer_half_float");
        if (canRender(hf.HALF_FLOAT_OES)) return { type: hf.HALF_FLOAT_OES, linear: !!gl.getExtension("OES_texture_half_float_linear"), bytes: false, sim: 128, dye: 512 };
      }
      if (gl.getExtension("OES_texture_float")) {
        gl.getExtension("WEBGL_color_buffer_float");
        if (canRender(gl.FLOAT)) return { type: gl.FLOAT, linear: !!gl.getExtension("OES_texture_float_linear"), bytes: false, sim: 128, dye: 512 };
      }
      return { type: gl.UNSIGNED_BYTE, linear: true, bytes: true, sim: 64, dye: 256 };
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("ink-stir shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function program(vs, src) {
      var f = compile(gl.FRAGMENT_SHADER, head(fmt) + src.join("\n"));
      if (!f) return null;
      var p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, f);
      gl.bindAttribLocation(p, 0, "a_p");
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("ink-stir link: " + gl.getProgramInfoLog(p)); return null; }
      var u = { prog: p }, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var a = gl.getActiveUniform(p, i).name; u[a.slice(2)] = gl.getUniformLocation(p, a); }
      return u;
    }
    function build() {
      fmt = pickFormat();
      var vs = compile(gl.VERTEX_SHADER, VS);
      if (!vs) return false;
      for (var k in FS) { P[k] = program(vs, FS[k]); if (!P[k]) return false; }
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      // random bytes from a fixed seed: the paper's grain (value noise with LINEAR filtering)
      var bytes = new Uint8Array(64 * 64 * 4), seed = 4721;
      for (var i = 0; i < bytes.length; i++) { seed = (seed * 1103515245 + 12345) >>> 0; bytes[i] = seed >>> 24; }
      rnd = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, rnd);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      sim = null;
      return true;
    }

    function target(tw, th, zero) {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      var f = fmt.linear ? gl.LINEAR : gl.NEAREST;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tw, th, 0, gl.RGBA, fmt.type, null);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.viewport(0, 0, tw, th);
      // the byte code's zero is 128/255; ink starts at 0
      var z = fmt.bytes && zero ? 128 / 255 : 0;
      gl.clearColor(z, z, z, z); gl.clear(gl.COLOR_BUFFER_BIT);
      return { t: t, fb: fb, w: tw, h: th };
    }
    function pair(tw, th, zero) {
      var o = { a: target(tw, th, zero), b: target(tw, th, zero) };
      o.swap = function () { var x = o.a; o.a = o.b; o.b = x; };
      return o;
    }
    function free(o) { if (!o) return; [o.a, o.b].forEach(function (x) { if (x) { gl.deleteTexture(x.t); gl.deleteFramebuffer(x.fb); } }); }
    function grids() {
      var asp = w / h, n = fmt.sim, m = fmt.dye;
      var sw = asp >= 1 ? n : Math.round(n * asp), sh = asp >= 1 ? Math.round(n / asp) : n;
      var dw = asp >= 1 ? m : Math.round(m * asp), dh = asp >= 1 ? Math.round(m / asp) : m;
      sw = Math.max(16, sw); sh = Math.max(16, sh); dw = Math.max(32, dw); dh = Math.max(32, dh);
      if (sim && sim.w === sw && sim.h === sh && dye.w === dw) return false;
      free(vel); free(prs); free(dye && dye.p); free(dv); free(crl);
      vel = pair(sw, sh, true); prs = pair(sw, sh, true);
      dv = { a: target(sw, sh, true) }; crl = { a: target(sw, sh, true) };
      var dp = pair(dw, dh, false);
      sim = { w: sw, h: sh }; dye = { w: dw, h: dh, p: dp };
      return true;
    }

    // run one pass into a target; tex is a list of [uniform, texture] in unit order
    function pass(u, out, tw, th) {
      gl.useProgram(u.prog);
      gl.uniform2f(u.tx, 1 / tw, 1 / th);
      gl.bindFramebuffer(gl.FRAMEBUFFER, out ? out.fb : null);
      gl.viewport(0, 0, out ? out.w : w, out ? out.h : h);
    }
    function bind(u, name, unit, tex) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(u[name], unit); }
    function draw() { gl.drawArrays(gl.TRIANGLES, 0, 3); }

    function splat(x, y, dx, dy, which, amount) {
      var u = P.splat, asp = w / h;
      // velocity: the brush's motion, in grid cells per second
      pass(u, vel.b, sim.w, sim.h);
      bind(u, "src", 0, vel.a.t);
      gl.uniform2f(u.pt, x, y);
      gl.uniform1f(u.asp, asp);
      gl.uniform1f(u.rad, 0.0016);
      gl.uniform1f(u.rng, VR);
      val[0] = dx * sim.w; val[1] = dy * sim.h; val[2] = 0; val[3] = 0;
      gl.uniform4fv(u.val, val);
      draw(); vel.swap();
      // ink
      pass(u, dye.p.b, dye.w, dye.h);
      bind(u, "src", 0, dye.p.a.t);
      gl.uniform1f(u.rad, 0.0011);
      gl.uniform1f(u.rng, 0);
      var c = INK[which];
      val[0] = c[0] * amount; val[1] = c[1] * amount; val[2] = c[2] * amount; val[3] = 0;
      gl.uniform4fv(u.val, val);
      draw(); dye.p.swap();
    }

    function brush(dt, now) {
      var asp = w / h;
      if (!pointerIn && now - pointerAt > 1500) {
        // nobody is stirring: an unseen brush draws slow loops round the stir centre (--ik-x, --ik-y, --ik-r)
        auto += dt;
        var a = auto * 0.9;
        bx = cx + Math.min(0.42, cr * 0.75 / asp) * Math.sin(a);
        by = cy + cr * Math.sin(a * 1.7 + 0.6);
        if (auto - inkAt > 1.4) { inkAt = auto; ink = (ink + 1) % 3; }
      }
      var dx = bx - lx, dy = by - ly;
      var sp = Math.sqrt(dx * dx * asp * asp + dy * dy);
      if (sp > 0.0004) {
        // velocity of the splat: the brush's move over this step, capped
        var k = Math.min(1, 0.04 / sp);
        splat(bx, by, dx * k / dt, dy * k / dt, ink, Math.min(0.2, 0.02 + sp * 2));
      }
      lx = bx; ly = by;
    }

    function step(dt, now) {
      gl.disable(gl.BLEND);
      brush(dt, now);
      var u;
      u = P.curl; pass(u, crl.a, sim.w, sim.h); bind(u, "vel", 0, vel.a.t); draw();
      u = P.vort; pass(u, vel.b, sim.w, sim.h); bind(u, "vel", 0, vel.a.t); bind(u, "curl", 1, crl.a.t);
      gl.uniform1f(u.k, 18); gl.uniform1f(u.dt, dt); draw(); vel.swap();
      u = P.div; pass(u, dv.a, sim.w, sim.h); bind(u, "vel", 0, vel.a.t); draw();
      u = P.fade; pass(u, prs.b, sim.w, sim.h); bind(u, "src", 0, prs.a.t); gl.uniform1f(u.k, 0.8); draw(); prs.swap();
      u = P.jacobi; gl.useProgram(u.prog); bind(u, "div", 1, dv.a.t);
      for (var i = 0; i < JACOBI; i++) { pass(u, prs.b, sim.w, sim.h); bind(u, "p", 0, prs.a.t); draw(); prs.swap(); }
      u = P.grad; pass(u, vel.b, sim.w, sim.h); bind(u, "p", 0, prs.a.t); bind(u, "vel", 1, vel.a.t); draw(); vel.swap();
      u = P.advect; pass(u, vel.b, sim.w, sim.h); bind(u, "vel", 0, vel.a.t); bind(u, "src", 1, vel.a.t);
      gl.uniform2f(u.vtx, 1 / sim.w, 1 / sim.h); gl.uniform2f(u.stx, 1 / sim.w, 1 / sim.h);
      gl.uniform1f(u.dt, dt); gl.uniform1f(u.keep, 1 / (1 + 0.6 * dt)); gl.uniform1f(u.rng, VR); draw(); vel.swap();
      pass(u, dye.p.b, dye.w, dye.h); bind(u, "vel", 0, vel.a.t); bind(u, "src", 1, dye.p.a.t);
      gl.uniform2f(u.stx, 1 / dye.w, 1 / dye.h); gl.uniform1f(u.keep, 1 / (1 + 0.05 * dt)); gl.uniform1f(u.rng, 0);
      gl.uniform1f(u.sub, fmt.bytes ? (++fades % 6 ? 0 : 0.0025) : 0.00025); draw(); dye.p.swap();
    }

    function render() {
      if (lost || !sim || !w) return;
      var u = P.show;
      pass(u, null, w, h);
      bind(u, "dye", 0, dye.p.a.t); bind(u, "rnd", 1, rnd);
      gl.uniform2f(u.dtx, 1 / dye.w, 1 / dye.h);
      gl.uniform2f(u.res, w, h);
      gl.uniform3f(u.ka, ka[0], ka[1], ka[2]); gl.uniform3f(u.kb, kb[0], kb[1], kb[2]); gl.uniform3f(u.kc, kc[0], kc[1], kc[2]);
      gl.uniform3f(u.paper, paper[0], paper[1], paper[2]);
      draw();
      canvas.classList.add("is-live");
    }

    // the opening: three inks already dropped in, so the paper is never blank
    function seed() {
      auto = 0; inkAt = 0; ink = 0;
      var rx = Math.min(0.42, cr * 0.75 * h / w);
      for (var i = 0; i < 3; i++) {
        var x = cx + rx * (i - 1) * 0.7, y = cy + cr * (i % 2 ? 0.35 : -0.3);
        splat(x, y, (i - 1) * 0.6, 0.5 - i * 0.3, i, 0.85);
      }
      lx = bx = cx; ly = by = cy;
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale)); h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      colours();
      if (lost) return;
      if (grids()) { seed(); ready = false; }
      if (reduce.matches) still(); else { if (!ready) { for (var i = 0; i < 20; i++) step(STEP, 0); ready = true; } render(); kick(); }
    }

    function live() { return onScreen && !document.hidden && !reduce.matches && !lost && sim && !paused; }
    function kick() { if (!raf && live()) { lastClock = -1; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      if (!checked) {
        // a slow first second: drop the buffer to 1 x the CSS size
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      var t = clock && clock.currentTime != null ? clock.currentTime : now;
      var dt = lastClock < 0 ? STEP : (t - lastClock) / 1000;
      if (dt < 0) dt += PERIOD / 1000;   // the clock wrapped round its period
      lastClock = t;
      if (dt > 0.0005) step(Math.min(dt, 1 / 30), now);
      render();
      raf = requestAnimationFrame(frame);
    }

    function still() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      // a meaningful still: the unseen brush stirs for 150 steps, then the paper is shown once
      if (!ready) { for (var i = 0; i < 150; i++) step(STEP, 1e9); ready = true; }
      render();
    }

    function point(e) {
      if (reduce.matches || paused) return;
      var b = root.getBoundingClientRect();
      bx = (e.clientX - b.left) / b.width; by = 1 - (e.clientY - b.top) / b.height;
      if (!pointerIn || e.type === "pointerdown") {
        // a new stroke: start from here and change ink
        lx = bx; ly = by;
        if (performance.now() - pointerAt > 600) ink = (ink + 1) % 3;
      }
      pointerIn = true; pointerAt = performance.now();
      kick();
    }
    function leave() { pointerIn = false; pointerAt = performance.now(); auto = 0; inkAt = 0; kick(); }
    function setPaused(p) {
      paused = p;
      if (btn) btn.setAttribute("aria-pressed", p ? "true" : "false");
      if (clock) { if (p) clock.pause(); else clock.play(); }
      kick();
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
        clock.id = "ink stir";
        if (paused) clock.pause();
      }
      if (btn) btn.hidden = false;
      kick();
    }

    if (!build()) return;
    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", point);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; sim = null; vel = prs = dv = crl = dye = null;
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { colours(); render(); });
    fit();
    sync();
  }

  function init() { document.querySelectorAll(".inkstir").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
