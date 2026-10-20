/*
 * badge.js: badge.set(el, n) changes the count shown in a .badge.
 *   0 to more: the badge pops in.   more to 0: it drops out and hides.
 *   any other change: it bumps and the digits roll (up for more, down for fewer).
 * Counts over 99 show as 99+. The badge is decoration: put the count in the control's own label too.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function text(n) { return n > 99 ? "99+" : String(n); }

  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function num(el) {
    var span = el.querySelector(".badge-new, .badge-num");
    if (!span) {
      span = document.createElement("span");
      span.className = "badge-num";
      span.textContent = el.textContent;
      el.textContent = "";
      el.appendChild(span);
    }
    return span;
  }

  function set(el, n) {
    var old = parseInt(el.dataset.count || "0", 10);
    n = Math.max(0, n | 0);
    if (n === old) return;
    el.dataset.count = n;
    var cur = num(el);
    el.classList.remove("badge-out");

    if (n === 0) {
      if (reduce.matches) { el.hidden = true; return; }
      restart(el, "badge-out");
      el.addEventListener("animationend", function done(e) {
        if (e.target !== el) return;
        el.removeEventListener("animationend", done);
        if (el.dataset.count === "0") el.hidden = true;
      });
      return;
    }

    if (old === 0) {
      cur.textContent = text(n);
      el.hidden = false;
      el.querySelectorAll(".badge-old").forEach(function (o) { o.remove(); });
      el.classList.remove("badge-bump");
      if (!reduce.matches) restart(el, "badge-pop");
      return;
    }

    if (text(n) === text(old)) return;
    if (reduce.matches) { cur.textContent = text(n); return; }
    el.querySelectorAll(".badge-old").forEach(function (o) { o.remove(); });
    var leaving = cur.cloneNode(true);
    leaving.className = "badge-old";
    leaving.setAttribute("aria-hidden", "true");
    el.insertBefore(leaving, cur);
    leaving.addEventListener("animationend", function () { leaving.remove(); });
    el.style.setProperty("--badge-dir", n > old ? 1 : -1);
    cur.textContent = text(n);
    restart(cur, "badge-new");
    el.classList.remove("badge-pop");
    restart(el, "badge-bump");
  }

  window.badge = { set: set };
})();
