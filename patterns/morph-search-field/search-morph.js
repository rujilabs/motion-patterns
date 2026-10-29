/*
 * search-morph.js: opens .search-morph forms from their lens.
 *
 *   <form class="search-morph" role="search">
 *     <svg class="sm-shape" aria-hidden="true"><path class="sm-ring"/><path class="sm-handle"/><path class="sm-cross"/></svg>
 *     <input class="sm-input" type="search" name="q" aria-label="Search">
 *     <button class="sm-toggle" type="button" aria-expanded="false" aria-label="Open search"></button>
 *   </form>
 *
 * The form is as wide as the open field; closed, only the lens at its right end shows and takes
 * clicks. The button opens it, and then closes it (it is the cross). Escape closes it from the
 * field or the button, focus goes back to the button. "/" opens it from anywhere on the page that is not a
 * field. Moving focus out of an empty field closes it too, unless it moves into the results panel
 * the input names in aria-controls.
 * Events: "search-morph" on the form, detail.open.
 * The paths are written here from the form's size. The tween uses element.animate() on d where
 * the browser supports it, and a frame loop on the d attribute where it does not (Safari).
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hasD = window.CSS && CSS.supports && CSS.supports("d", 'path("M0 0")');
  var K = 0.5523;

  function f(n) { return Math.round(n * 100) / 100; }
  // a stadium: half circles of radius r centred at (x1, cy) and (x2, cy), x1 <= x2. Same commands at any length.
  function stadium(x1, x2, cy, r) {
    var k = K * r, t = cy - r, b = cy + r;
    return "M " + f(x1) + " " + f(t) + " L " + f(x2) + " " + f(t) +
      " C " + f(x2 + k) + " " + f(t) + " " + f(x2 + r) + " " + f(cy - k) + " " + f(x2 + r) + " " + f(cy) +
      " C " + f(x2 + r) + " " + f(cy + k) + " " + f(x2 + k) + " " + f(b) + " " + f(x2) + " " + f(b) +
      " L " + f(x1) + " " + f(b) +
      " C " + f(x1 - k) + " " + f(b) + " " + f(x1 - r) + " " + f(cy + k) + " " + f(x1 - r) + " " + f(cy) +
      " C " + f(x1 - r) + " " + f(cy - k) + " " + f(x1 - k) + " " + f(t) + " " + f(x1) + " " + f(t) + " Z";
  }
  function line(x1, y1, x2, y2) { return "M " + f(x1) + " " + f(y1) + " L " + f(x2) + " " + f(y2); }

  function shapes(form) {
    var W = form.clientWidth, H = form.clientHeight, sw = parseFloat(getComputedStyle(form).getPropertyValue("--sm-stroke")) || 1.75;
    var cx = W - H / 2, cy = H / 2;          // centre of the button at the right end
    var lr = H * 0.16, lx = cx - H * 0.055, ly = cy - H * 0.055, d = lr * 0.7071, x = H * 0.115;
    return {
      closed: {
        ring: stadium(lx, lx, ly, lr),
        handle: line(lx + d, ly + d, cx + H * 0.16, cy + H * 0.16),
        cross: line(cx, cy, cx, cy)
      },
      open: {
        ring: stadium(H / 2, W - H / 2, cy, H / 2 - sw / 2),
        handle: line(cx - x, cy - x, cx + x, cy + x),
        cross: line(cx + x, cy - x, cx - x, cy + x)
      }
    };
  }

  function nums(s) { return (s.match(/-?\d*\.?\d+/g) || []).map(Number); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function token(name, fb) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb; }

  function lerp(from, to, e) {
    var a = nums(from), b = nums(to), tpl = to.split(/-?\d*\.?\d+/), out = tpl[0];
    if (a.length !== b.length) return to;
    for (var i = 0; i < b.length; i++) out += f(a[i] + (b[i] - a[i]) * e) + tpl[i + 1];
    return out;
  }

  // Tween d from the shape on screen (which may be part way through the last tween) to the target.
  function tween(path, to, dur) {
    var from = path.getAttribute("d"), run = path._sm;
    if (run) {
      from = lerp(run.from, run.to, ease(Math.min(1, (performance.now() - run.t0) / run.dur)));
      if (run.anim) run.anim.cancel(); else cancelAnimationFrame(run.raf);
      path._sm = null;
    }
    path.setAttribute("d", to);
    if (reduce.matches || !from || from === to) return;
    run = path._sm = { from: from, to: to, t0: performance.now(), dur: dur };
    if (hasD && path.animate) {
      run.anim = path.animate([{ d: 'path("' + from + '")' }, { d: 'path("' + to + '")' }],
        { duration: dur, easing: token("--ease-inout", "ease-in-out") });
      run.anim.onfinish = function () { if (path._sm === run) path._sm = null; };
      return;
    }
    (function frame(now) {
      var t = Math.min(1, (now - run.t0) / dur);
      path.setAttribute("d", lerp(from, to, ease(t)));
      if (t < 1) run.raf = requestAnimationFrame(frame); else if (path._sm === run) path._sm = null;
    })(run.t0);
  }

  function draw(form, state, dur) {
    var s = shapes(form)[state];
    ["ring", "handle", "cross"].forEach(function (k) {
      var p = form.querySelector(".sm-" + k);
      if (p) dur ? tween(p, s[k], dur) : p.setAttribute("d", s[k]);
    });
  }

  function set(form, open, opts) {
    var btn = form.querySelector(".sm-toggle"), input = form.querySelector(".sm-input");
    if (form.classList.contains("is-open") === open) return;
    form.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? (btn.getAttribute("data-label-close") || "Close search") : (btn.getAttribute("data-label-open") || "Open search"));
    draw(form, open ? "open" : "closed", open ? 460 : 380);
    if (open) input.focus({ preventScroll: true });
    else if (opts && opts.focus) btn.focus({ preventScroll: true });
    form.dispatchEvent(new CustomEvent("search-morph", { bubbles: true, detail: { open: open } }));
  }

  function setup(form) {
    if (form._smReady) return;
    form._smReady = true;
    var btn = form.querySelector(".sm-toggle"), input = form.querySelector(".sm-input");
    draw(form, "closed", 0);
    btn.addEventListener("click", function () {
      var open = !form.classList.contains("is-open");
      if (!open) input.value = "", input.dispatchEvent(new Event("input", { bubbles: true }));
      set(form, open, { focus: true });
    });
    form.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !form.classList.contains("is-open")) return;
      e.preventDefault();
      input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
      set(form, false, { focus: true });
    });
    // focus leaving for the rest of the page closes an empty field; the results panel named in the
    // input's aria-controls counts as part of the search
    form.addEventListener("focusout", function (e) {
      var to = e.relatedTarget, panel = document.getElementById(input.getAttribute("aria-controls") || "");
      if (!to || input.value || form.contains(to) || (panel && panel.contains(to))) return;
      set(form, false);
    });
    if ("ResizeObserver" in window) new ResizeObserver(function () {
      draw(form, form.classList.contains("is-open") ? "open" : "closed", 0);
    }).observe(form);
  }

  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var form = document.querySelector(".search-morph");
    if (!form) return;
    e.preventDefault();
    set(form, true);
  });

  function init() { document.querySelectorAll(".search-morph").forEach(setup); }
  window.SearchMorph = { open: function (f) { set(f, true); }, close: function (f) { set(f, false, { focus: true }); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
