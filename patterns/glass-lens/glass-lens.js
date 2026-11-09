/*
 * glass-lens.js: in every .glasslens, a reading lens slides over the small print (.gl-print) and
 * magnifies it. The text is the real HTML: the script draws the same words into a texture, each one
 * where the browser laid it out (a Range per word), and the canvas over the print shows only the lens,
 * its rim and its shadow, so the print outside the lens is the page's own text.
 * The lens follows the pointer (on touch it sits just above the finger), moves with the arrow keys when
 * .gl-move has focus, and drifts over the lines on its own when nobody steers it.
 *   <div class="glasslens">
 *     <div class="gl-print"> ...the small print... </div>
 *     <canvas class="gl-canvas" aria-hidden="true"></canvas>
 *     <div class="gl-move" tabindex="0" role="group" aria-label="Magnifier. Use the arrow keys to move it." hidden></div>
 *     <button type="button" class="gl-pause" aria-pressed="false" hidden>Pause</button>
 *   </div>
 * The maths: inside the lens a point at distance r (in lens radii) from the centre reads the print at
 * centre + d (1 + 0.5 r^2) / m: magnified m times at the middle, less toward the rim (barrel distortion).
 * Red and blue read at 1.2 per cent further and nearer near the rim, the coloured edge of a simple lens.
 * The rim is a dark ring lit from the top left as a rounded section; a crescent and a soft spot are the
 * glass catching the light.
 * The idle drift runs on a Web Animations clock ("reading lens"), so the gallery timeline and the Pause
 * button stop it. One full-screen triangle, drawing buffer at most 1.5 x the CSS size (1 x if the first
 * 30 frames average over 20 ms), no allocation per frame, no drawing off screen or in a hidden tab, the
 * context released on pagehide and rebuilt after webglcontextlost. Under reduced motion the lens rests
 * on the dose line and moves only when the reader moves it.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PERIOD = 24000;   // one idle loop over the print, ms

  var VS = "attribute vec2 a_p;void main(){gl_Position=vec4(a_p,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res;",       // drawing buffer, px
    "uniform float u_px;",       // buffer px per CSS px
    "uniform vec2 u_area;",      // CSS px of the area (the texture covers it)
    "uniform sampler2D u_tex;",  // the print, drawn by the script
    "uniform vec2 u_c;",         // lens centre, CSS px from the top left
    "uniform float u_r;",        // lens radius, CSS px
    "uniform float u_mag;",      // magnification at the centre
    "vec3 tex(vec2 p){ return texture2D(u_tex, clamp(p / u_area, 0.0, 1.0)).rgb; }",
    "vec4 over(vec4 o, vec3 c, float a){ return vec4(c * a + o.rgb * (1.0 - a), a + o.a * (1.0 - a)); }",
    "void main(){",
    "  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_px;",
    "  vec2 d = (p - u_c) / u_r;",
    "  float r = length(d);",
    "  vec2 nd = d / max(r, 0.001);",
    "  float px = 1.0 / (u_r * u_px);",
    "  float rw = 7.0 / u_r;",
    // a soft shadow on the paper, down and right
    "  float sd = length((p - u_c - vec2(5.0, 9.0)) / u_r);",
    "  vec4 o = vec4(0.0, 0.0, 0.0, (1.0 - smoothstep(0.8, 1.2 + rw, sd)) * 0.2);",
    // the rim: a dark ring, lit from the top left as a rounded section
    "  float ring = clamp((1.0 + rw - r) / px + 0.5, 0.0, 1.0);",
    "  if (ring > 0.0) {",
    "    float t = clamp((r - 1.0) / rw, 0.0, 1.0) * 2.0 - 1.0;",
    "    float lit = dot(nd, vec2(-0.6, -0.8));",
    "    float shade = 0.55 + 0.45 * t * lit + 0.25 * sqrt(max(1.0 - t * t, 0.0));",
    "    float gl = pow(max(0.0, t * lit), 6.0) * 0.6;",
    "    o = over(o, vec3(0.1, 0.13, 0.12) * shade * 1.6 + gl, ring);",
    "  }",
    // the glass: magnified print with barrel distortion and coloured edges
    "  float g = clamp((1.0 - r) / px + 0.5, 0.0, 1.0);",
    "  if (g > 0.0) {",
    "    float r2 = min(r * r, 1.0);",
    "    vec2 k = d * u_r * (1.0 + 0.5 * r2) / u_mag;",
    "    vec3 col = vec3(tex(u_c + k * (1.0 + 0.012 * r2)).r, tex(u_c + k).g, tex(u_c + k * (1.0 - 0.012 * r2)).b);",
    "    col *= vec3(0.985, 1.0, 0.99) * (1.0 - 0.2 * smoothstep(0.6, 1.0, r));",
    "    col += 0.45 * smoothstep(0.8, 0.96, r) * (1.0 - smoothstep(0.96, 1.0, r)) * max(0.0, dot(nd, vec2(-0.64, -0.77)));",
    "    vec2 hs = (d - vec2(-0.4, -0.46)) / vec2(0.26, 0.14);",
    "    col += 0.28 * exp(-min(dot(hs, hs), 20.0));",
    "    o = over(o, col, g);",
    "  }",
    "  gl_FragColor = o;",
    "}"
  ].join("\n");

  function hex(v, f) {
    var m = /^#([0-9a-f]{6})$/i.exec((v || "").trim());
    return m ? "#" + m[1] : f;
  }

  function setup(root) {
    var canvas = root.querySelector(".gl-canvas"), print = root.querySelector(".gl-print");
    if (!canvas || !print || canvas.glOn) return;
    canvas.glOn = true;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;   // no WebGL: the plain leaflet stays
    var btn = root.querySelector(".gl-pause"), mover = root.querySelector(".gl-move");
    var loseExt = gl.getExtension("WEBGL_lose_context");
    var prog = null, U = {}, lost = false, ready = false, fonts = false, tex = null;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, cw = 1, ch = 1;
    var clock = null, paused = false, raf = 0, last = 0, onScreen = !("IntersectionObserver" in window);
    var frames = 0, firstT = 0, checked = false;
    var R = 56, mag = 2.3, bx0 = 0, by0 = 0, bx1 = 1, by1 = 1, homeX = 0, homeY = 0, placed = false;
    var cx = 0, cy = 0, tx = 0, ty = 0, steerAt = -1e9, steering = false, focused = false, dragging = false;
    var c2 = document.createElement("canvas");

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error("glass-lens shader: " + gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function build() {
      var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { if (!gl.isContextLost()) console.error("glass-lens link: " + gl.getProgramInfoLog(prog)); prog = null; return false; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(prog, "a_p");
      gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      ["res", "px", "area", "tex", "c", "r", "mag"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, "u_" + k); });
      tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(U.tex, 0);
      ready = false;
      return true;
    }

    // the print into a 2D canvas, word by word where the browser put it, sharp enough to magnify
    function paint() {
      if (!prog || lost || !fonts) return;
      var rb = root.getBoundingClientRect(), cs = getComputedStyle(root);
      var S = Math.min(3, 2048 / Math.max(rb.width, rb.height, 1));
      c2.width = Math.max(1, Math.round(rb.width * S)); c2.height = Math.max(1, Math.round(rb.height * S));
      var x = c2.getContext("2d");
      x.fillStyle = hex(cs.getPropertyValue("--gl-paper"), "#ffffff");
      x.fillRect(0, 0, c2.width, c2.height);
      x.textBaseline = "alphabetic";
      var walk = document.createTreeWalker(print, NodeFilter.SHOW_TEXT, null), node, range = document.createRange(), re = /\S+/g, m;
      homeX = 0; homeY = 0;
      while ((node = walk.nextNode())) {
        var ps = getComputedStyle(node.parentElement);
        x.font = ps.fontStyle + " " + ps.fontWeight + " " + parseFloat(ps.fontSize) * S + "px " + ps.fontFamily;
        x.fillStyle = ps.color;
        var asc = x.measureText("Hg").fontBoundingBoxAscent;
        re.lastIndex = 0;
        while ((m = re.exec(node.data))) {
          range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
          var rects = range.getClientRects();
          if (!rects.length) continue;
          var q = rects[0];
          var a = asc != null ? asc : q.height * S * 0.8;
          x.fillText(m[0], (q.left - rb.left) * S, (q.top - rb.top) * S + a);
          // the lens rests on the daily limit when it has no other place to be
          if (!homeX && m[0] === "8" && /^\s*tablets/.test(node.data.slice(m.index + 1))) { homeX = q.left - rb.left + 24; homeY = q.top - rb.top + q.height / 2; }
        }
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
      var pb = print.getBoundingClientRect();
      // the centre stays over the print and the whole lens inside the area, rim included
      var m2 = R + 9;
      bx0 = Math.max(pb.left - rb.left, m2); bx1 = Math.min(pb.right - rb.left, rb.width - m2);
      by0 = Math.max(pb.top - rb.top, m2); by1 = Math.min(pb.bottom - rb.top, rb.height - m2);
      if (bx0 > bx1) bx0 = bx1 = rb.width / 2;
      if (by0 > by1) by0 = by1 = rb.height / 2;
      if (!homeX) { homeX = bx0 + (bx1 - bx0) * 0.3; homeY = by0 + (by1 - by0) * 0.3; }
      ready = true;
      if (mover) mover.hidden = false;
      if (btn) btn.hidden = !clock;
    }

    function clampT() {
      tx = Math.max(bx0, Math.min(bx1, tx)); ty = Math.max(by0, Math.min(by1, ty));
    }
    function render() {
      if (!prog || lost || !w || !ready) return;
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.px, w / cw);
      gl.uniform2f(U.area, cw, ch);
      gl.uniform2f(U.c, cx, cy);
      gl.uniform1f(U.r, R);
      gl.uniform1f(U.mag, mag);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (mover) {
        mover.style.width = mover.style.height = 2 * R + "px";
        mover.style.transform = "translate(" + (cx - R) + "px," + (cy - R) + "px)";
      }
    }
    function fit() {
      var r = canvas.getBoundingClientRect(), cs = getComputedStyle(root);
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      w = Math.max(1, Math.round(cw * scale)); h = Math.max(1, Math.round(ch * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      R = Math.max(24, Math.min(160, parseFloat(cs.getPropertyValue("--gl-size")) || 56));
      mag = Math.max(1.2, Math.min(4, parseFloat(cs.getPropertyValue("--gl-mag")) || 2.3));
      paint();
      if (!ready) return;
      if (!placed || reduce.matches) { tx = cx = homeX; ty = cy = homeY; placed = true; }
      clampT(); cx = Math.max(bx0, Math.min(bx1, cx)); cy = Math.max(by0, Math.min(by1, cy));
      render();
      kick();
    }

    function settled() { return Math.abs(tx - cx) + Math.abs(ty - cy) < 0.05; }
    function live() { return onScreen && !document.hidden && !lost && prog && ready; }
    function kick() { if (!raf && live()) { last = 0; if (!checked) { frames = 0; firstT = 0; } raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!live()) return;
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (!checked && !reduce.matches) {
        if (!firstT) firstT = now;
        else if (++frames === 30) { checked = true; if ((now - firstT) / 30 > 20 && scale > 1) { scale = 1; fit(); } }
      }
      if (reduce.matches) { cx = tx; cy = ty; render(); return; }   // no drift and no easing: it goes where it is put
      if (!steering && !focused && now - steerAt > 1600) {
        // nobody steers: the lens drifts over the lines on the clock
        var a = (clock && clock.currentTime != null ? clock.currentTime % PERIOD : 0) / PERIOD * 6.2831853;
        tx = bx0 + (bx1 - bx0) * (0.5 + 0.42 * Math.sin(3 * a));
        ty = by0 + (by1 - by0) * (0.5 + 0.4 * Math.sin(2 * a + 0.9));
      }
      var k = 1 - Math.exp(-dt / (steering || focused ? 90 : 260));
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      render();
      if (!paused || !settled()) raf = requestAnimationFrame(frame);
    }

    function point(e) {
      if (e.pointerType === "touch" && !dragging) return;
      var b = root.getBoundingClientRect();
      tx = e.clientX - b.left; ty = e.clientY - b.top - (e.pointerType === "touch" ? R * 1.1 : 0);
      clampT();
      steering = true; steerAt = performance.now();
      kick();
    }
    function down(e) { if (e.pointerType === "touch") dragging = true; point(e); }
    function leave() { dragging = false; steering = false; steerAt = performance.now(); kick(); }
    function key(e) {
      var step = e.shiftKey ? 42 : 14, dx = 0, dy = 0;
      if (e.key === "ArrowLeft") dx = -step; else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step; else if (e.key === "ArrowDown") dy = step;
      else return;
      e.preventDefault();
      tx += dx; ty += dy; clampT();
      steerAt = performance.now();
      kick();
    }
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
        fit();
        return;
      }
      if (!clock && canvas.animate) {
        clock = canvas.animate([{ transform: "none" }, { transform: "none" }], { duration: PERIOD, iterations: Infinity });
        clock.id = "reading lens";   // a timer only: it animates nothing visible
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
    if (mover) {
      mover.addEventListener("keydown", key);
      mover.addEventListener("focus", function () { focused = true; tx = cx; ty = cy; kick(); });
      mover.addEventListener("blur", function () { focused = false; steerAt = performance.now(); kick(); });
    }
    if (btn) {
      btn.addEventListener("click", function () { setPaused(!paused); });
      btn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    }
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true; prog = null; ready = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (mover) mover.hidden = true;
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; if (build()) fit(); });
    window.addEventListener("pagehide", function () { if (loseExt && !lost) loseExt.loseContext(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && lost && loseExt) loseExt.restoreContext(); });
    if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(root); else window.addEventListener("resize", fit);
    if (!onScreen) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }).observe(root);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", sync);
    sync();
    // the words are drawn in the page's font, so wait for it
    var go = function () { fonts = true; fit(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go, go); else go();
  }

  function init() { document.querySelectorAll(".glasslens").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
