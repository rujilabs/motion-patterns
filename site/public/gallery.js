// Gallery behaviour: filters, replay, copy CSS. The page works without it.
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll(".entry"));

  document.querySelectorAll("[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      document.querySelectorAll("[data-filter]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      cards.forEach(function (c) { c.hidden = f !== "all" && c.getAttribute("data-kind") !== f; });
    });
  });

  document.querySelectorAll("[data-replay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var frame = btn.closest(".entry").querySelector("iframe");
      try { frame.contentWindow.location.reload(); } catch (e) { frame.src = frame.src; }
    });
  });

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.textContent;
      fetch(btn.getAttribute("data-copy"))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (css) { return navigator.clipboard.writeText(css); })
        .then(function () { btn.textContent = "Copied"; })
        .catch(function () { btn.textContent = "Copy failed"; })
        .then(function () { setTimeout(function () { btn.textContent = label; }, 1600); });
    });
  });
})();
