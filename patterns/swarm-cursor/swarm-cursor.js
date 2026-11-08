/*
 * swarm-cursor.js: in every .swarm, a small swarm of bees on its .sw-canvas follows the pointer
 * (mouse, pen or a dragging finger) and, when the pointer leaves, drifts back to circle the
 * [data-swarm-home] element. A focused link or button inside the swarm draws the bees to it, so the
 * keyboard gets the effect too. Each bee steers toward its own spot on a small loop round the target,
 * keeps a little room from the others, and wanders a touch, so they never move as one block.
 * After a finger lifts, the bees wait 1.2 s and go home.
 * Take-off on first view runs on a Web Animation ("swarm takes off"), so the timeline shows it.
 * The bees never stop on their own, so a button[data-pause] inside the swarm pauses and plays them.
 * The loop stops off screen and in a hidden tab. Under reduced motion the canvas stays empty and the
 * .swarm-still bees drawn in the page show instead.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TAU = Math.PI * 2;

  function setup(root) {
    var canvas = root.querySelector(".sw-canvas");
    if (!canvas || canvas.swarm) return;
    var ctx = canvas.getContext("2d");
    var home = root.querySelector("[data-swarm-home]");
    var btn = root.querySelector("button[data-pause]");
    var N = Math.max(3, Math.min(30, +root.dataset.count || 11));
    var px = new Float32Array(N), py = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N);
    var orb = new Float32Array(N), spin = new Float32Array(N), ph = new Float32Array(N), face = new Float32Array(N);
    var W = 0, H = 0, dpr = 1, size = 1, colors = {}, placed = false;
    var aim = { x: 0, y: 0, near: false }, homeAt = { x: 0, y: 0, r: 60 };
    var onScreen = false, raf = 0, last = 0, clock = 0, paused = false, takeoff = null, tookOff = false, lift = 0;

    for (var i = 0; i < N; i++) {
      orb[i] = 0.55 + 0.45 * ((i * 0.618) % 1);
      spin[i] = (0.6 + 0.7 * ((i * 0.37) % 1)) * (i % 3 === 0 ? -1 : 1);
      ph[i] = i / N * TAU;
    }

    function read() {
      var cs = getComputedStyle(root);
      ["--sw-body", "--sw-stripe", "--sw-wing"].forEach(function (k) { colors[k] = cs.getPropertyValue(k).trim(); });
      size = parseFloat(cs.getPropertyValue("--sw-size")) || 10;
    }
    function locate() {
      var a = canvas.getBoundingClientRect();
      if (home) {
        var r = home.getBoundingClientRect();
        homeAt.x = (r.left + r.right) / 2 - a.left; homeAt.y = (r.top + r.bottom) / 2 - a.top;
        homeAt.r = Math.max(40, Math.min(r.width, r.height) * 0.62);
      } else { homeAt.x = W / 2; homeAt.y = H / 2; homeAt.r = 60; }
    }
    function fit() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      read(); locate();
      if (!placed) {
        // the bees start resting on the jar
        for (var i = 0; i < N; i++) { px[i] = homeAt.x + Math.cos(ph[i]) * homeAt.r * 0.5; py[i] = homeAt.y - homeAt.r * 0.2 + Math.sin(ph[i]) * homeAt.r * 0.25; face[i] = ph[i]; }
        placed = true;
      }
      draw();
    }

    function step(dt) {
      var t = clock / 1000, cx, cy, rad, top;
      if (aim.near) { cx = aim.x; cy = aim.y; rad = 26; top = 360; }
      else { cx = homeAt.x; cy = homeAt.y; rad = homeAt.r; top = 120; }
      if (takeoff) top *= Math.min(1, (takeoff.currentTime || 0) / 1500);
      for (var i = 0; i < N; i++) {
        var a = ph[i] + spin[i] * t;
        var tx = cx + Math.cos(a) * rad * orb[i], ty = cy + Math.sin(a) * rad * orb[i] * 0.7;
        var dx = tx - px[i], dy = ty - py[i];
        var wx = dx * 3.2 + Math.sin(t * 2.3 + i * 1.7) * 40, wy = dy * 3.2 + Math.cos(t * 1.9 + i * 2.3) * 40;
        var m = Math.sqrt(wx * wx + wy * wy);
        if (m > top) { wx *= top / m; wy *= top / m; }
        var ax = (wx - vx[i]) * 4.5, ay = (wy - vy[i]) * 4.5;
        for (var j = 0; j < N; j++) {
          if (j === i) continue;
          var sx = px[i] - px[j], sy = py[i] - py[j], d2 = sx * sx + sy * sy;
          if (d2 < 196 && d2 > 0.01) { var k = (196 - d2) / 196 * 900 / Math.sqrt(d2); ax += sx * k; ay += sy * k; }
        }
        vx[i] += ax * dt; vy[i] += ay * dt;
        px[i] += vx[i] * dt; py[i] += vy[i] * dt;
        if (vx[i] * vx[i] + vy[i] * vy[i] > 64) {
          var want = Math.atan2(vy[i], vx[i]), turn = want - face[i];
          turn = Math.atan2(Math.sin(turn), Math.cos(turn));
          face[i] += turn * Math.min(1, dt * 10);
        }
      }
    }

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (reduce.matches) return;
      var L = size, B = size * 0.62;
      for (var i = 0; i < N; i++) {
        var c = Math.cos(face[i]) * dpr, s = Math.sin(face[i]) * dpr;
        ctx.setTransform(c, s, -s, c, px[i] * dpr, py[i] * dpr);
        ctx.fillStyle = colors["--sw-body"];
        ctx.beginPath(); ctx.ellipse(0, 0, L / 2, B / 2, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = colors["--sw-stripe"];
        ctx.fillRect(-L * 0.12, -B / 2, L * 0.12, B); ctx.fillRect(-L * 0.36, -B * 0.42, L * 0.1, B * 0.84);
        ctx.beginPath(); ctx.arc(L * 0.42, 0, B * 0.3, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = colors["--sw-wing"];
        ctx.beginPath();
        ctx.ellipse(-L * 0.05, -B * 0.62, L * 0.3, B * 0.34, -0.5, 0, TAU);
        ctx.ellipse(-L * 0.05, B * 0.62, L * 0.3, B * 0.34, 0.5, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    function live() { return onScreen && !document.hidden && !paused && !reduce.matches; }
    function wake() {
      if (!live()) { if (takeoff && takeoff.playState === "running") takeoff.pause(); return; }
      if (takeoff && takeoff.playState === "paused") takeoff.play();
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function frame(t) {
      raf = 0;
      if (!live()) return;
      var dt = last ? Math.min(0.033, (t - last) / 1000) : 0.016;
      last = t; clock += dt * 1000;
      if (lift && t > lift) { lift = 0; aim.near = false; }
      step(dt / 2); step(dt / 2);
      draw();
      raf = requestAnimationFrame(frame);
    }

    function point(e) {
      if (reduce.matches) return;
      var a = canvas.getBoundingClientRect();
      aim.x = e.clientX - a.left; aim.y = e.clientY - a.top; aim.near = true; lift = 0;
    }
    function leave(e) {
      if (e.pointerType === "touch" && e.type === "pointerup") { lift = performance.now() + 1200; return; }
      if (e.pointerType === "touch") return;
      aim.near = false; lift = 0;
    }
    function focusAt(el) {
      var a = canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
      aim.x = (r.left + r.right) / 2 - a.left; aim.y = r.top - a.top; aim.near = true;
    }

    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", point);
    root.addEventListener("pointerup", leave);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", function () { lift = performance.now() + 1200; });
    root.addEventListener("focusin", function (e) { if (e.target.matches(":focus-visible") && e.target !== btn) focusAt(e.target); });
    root.addEventListener("focusout", function () { aim.near = false; });
    if (btn) btn.addEventListener("click", function () { setPaused(!paused); });

    function setPaused(p) {
      paused = p;
      if (btn) { btn.setAttribute("aria-pressed", p ? "true" : "false"); btn.textContent = p ? "Let the bees fly" : "Pause the bees"; }
      wake();
    }
    function sync() {
      root.classList.toggle("sw-live", !reduce.matches);
      if (btn) btn.hidden = reduce.matches;
      draw(); wake();
    }

    if (window.ResizeObserver) new ResizeObserver(fit).observe(canvas); else window.addEventListener("resize", fit);
    window.addEventListener("resize", locate);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        onScreen = es[es.length - 1].isIntersecting;
        if (onScreen && !tookOff && !reduce.matches && canvas.animate) {
          tookOff = true;
          takeoff = canvas.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1500, easing: "linear", fill: "forwards" });
          takeoff.id = "swarm takes off";
          takeoff.onfinish = function () { takeoff.cancel(); takeoff = null; };
        }
        wake();
      }).observe(root);
    } else onScreen = true;
    document.addEventListener("visibilitychange", wake);
    reduce.addEventListener("change", sync);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { read(); draw(); });

    canvas.swarm = { pause: function () { setPaused(true); }, play: function () { setPaused(false); } };
    sync();
    fit();
  }

  function init() { document.querySelectorAll(".swarm").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
