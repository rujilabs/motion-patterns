// Gallery behaviour: the live timeline under every stage, stage scaling and widths, filters, copy.
// Every page works without it: demos play on their own and the code is in the page.
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var status = document.getElementById("status");
  function announce(msg) { if (status) status.textContent = msg; }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function secs(ms) { return (Math.round(ms / 10) / 100).toFixed(2) + "s"; }

  /* filters */
  $all("[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      $all("[data-filter]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      var shown = 0;
      $all(".spec").forEach(function (c) { c.hidden = f !== "all" && c.getAttribute("data-cat") !== f; if (!c.hidden) shown++; });
      announce(shown + " patterns shown");
    });
  });

  /* copy */
  $all("[data-copy]").forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      fetch(btn.getAttribute("data-copy"))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (css) { return navigator.clipboard.writeText(css); })
        .then(function () { btn.textContent = "Copied"; btn.setAttribute("data-state", "done"); announce(btn.getAttribute("data-name") + " CSS copied"); })
        .catch(function () { btn.textContent = "Copy failed"; announce("Copy failed. Open the file from Source instead."); })
        .then(function () { setTimeout(function () { btn.textContent = label; btn.removeAttribute("data-state"); }, 1600); });
    });
  });

  /* stages: templates render at desktop width and scale down; the entry page can switch widths */
  function layout(stage) {
    var frame = stage.querySelector("iframe");
    if (!frame) return;
    var mode = stage.getAttribute("data-mode") || "fit";
    var cw = stage.clientWidth, ch = stage.clientHeight;
    var w = mode === "fit" ? (stage.classList.contains("stage-template") ? 1280 : cw) : Number(mode);
    var s = Math.min(1, cw / w);
    function apply() {
      frame.style.width = w + "px";
      frame.style.height = ch / s + "px";
      frame.style.transform = "translateX(" + Math.max(0, (cw - w * s) / 2) + "px) scale(" + s + ")";
    }
    apply();
    // A pattern demo taller than its stage (three columns make stages short) renders on a larger canvas
    // and scales down until it fits, so nothing is cut off at the bottom. Widening the canvas reflows the
    // demo shorter, so a few passes settle it. Scroll demos are meant to scroll, so they keep their size.
    if (mode !== "fit" || !stage.classList.contains("stage-pattern") || stage.classList.contains("stage-scrolls")) return;
    var doc;
    try { doc = frame.contentDocument; } catch (e) { return; }
    if (!doc || !doc.body || doc.URL === "about:blank") return;
    for (var i = 0; i < 4; i++) {
      var need = doc.documentElement.scrollHeight, have = ch / s;
      if (need <= have + 1) break;
      s = Math.max(0.5, s * have / need * 0.99);
      w = cw / s;
      apply();
    }
  }
  var stages = $all(".stage");
  // refit when a demo loads, and once more after its fonts land
  stages.forEach(function (stage) {
    var f = stage.querySelector("iframe");
    if (f) f.addEventListener("load", function () { layout(stage); setTimeout(function () { layout(stage); }, 700); });
  });
  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(function (list) { list.forEach(function (r) { layout(r.target); }); });
    stages.forEach(function (s) { ro.observe(s); });
  } else {
    stages.forEach(layout);
    window.addEventListener("resize", function () { stages.forEach(layout); });
  }
  $all("[data-width]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var stage = btn.closest(".studio-stage").querySelector(".stage");
      var mode = btn.getAttribute("data-width");
      $all("[data-width]", btn.parentNode).forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      stage.setAttribute("data-mode", mode);
      stage.classList.toggle("is-device", mode !== "fit");
      layout(stage);
      announce("Stage width: " + btn.textContent);
    });
  });

  /* demo loading: near the screen, and on the home page only after the headline has landed.
     Templates (data-live) are heavier: their poster shows while the page scrolls, the live page loads once
     the visitor stops with most of it in view, and unloads again when it leaves the screen. */
  var waiting = $all("iframe[data-src]");
  var live = waiting.filter(function (f) { return f.hasAttribute("data-live"); });
  var plain = waiting.filter(function (f) { return !f.hasAttribute("data-live"); });
  var load = function (f) { if (!f.getAttribute("src")) f.setAttribute("src", f.getAttribute("data-src")); };
  var scrolling = false, settleTimer = 0;
  function settle() {
    live.forEach(function (f) {
      if (f._ratio >= 0.5 && !f._live) { f._live = true; f.setAttribute("src", f.getAttribute("data-src")); }
    });
  }
  function begin() {
    if (!("IntersectionObserver" in window)) { waiting.forEach(load); return; }
    var lo = new IntersectionObserver(function (list) {
      list.forEach(function (en) { if (en.isIntersecting) { load(en.target); lo.unobserve(en.target); } });
    }, { rootMargin: "500px 0px" });
    plain.forEach(function (f) { lo.observe(f); });
    var lv = new IntersectionObserver(function (list) {
      list.forEach(function (en) {
        var f = en.target;
        f._ratio = en.isIntersecting ? en.intersectionRatio : 0;
        if (!en.isIntersecting && f._live) {
          f._live = false;
          f.closest(".stage").classList.remove("is-live");
          f.setAttribute("src", "about:blank");
        }
      });
      if (!scrolling) settle();
    }, { threshold: [0, 0.5] });
    live.forEach(function (f) {
      f.addEventListener("load", function () { if (f._live) f.closest(".stage").classList.add("is-live"); });
      lv.observe(f);
    });
    window.addEventListener("scroll", function () {
      scrolling = true;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () { scrolling = false; settle(); }, 200);
    }, { passive: true });
  }
  if (waiting.length) setTimeout(begin, document.querySelector("[data-hero]") && !reduce.matches ? 1900 : 0);

  /* timelines */
  var sheets = [];
  var offsets = typeof WeakMap === "function" ? new WeakMap() : null;

  function Sheet(node) {
    var self = this;
    this.node = node;
    this.id = node.getAttribute("data-sheet");
    this.trigger = node.getAttribute("data-trigger") || "";
    this.body = node.querySelector(".sheet-body");
    this.time = node.querySelector(".sheet-time");
    this.items = [];
    this.scroll = [];
    this.T = 1000;
    this.rate = 1;
    this.visible = false;
    this.sig = "";
    this.cap = node.closest(".spec") ? 5 : node.closest(".reel") ? 7 : 0;
    if (this.id === "hero") {
      var hero = document.querySelector("[data-hero]");
      this.get = function () { return hero ? hero.getAnimations({ subtree: true }) : []; };
      this.ready();
    } else {
      this.frame = document.querySelector('iframe[data-for="' + this.id + '"]');
      this.get = function () {
        try { var d = self.frame.contentDocument; return d && d.getAnimations ? d.getAnimations() : []; } catch (e) { return []; }
      };
      var loaded = function () {
        self.known = []; // a reloaded demo is a new document; forget the old one's animations
        self.sig = "";
        self.ready();
        setTimeout(function () { self.scan(); }, 400);
        setTimeout(function () { self.scan(); }, 1600);
      };
      this.frame.addEventListener("load", function () {
        try { if (self.frame.contentDocument.URL === "about:blank") return; } catch (e) { /* cross-origin never happens here */ }
        loaded();
      });
      try { if (this.frame.contentDocument && this.frame.contentDocument.readyState === "complete" && this.frame.contentDocument.URL !== "about:blank") loaded(); } catch (e) { /* not ready */ }
    }
    this.bind();
  }

  Sheet.prototype.ready = function () {
    this.node.setAttribute("data-ready", "");
    this.scan();
  };

  Sheet.prototype.scan = function () {
    var self = this;
    // Keep every animation seen so far: one that finished without a fill drops out of getAnimations(),
    // but it still belongs on the timeline and replay can restart it.
    var known = this.known || (this.known = []);
    this.get().forEach(function (a) { if (known.indexOf(a) < 0) known.push(a); });
    this.known = known = known.filter(function (a) { var t = a.effect && a.effect.target; return t && t.isConnected && a.playState !== "idle"; });
    var all = known.filter(function (a) { return a.effect.getComputedTiming; });
    var timed = [], scroll = [];
    all.forEach(function (a) {
      var tl = a.timeline;
      if (!tl || "axis" in tl || "source" in tl) scroll.push(a); else timed.push(a);
    });
    var starts = timed.map(function (a) { return a.startTime; }).filter(function (s) { return s != null; });
    var base = starts.length ? Math.min.apply(null, starts) : 0;
    this.items = timed.map(function (a) {
      var t = a.effect.getComputedTiming();
      var off = offsets && offsets.has(a) ? offsets.get(a) : (a.startTime != null ? (a.startTime - base) * Math.abs(a.playbackRate || 1) : 0);
      if (offsets && a.startTime != null) offsets.set(a, off);
      var dur = typeof t.duration === "number" ? t.duration : 0;
      var start = off + t.delay;
      var end = t.iterations === Infinity ? Infinity : start + dur * t.iterations + t.endDelay;
      return { a: a, name: label(a), off: off, start: start, end: end, dur: dur };
    }).filter(function (i) { return i.dur > 0; });
    this.scroll = scroll;
    var T = 0, loops = false;
    this.items.forEach(function (i) {
      if (i.end === Infinity) { loops = true; T = Math.max(T, i.start + i.dur * 2); } else T = Math.max(T, i.end);
    });
    this.loops = loops;
    this.T = Math.min(Math.max(T, 600), 20000);
    var sig = this.items.map(function (i) { return i.name + i.start + i.end; }).join("|") + "#" + scroll.length;
    if (sig !== this.sig) { this.sig = sig; this.render(); }
    this.tick();
  };

  function label(a) {
    if (a.animationName) return a.animationName;
    if (a.transitionProperty) return a.transitionProperty;
    return a.id || "motion";
  }

  Sheet.prototype.render = function () {
    var self = this, body = this.body, T = this.T;
    body.textContent = "";
    if (reduce.matches) {
      body.appendChild(el("p", "sheet-empty", "Reduced motion is on, so every demo shows its finished state."));
      return;
    }
    if (!this.items.length && !this.scroll.length) {
      body.appendChild(el("p", "sheet-empty", this.trigger === "hover" ? "Hover or focus the stage to play it." : this.trigger === "click" ? "Use the controls in the stage to play it." : this.trigger === "in-view" ? "Plays when the stage scrolls into view." : "Nothing is moving right now. Press replay."));
      return;
    }
    var pct = function (ms) { return Math.max(0, Math.min(100, (ms / T) * 100)) + "%"; };

    var ruler = el("div", "sh-ruler");
    var steps = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000], step = steps[steps.length - 1];
    for (var s = 0; s < steps.length; s++) if (T / steps[s] <= Math.max(2, Math.floor((body.clientWidth - 140) / 64))) { step = steps[s]; break; }
    for (var v = 0; v <= T + 1; v += step) {
      var tick = el("span", "sh-tick");
      tick.style.left = pct(v);
      tick.appendChild(el("span", v / T > 0.92 ? "end" : null, v === 0 ? "0" : secs(v)));
      ruler.appendChild(tick);
    }
    body.appendChild(ruler);

    var rows = {}, order = [];
    this.items.forEach(function (i) {
      if (!rows[i.name]) { rows[i.name] = []; order.push(i.name); }
      rows[i.name].push(i);
    });
    order.forEach(function (name) {
      var list = rows[name];
      var row = el("div", "sh-row");
      var nm = el("span", "sh-name");
      nm.appendChild(el("b", null, name));
      if (list.length > 1) nm.appendChild(document.createTextNode(" ×" + list.length));
      nm.title = name + (list.length > 1 ? ", " + list.length + " elements" : "");
      row.appendChild(nm);
      var lane = el("span", "sh-lane");
      var start = Math.min.apply(null, list.map(function (i) { return i.start; }));
      var endF = Math.max.apply(null, list.map(function (i) { return i.end === Infinity ? -1 : i.end; }));
      var loop = list.some(function (i) { return i.end === Infinity; });
      var bar = el("span", "sh-bar" + (loop ? " loop" : ""));
      bar.style.left = pct(start);
      bar.style.width = "calc(" + pct((loop ? T : endF) - start) + " - 1px)";
      lane.appendChild(bar);
      var keys = [];
      list.forEach(function (i) { keys.push(i.start); if (i.end !== Infinity) keys.push(i.end); });
      keys.sort(function (x, y) { return x - y; }).filter(function (k, n, arr) { return !n || k - arr[n - 1] > T * 0.006; }).slice(0, 40).forEach(function (k) {
        var key = el("span", "sh-key");
        key.style.left = pct(k);
        lane.appendChild(key);
      });
      row.appendChild(lane);
      body.appendChild(row);
    });
    this.scroll.forEach(function (a) {
      var row = el("div", "sh-row");
      row.appendChild(el("span", "sh-name")).appendChild(el("b", null, label(a)));
      var lane = el("span", "sh-lane");
      var bar = el("span", "sh-bar scroll");
      bar.style.left = "0"; bar.style.width = "100%";
      lane.appendChild(bar);
      row.appendChild(lane);
      body.appendChild(row);
    });
    if (this.cap && order.length > this.cap) body.appendChild(el("p", "sh-more", "+" + (order.length - this.cap) + " more rows on the entry page"));
    if (this.scroll.length) body.appendChild(el("p", "sh-note", "Dashed rows follow the scroll inside the stage, so scroll the demo to play them."));
    body.appendChild(el("span", "sh-head"));
    if (this.items.length) {
      body.tabIndex = 0;
      body.setAttribute("role", "slider");
      body.setAttribute("aria-label", "Scrub the timeline");
      body.setAttribute("aria-valuemin", "0");
      body.setAttribute("aria-valuemax", String(Math.round(T)));
    }
  };

  // The playhead is the furthest finite animation (ghost frames and early finishers stop sooner);
  // with only loops on stage it wraps around the shown length.
  Sheet.prototype.now = function () {
    var t = -1, any = null;
    this.items.forEach(function (i) {
      var c = i.a.currentTime;
      if (c == null) return;
      any = i;
      if (i.end !== Infinity) t = Math.max(t, Math.min(c + i.off, i.end));
    });
    if (!any) return 0;
    if (t < 0 || this.loops) {
      var lt = any.a.currentTime + any.off;
      t = Math.max(t, this.loops && lt > this.T ? lt % this.T : lt);
    }
    return Math.max(0, Math.min(this.T, t));
  };

  Sheet.prototype.running = function () {
    for (var i = 0; i < this.items.length; i++) if (this.items[i].a.playState === "running") return true;
    return false;
  };

  Sheet.prototype.tick = function () {
    if (!this.items.length) return;
    var t = this.now();
    var f = (t / this.T).toFixed(4);
    if (f === this.lastF) return;
    this.lastF = f;
    this.body.style.setProperty("--t", f);
    this.time.textContent = secs(t);
    // Screen readers only need the value when someone is scrubbing, not sixty times a second.
    if (this.paused || this.dragging) {
      this.body.setAttribute("aria-valuenow", String(Math.round(t)));
      this.body.setAttribute("aria-valuetext", secs(t));
    }
  };

  // Offscreen demos stop: every stage shares this page's main thread, so a loop nobody can see
  // still costs frames. Only animations this script paused are resumed.
  Sheet.prototype.sleep = function (asleep) {
    if (!this.frame) return;
    var doc;
    try { doc = this.frame.contentDocument; } catch (e) { return; }
    if (!doc || !doc.getAnimations) return;
    if (asleep) {
      this.slept = doc.getAnimations().filter(function (a) { return a.playState === "running"; });
      this.slept.forEach(function (a) { a.pause(); });
    } else if (this.slept) {
      if (!this.paused) this.slept.forEach(function (a) { try { a.play(); } catch (e) { /* gone */ } });
      this.slept = null;
    }
  };

  Sheet.prototype.each = function (fn) { this.items.forEach(function (i) { try { fn(i); } catch (e) { /* an animation can vanish mid-call */ } }); };
  Sheet.prototype.setPaused = function (p) {
    this.paused = p;
    if (p) this.node.setAttribute("data-paused", ""); else this.node.removeAttribute("data-paused");
    this.node.querySelector('[data-act="toggle"]').setAttribute("aria-label", p ? "Play" : "Pause");
  };
  Sheet.prototype.seek = function (t) {
    this.each(function (i) { i.a.pause(); i.a.currentTime = t - i.off; });
    this.setPaused(true);
    this.lastF = null;
    this.tick();
  };
  Sheet.prototype.replay = function () {
    var rate = this.rate;
    this.scan();
    this.each(function (i) { i.a.currentTime = -i.off; i.a.playbackRate = rate; i.a.play(); });
    this.setPaused(false);
    announce("Replaying");
  };
  Sheet.prototype.toggle = function () {
    if (this.paused) {
      if (!this.loops && this.now() >= this.T - 1) { this.replay(); return; }
      this.each(function (i) { i.a.play(); });
      this.setPaused(false);
    } else if (!this.loops && this.now() >= this.T - 1) {
      this.replay();
    } else {
      this.each(function (i) { i.a.pause(); });
      this.setPaused(true);
    }
  };
  Sheet.prototype.speed = function (btn) {
    var rate = this.rate = this.rate === 1 ? 0.25 : 1;
    this.each(function (i) { if (i.a.updatePlaybackRate) i.a.updatePlaybackRate(rate); else i.a.playbackRate = rate; });
    btn.setAttribute("aria-pressed", String(rate !== 1));
    announce(rate === 1 ? "Normal speed" : "Quarter speed");
  };

  Sheet.prototype.bind = function () {
    var self = this, body = this.body;
    this.node.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "toggle") self.toggle();
      else if (act === "replay") self.replay();
      else if (act === "speed") self.speed(b);
    });
    var lane = function () { return body.querySelector(".sh-ruler"); };
    var at = function (e) {
      var r = lane().getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * self.T;
    };
    body.addEventListener("pointerdown", function (e) {
      if (!self.items.length || !lane() || e.button !== 0) return;
      if (e.clientX < lane().getBoundingClientRect().left - 4) return;
      self.dragging = true;
      body.setPointerCapture(e.pointerId);
      self.seek(at(e));
      e.preventDefault();
    });
    body.addEventListener("pointermove", function (e) { if (self.dragging) self.seek(at(e)); });
    var stop = function () { self.dragging = false; };
    body.addEventListener("pointerup", stop);
    body.addEventListener("pointercancel", stop);
    body.addEventListener("keydown", function (e) {
      if (!self.items.length) return;
      var step = e.shiftKey ? 500 : 50, t = self.now();
      if (e.key === "ArrowRight" || e.key === "ArrowUp") self.seek(Math.min(self.T, t + step));
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") self.seek(Math.max(0, t - step));
      else if (e.key === "Home") self.seek(0);
      else if (e.key === "End") self.seek(self.T);
      else if (e.key === " " || e.key === "Enter") self.toggle();
      else return;
      e.preventDefault();
    });
  };

  $all("[data-sheet]").forEach(function (node) { sheets.push(new Sheet(node)); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) {
        sheets.forEach(function (s) {
          if (s.box !== en.target) return;
          s.visible = en.isIntersecting;
          s.sleep(!en.isIntersecting);
        });
      });
    }, { rootMargin: "120px 0px" });
    sheets.forEach(function (s) { s.box = s.node.closest(".spec, .reel, .studio-stage, .hero") || s.node; io.observe(s.box); });
  } else sheets.forEach(function (s) { s.visible = true; });

  // One clock for the timelines on screen. It only draws while something there is playing, and a
  // slower rescan picks up animations that start later.
  var last = 0;
  function frame(now) {
    var rescan = now - last > 2000;
    if (rescan) last = now;
    sheets.forEach(function (s) {
      if (!s.visible || !s.node.hasAttribute("data-ready")) return;
      if (rescan && !s.dragging && !s.paused) s.scan();
      else if (s.dragging || s.running()) s.tick();
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (reduce.addEventListener) reduce.addEventListener("change", function () { sheets.forEach(function (s) { s.sig = ""; s.scan(); }); });
})();
