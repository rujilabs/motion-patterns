/*
 * wave-voice-note.js: the waveform of a voice message fills as it plays, and you can scrub it.
 *   <div class="voice-note" data-duration="47" data-seed="7311">
 *     <button class="vn-play" type="button" aria-label="Play voice note">...play and pause icons...</button>
 *     <div class="vn-wave" tabindex="0" aria-label="Voice note position"></div>
 *     <span class="vn-time">0:47</span>
 *     <button class="vn-rate" type="button">1x</button>          (optional)
 *   </div>
 * The bars come from data-peaks (one level per bar, 0 to 1, from your audio file) or, without it,
 * from a seeded speech shape: words of 2 to 6 bars that rise and fall, with breaths between them.
 * The played colour is a second row of the same bars, clipped by one Web Animation that runs for the
 * length of the note, so playing, pausing, scrubbing and speed are all that one animation's clock.
 * el.voiceNote.play(), .pause(), .toggle(), .seek(seconds). "play" and "pause" fire as it starts and stops,
 * and "ended" (instead of "pause") when it reaches the end.
 * No audio here: wire the same calls to an <audio> element in a real chat.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RATES = [1, 1.5, 2];

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // a speech shape: words that rise and fall, a stressed syllable now and then, short breaths between
  function speech(n, seed) {
    var r = rng(seed), out = [];
    while (out.length < n) {
      var len = 2 + Math.floor(r() * 5), peak = 0.42 + r() * 0.58;
      for (var j = 0; j < len && out.length < n; j++) {
        var shape = Math.sin(Math.PI * (j + 0.5) / len);
        out.push(Math.max(0.14, peak * (0.5 + 0.5 * shape) * (0.78 + 0.22 * r())));
      }
      var gap = r() < 0.16 ? 2 : r() < 0.55 ? 1 : 0;
      for (j = 0; j < gap && out.length < n; j++) out.push(0.07 + r() * 0.07);
    }
    return out;
  }
  function clock(s) {
    s = Math.max(0, Math.floor(s + 1e-6));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  function setup(el) {
    if (el.voiceNote) return;
    var D = Math.max(1, +el.dataset.duration || 10);
    var wave = el.querySelector(".vn-wave");
    var btn = el.querySelector(".vn-play");
    var time = el.querySelector(".vn-time");
    var rateBtn = el.querySelector(".vn-rate");
    var levels = el.dataset.peaks ? el.dataset.peaks.split(",").map(Number) : speech(+el.dataset.bars || 40, +el.dataset.seed || 1);
    var n = levels.length;

    // two rows of the same bars: the unplayed row, and the played row on top, clipped to the playhead
    function row(cls) {
      var r = document.createElement("div");
      r.className = cls;
      r.setAttribute("aria-hidden", "true");
      r.style.setProperty("--n", n);
      levels.forEach(function (a) {
        var b = document.createElement("span");
        b.className = "vn-bar";
        b.style.setProperty("--a", a.toFixed(3));
        r.appendChild(b);
      });
      wave.appendChild(r);
      return [].slice.call(r.children);
    }
    var barsA = row("vn-bars");
    var barsB = row("vn-bars vn-played");
    var played = wave.querySelector(".vn-played");
    var head = document.createElement("div");
    head.className = "vn-head";
    head.setAttribute("aria-hidden", "true");
    head.innerHTML = '<span class="vn-thumb"></span>';
    wave.appendChild(head);

    wave.setAttribute("role", "slider");
    wave.setAttribute("aria-valuemin", "0");
    wave.setAttribute("aria-valuemax", String(D));

    // one clock for the whole note; reduced motion moves the fill a whole second at a time
    var opts = { duration: D * 1000, fill: "both", easing: reduce.matches ? "steps(" + Math.round(D) + ", end)" : "linear" };
    var fill = played.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], opts);
    var move = head.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(0%)" }], opts);
    fill.id = "voice note plays";
    [fill, move].forEach(function (a) { a.pause(); a.currentTime = 0; if (a.persist) a.persist(); });

    var playing = false, rate = 0, started = false, lastSec = -1, lastT = -1, dragging = false;

    function now() { return Math.min(D, Math.max(0, (fill.currentTime || 0) / 1000)); }
    function setPlaying(on, quiet) {
      var was = playing;
      playing = on;
      if (!quiet && was !== on) el.dispatchEvent(new CustomEvent(on ? "play" : "pause", { bubbles: true }));
      el.classList.toggle("is-playing", on);
      btn.setAttribute("aria-label", (on ? "Pause" : "Play") + " voice note");
    }
    function play() {
      if (now() >= D - 0.05) seek(0);
      started = true;
      el.classList.add("is-started");
      fill.play(); move.play();
      setPlaying(true);
    }
    function pause() { fill.pause(); move.pause(); setPlaying(false); }
    function seek(s) {
      s = Math.max(0, Math.min(D, s));
      if (!playing) { fill.pause(); move.pause(); }
      fill.currentTime = move.currentTime = s * 1000;
      if (s > 0) { started = true; el.classList.add("is-started"); }
      sync();
    }
    fill.onfinish = function () {
      if (!playing) return;
      setPlaying(false, true);
      el.classList.add("is-heard");
      bump(-1);
      el.dispatchEvent(new CustomEvent("ended", { bubbles: true }));
    };

    // the bars right at the playhead lift a little with the voice; quiet bars barely move
    var lifted = [];
    function bump(i) {
      lifted.forEach(function (k) { barsA[k].style.transform = barsB[k].style.transform = ""; });
      lifted = [];
      if (i < 0 || reduce.matches) return;
      for (var k = Math.max(0, Math.floor(i) - 2); k <= Math.min(n - 1, Math.ceil(i) + 2); k++) {
        var d = k + 0.5 - i, s = 1 + 0.42 * levels[k] * Math.exp(-d * d / 1.1);
        barsA[k].style.transform = barsB[k].style.transform = "scaleY(" + s.toFixed(3) + ")";
        lifted.push(k);
      }
    }
    function sync() {
      var t = now();
      if (t === lastT) return;
      lastT = t;
      var sec = Math.floor(t + 1e-6);
      time.textContent = clock(started || t > 0 ? t : D);
      if (sec !== lastSec) {
        lastSec = sec;
        wave.setAttribute("aria-valuenow", String(sec));
        wave.setAttribute("aria-valuetext", clock(t) + " of " + clock(D));
      }
      bump(playing || dragging ? t / D * n : -1);
    }
    (function loop() { sync(); requestAnimationFrame(loop); })();

    // scrub: press anywhere on the wave and drag; it keeps playing if it was playing
    function at(e) {
      var r = wave.getBoundingClientRect();
      seek((e.clientX - r.left) / r.width * D);
    }
    wave.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      dragging = true;
      el.classList.add("is-scrubbing");
      wave.setPointerCapture(e.pointerId);
      at(e);
    });
    wave.addEventListener("pointermove", function (e) { if (dragging) at(e); });
    function end() { dragging = false; el.classList.remove("is-scrubbing"); }
    wave.addEventListener("pointerup", end);
    wave.addEventListener("pointercancel", end);

    wave.addEventListener("keydown", function (e) {
      var t = now(), k = e.key;
      if (k === "ArrowRight" || k === "ArrowUp") seek(Math.floor(t) + 1);
      else if (k === "ArrowLeft" || k === "ArrowDown") seek(Math.ceil(t) - 1);
      else if (k === "PageUp") seek(t + 5);
      else if (k === "PageDown") seek(t - 5);
      else if (k === "Home") seek(0);
      else if (k === "End") seek(D);
      else if (k === " " || k === "Enter") { if (playing) pause(); else play(); }
      else return;
      e.preventDefault();
    });
    btn.addEventListener("click", function () { if (playing) pause(); else play(); });
    if (rateBtn) {
      rateBtn.addEventListener("click", function () {
        rate = (rate + 1) % RATES.length;
        fill.updatePlaybackRate(RATES[rate]);
        move.updatePlaybackRate(RATES[rate]);
        rateBtn.textContent = RATES[rate] + "x";
        rateBtn.setAttribute("aria-label", "Playback speed " + RATES[rate] + "x");
      });
    }

    el.voiceNote = { play: play, pause: pause, seek: seek, toggle: function () { if (playing) pause(); else play(); } };
    el.classList.add("is-ready");
    setPlaying(false, true);
    sync();
  }

  function init() { document.querySelectorAll(".voice-note").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
