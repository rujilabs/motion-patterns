/*
 * staggered-list.js: every ul.sl becomes a listbox (tabindex 0, aria-activedescendant) of its li.sl-row options.
 * Up, Down, Home and End move the selection; a click or tap picks a row. One highlight (.sl-mark) slides to it.
 * The rows stagger in when the list first comes into view.
 *   StaggeredList.play(list)       runs the entrance again
 *   StaggeredList.add(list, li)    slides a new row in at the top; the rows below make room, the selection stays
 * data-sl-max: rows kept; older rows past it leave from the bottom (default 8).
 * The list fires "sl:select" (detail.row) when the selection changes.
 * Under reduced motion every move is instant.
 */
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var uid = 0;

  function token(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function ms(name, fallback) {
    var v = parseFloat(token(name, ""));
    return isNaN(v) ? fallback : v;
  }
  function rowsOf(list) { return [].slice.call(list.querySelectorAll(":scope > .sl-row")); }

  function prep(list, row) {
    if (!row.id) row.id = "sl-row-" + (++uid);
    row.setAttribute("role", "option");
    row.setAttribute("aria-selected", "false");
  }

  // the highlight: slides from wherever it is now (even mid-move) to the selected row
  function place(list, animate) {
    var mark = list.slMark, row = list.slSel;
    if (!row || !row.isConnected) return;
    var to = "translateY(" + row.offsetTop + "px)";
    var h = row.offsetHeight + "px";
    mark.style.left = row.offsetLeft + "px";
    mark.style.width = row.offsetWidth + "px";
    if (animate && !still.matches) {
      var cs = getComputedStyle(mark);
      mark.animate([{ transform: cs.transform === "none" ? "translateY(0px)" : cs.transform, height: cs.height }, { transform: to, height: h }],
        { duration: ms("--dur-base", 600) * .5, easing: token("--ease-out", "ease-out") });
    }
    mark.style.transform = to;
    mark.style.height = h;
  }

  function select(list, row, animate) {
    if (!row || row === list.slSel) return;
    if (list.slSel) list.slSel.setAttribute("aria-selected", "false");
    list.slSel = row;
    row.setAttribute("aria-selected", "true");
    list.setAttribute("aria-activedescendant", row.id);
    place(list, animate);
    // keep the picked row in view inside a scrolling list
    var top = row.offsetTop, bottom = top + row.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
    list.dispatchEvent(new CustomEvent("sl:select", { detail: { row: row } }));
  }

  function play(list) {
    list.classList.remove("is-waiting");
    if (still.matches) return;
    var dur = ms("--dur-base", 600) * .7, step = ms("--stagger", 80), ease = token("--ease-out", "ease-out");
    var rows = rowsOf(list);
    rows.forEach(function (r, i) {
      r.animate([{ opacity: 0, transform: "translateX(-18px)" }, { opacity: 1, transform: "none" }],
        { duration: dur, delay: Math.min(i, 8) * step, easing: ease, fill: "backwards" });
    });
    // the highlight grows out of its left edge as the first row lands
    list.slMark.animate([{ opacity: 0, transform: list.slMark.style.transform + " scaleX(.2)" }, { opacity: 1, transform: list.slMark.style.transform }],
      { duration: dur, easing: ease, fill: "backwards" });
  }

  function add(list, row) {
    var rows = rowsOf(list);
    var before = rows.map(function (r) { return r.offsetTop; });
    prep(list, row);
    list.insertBefore(row, rows[0] || null);
    var max = parseInt(list.getAttribute("data-sl-max"), 10) || 8;
    var all = rowsOf(list), gone = all.slice(max);
    if (gone.indexOf(list.slSel) > -1) select(list, all[max - 1], false);
    row.classList.remove("is-new");
    void row.offsetWidth;
    row.classList.add("is-new");
    if (still.matches) {
      gone.forEach(function (r) { r.remove(); });
      place(list, false);
      return;
    }
    var dur = ms("--dur-base", 600) * .75, ease = token("--ease-out", "ease-out");
    // FLIP: the old rows start where they were and slide down into their new places
    rows.forEach(function (r, i) {
      var dy = before[i] - r.offsetTop;
      if (dy) r.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }], { duration: dur, easing: ease });
    });
    row.animate([{ opacity: 0, transform: "translateY(-70%)" }, { opacity: 1, transform: "none" }], { duration: dur, easing: ease });
    place(list, true);
    gone.forEach(function (r) {
      r.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * .6, fill: "forwards" }).onfinish = function () { r.remove(); };
    });
  }

  function setup(list) {
    list.setAttribute("role", "listbox");
    list.tabIndex = 0;
    var mark = document.createElement("li");
    mark.className = "sl-mark";
    mark.setAttribute("role", "presentation");
    mark.setAttribute("aria-hidden", "true");
    list.insertBefore(mark, list.firstChild);
    list.slMark = mark;
    var rows = rowsOf(list);
    rows.forEach(function (r) { prep(list, r); });
    select(list, list.querySelector(".sl-row[data-sl-selected]") || rows[0], false);

    list.addEventListener("keydown", function (e) {
      var all = rowsOf(list), i = all.indexOf(list.slSel), next = null;
      if (e.key === "ArrowDown") next = all[Math.min(i + 1, all.length - 1)];
      else if (e.key === "ArrowUp") next = all[Math.max(i - 1, 0)];
      else if (e.key === "Home") next = all[0];
      else if (e.key === "End") next = all[all.length - 1];
      else return;
      e.preventDefault();
      select(list, next, true);
    });
    list.addEventListener("click", function (e) {
      var row = e.target.closest(".sl-row");
      if (row && list.contains(row)) { select(list, row, true); list.focus({ preventScroll: true }); }
    });
    if ("ResizeObserver" in window) new ResizeObserver(function () { place(list, false); }).observe(list);

    if (still.matches || !("IntersectionObserver" in window)) return;
    list.classList.add("is-waiting");
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); play(list); }
    }, { threshold: .3 });
    io.observe(list);
  }

  window.StaggeredList = { play: play, add: add, select: function (list, row) { select(list, row, true); } };

  function start() { document.querySelectorAll("ul.sl").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
