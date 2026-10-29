/*
 * data-poll-results.js: live poll results you can vote in. Markup (one label per option):
 *
 *   <form class="poll"> <label class="pl-opt" data-votes="26">
 *     <input type="radio" name="pay" value="qr"> <span class="pl-name">QR pay</span>
 *     <span class="pl-pct">38%</span> <span class="pl-votes">26</span> <span class="pl-bar"></span>
 *   </label> ... </form>
 *
 * Each bar's --p is its share of all votes, and the shown percentages are rounded by largest remainder,
 * so they always add up to 100. Picking an option casts your vote (picking another moves it). New
 * votes from elsewhere come in through form.poll.add(index, n) or form.poll.set(counts); the bars
 * ease to the new shares and a small "+n" rises beside each option that gained.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var EASE = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";

  // Largest remainder: floor every share, then hand the points left over to the biggest remainders.
  function percents(counts) {
    var total = counts.reduce(function (s, c) { return s + c; }, 0);
    if (!total) return counts.map(function () { return 0; });
    var raw = counts.map(function (c) { return c * 100 / total; });
    var out = raw.map(Math.floor);
    var left = 100 - out.reduce(function (s, v) { return s + v; }, 0);
    raw.map(function (r, i) { return { i: i, r: r - Math.floor(r) }; })
      .sort(function (a, b) { return b.r - a.r || counts[b.i] - counts[a.i]; })
      .slice(0, left).forEach(function (x) { out[x.i]++; });
    return out;
  }

  function PollResults(form) {
    var opts = [].slice.call(form.querySelectorAll(".pl-opt"));
    var counts = opts.map(function (o) { return +o.dataset.votes || 0; });
    var mine = -1;
    var unit = form.dataset.unit || "votes";

    function render(gained) {
      var pct = percents(counts);
      var total = counts.reduce(function (s, c) { return s + c; }, 0);
      var top = Math.max.apply(null, counts);
      opts.forEach(function (o, i) {
        o.dataset.votes = counts[i];
        o.style.setProperty("--p", total ? (counts[i] / total).toFixed(4) : "0");
        o.classList.toggle("is-lead", counts[i] === top && top > 0);
        o.classList.toggle("is-mine", i === mine);
        var p = o.querySelector(".pl-pct"), v = o.querySelector(".pl-votes");
        if (p) p.textContent = pct[i] + "%";
        if (v) v.textContent = counts[i] + (counts[i] === 1 ? " " + unit.replace(/s$/, "") : " " + unit);
        if (gained && gained[i] > 0) bump(o, gained[i]);
      });
      form.dispatchEvent(new CustomEvent("poll:change", { detail: { counts: counts.slice(), percents: pct, total: total, mine: mine } }));
    }
    function bump(o, n) {
      if (reduce.matches) return;
      var chip = o.querySelector(".pl-delta");
      if (!chip) { chip = document.createElement("span"); chip.className = "pl-delta"; chip.setAttribute("aria-hidden", "true"); o.appendChild(chip); }
      chip.textContent = "+" + n;
      if (chip.anim) chip.anim.cancel();
      chip.anim = chip.animate([
        { opacity: 0, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)", offset: 0.2 },
        { opacity: 1, transform: "translateY(-2px)", offset: 0.7 },
        { opacity: 0, transform: "translateY(-6px)" }
      ], { duration: 1100, easing: EASE, fill: "both" });
    }

    form.addEventListener("change", function (e) {
      var i = opts.indexOf(e.target.closest(".pl-opt"));
      if (i < 0 || i === mine) return;
      var gained = counts.map(function () { return 0; });
      if (mine >= 0) counts[mine]--;
      counts[i]++;
      gained[i] = 1;
      mine = i;
      render(gained);
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); });

    var api = {
      add: function (i, n) { var g = counts.map(function () { return 0; }); counts[i] += n; g[i] = n; render(g); },
      set: function (next) { var g = next.map(function (c, i) { return c - counts[i]; }); counts = next.slice(); render(g); },
      counts: function () { return counts.slice(); },
      mine: function () { return mine; },
      clear: function () { mine = -1; opts.forEach(function (o) { var r = o.querySelector("input"); if (r) r.checked = false; }); render(); }
    };
    form.poll = api;
    render();
    form.classList.add("is-ready");
    return api;
  }
  PollResults.percents = percents;
  window.PollResults = PollResults;
})();
