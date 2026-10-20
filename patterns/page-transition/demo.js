/* Demo only: a list of trips and one detail page. A card opens its trip; Back returns to the list. */
(function () {
  var list = document.getElementById("pt-list");
  var detail = document.getElementById("pt-detail");
  var hero = detail.querySelector(".hero");
  var title = detail.querySelector("h1");
  var meta = detail.querySelector(".d-meta");
  var text = detail.querySelector(".d-text");
  var back = detail.querySelector(".back");
  var card = null;

  function open(c) {
    card = c;
    hero.replaceChildren(c.querySelector(".thumb svg").cloneNode(true));
    title.textContent = c.querySelector(".c-title").textContent;
    meta.textContent = c.querySelector(".c-meta").textContent;
    text.textContent = c.dataset.text;
    pageTransition(function () { list.hidden = true; detail.hidden = false; title.focus(); }, {
      page: detail,
      shared: [
        { name: "pt-media", from: c.querySelector(".thumb"), to: hero },
        { name: "pt-title", from: c.querySelector(".c-title"), to: title }
      ]
    });
  }

  function close() {
    var c = card;
    pageTransition(function () { detail.hidden = true; list.hidden = false; c.focus(); }, {
      page: list,
      shared: [
        { name: "pt-media", from: hero, to: c.querySelector(".thumb") },
        { name: "pt-title", from: title, to: c.querySelector(".c-title") }
      ]
    });
  }

  list.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("click", function () { open(c); });
  });
  back.addEventListener("click", close);
})();
