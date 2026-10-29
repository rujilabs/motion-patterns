/*
 * gear-settings-icon.js: a settings cog that turns a set number of teeth.
 *
 *   <button class="gear-settings-icon" aria-expanded="false" aria-controls="settings">
 *     <svg viewBox="-12 -12 24 24" aria-hidden="true">
 *       <g class="gs-gear" data-teeth="10" data-x="-3" data-y="3"></g>
 *       <g class="gs-gear" data-teeth="7" data-mesh="0" data-dir="-45"></g>
 *     </svg>
 *     <span class="gs-label">Settings</span>
 *   </button>
 *
 * The script draws the teeth (module from data-module on the svg, default 1.25), meshes the second
 * cog with the first at the right phase and turns them:
 *   - data-hover-teeth (default 1) on mouse hover and on keyboard focus,
 *   - data-open-teeth (default 2) forward when aria-expanded turns true, and back when it turns false.
 * Your own code opens the panel and sets aria-expanded; the cog follows it. A whole number of teeth
 * leaves the icon looking exactly as it started, so it never rests crooked. Every turn lands on a
 * spring. Reduced motion: the cog never turns.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var PA = 20 * Math.PI / 180;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function inv(a) { return Math.tan(a) - a; }
  function pt(R, a) { return (R * Math.cos(a)).toFixed(3) + " " + (R * Math.sin(a)).toFixed(3); }

  // Involute cog centred on 0 0, tooth 0 on +x. Short (stub) teeth read better at icon size.
  function gearPath(z, m, add) {
    var r = m * z / 2, ra = r + add * m, rf = r - 0.95 * m, rb = r * Math.cos(PA);
    var half = (Math.PI / 2 - 0.12) / z;
    function th(R) { return half + inv(PA) - inv(Math.acos(Math.min(1, rb / Math.max(R, rb)))); }
    var r0 = Math.max(rb, rf), radii = [], i, j;
    for (i = 0; i <= 4; i++) radii.push(r0 + (ra - r0) * i / 4);
    var step = 2 * Math.PI / z, tb = th(r0), d = "";
    for (j = 0; j < z; j++) {
      var c = j * step;
      d += (j ? "L" : "M") + pt(rf, c - tb);
      for (i = 0; i < radii.length; i++) d += "L" + pt(radii[i], c - th(radii[i]));
      d += "A" + ra + " " + ra + " 0 0 1 " + pt(ra, c + th(ra));
      for (i = radii.length - 1; i >= 0; i--) d += "L" + pt(radii[i], c + th(radii[i]));
      d += "L" + pt(rf, c + tb) + "A" + rf + " " + rf + " 0 0 1 " + pt(rf, c + step - tb);
    }
    var b = r * 0.42; // the bore: the hole that makes a cog read as a cog
    d += "ZM" + b.toFixed(3) + " 0A" + b + " " + b + " 0 1 0 " + (-b).toFixed(3) + " 0A" + b + " " + b + " 0 1 0 " + b.toFixed(3) + " 0Z";
    return d;
  }

  function setup(btn) {
    var svg = btn.querySelector("svg");
    if (!svg || btn.gears) return;
    var m = +svg.dataset.module || 1.25, add = +svg.dataset.addendum || 0.8;
    var gears = [].map.call(svg.querySelectorAll(".gs-gear"), function (g) {
      return { host: g, z: +g.dataset.teeth, mesh: g.dataset.mesh, dir: +g.dataset.dir || 0, x: +g.dataset.x || 0, y: +g.dataset.y || 0 };
    });
    gears.forEach(function (g, i) {
      g.r = m * g.z / 2;
      if (!i || g.mesh == null) { g.k = 1; g.base = 0; }
      else {
        var p = gears[+g.mesh], phi = g.dir * Math.PI / 180;
        g.x = p.x + (p.r + g.r) * Math.cos(phi);
        g.y = p.y + (p.r + g.r) * Math.sin(phi);
        g.k = -p.k * p.z / g.z;
        g.base = phi + Math.PI + Math.PI / g.z - (p.z / g.z) * (p.base - phi);
      }
      g.host.setAttribute("transform", "translate(" + g.x.toFixed(3) + " " + g.y.toFixed(3) + ")");
      g.spin = document.createElementNS(NS, "path");
      g.spin.setAttribute("d", gearPath(g.z, m, add));
      g.spin.setAttribute("fill-rule", "evenodd");
      g.spin.setAttribute("class", "gs-cog");
      g.host.appendChild(g.spin);
      g.deg = g.base * 180 / Math.PI;
      g.spin.style.rotate = g.deg + "deg";
    });
    btn.gears = gears;
    btn.classList.add("is-ready");
    var ease = getComputedStyle(btn).getPropertyValue("--ease-spring").trim() || "ease-out";

    function turn(teeth) {
      if (!teeth) return;
      var driver = teeth * 360 / gears[0].z;
      gears.forEach(function (g) {
        var from = parseFloat(getComputedStyle(g.spin).rotate) || 0; // wherever it is right now
        g.deg += g.k * driver;
        if (g.anim) g.anim.cancel();
        g.spin.style.rotate = g.deg + "deg";
        if (reduce.matches || !g.spin.animate) return;
        var dur = 520 + 90 * Math.min(4, Math.abs(teeth));
        try { g.anim = g.spin.animate([{ rotate: from + "deg" }, { rotate: g.deg + "deg" }], { duration: dur, easing: ease }); }
        catch (e) { g.anim = g.spin.animate([{ rotate: from + "deg" }, { rotate: g.deg + "deg" }], { duration: dur, easing: "ease-out" }); }
      });
    }
    btn.turn = turn;

    var hover = +(btn.dataset.hoverTeeth || 1), open = +(btn.dataset.openTeeth || 2);
    btn.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") turn(hover); });
    // keyboard focus counts as hover, but only when Tab brought it here (not when a closing panel hands focus back)
    var tabbed = false;
    document.addEventListener("keydown", function (e) { if (e.key === "Tab") tabbed = true; }, true);
    document.addEventListener("pointerdown", function () { tabbed = false; }, true);
    btn.addEventListener("focus", function () { if (tabbed) turn(hover); tabbed = false; });
    var was = btn.getAttribute("aria-expanded") === "true";
    new MutationObserver(function () {
      var now = btn.getAttribute("aria-expanded") === "true";
      if (now !== was) turn(now ? open : -open);
      was = now;
    }).observe(btn, { attributes: true, attributeFilter: ["aria-expanded"] });
  }

  window.GearSettingsIcon = { setup: setup };
  function init() { document.querySelectorAll(".gear-settings-icon").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
