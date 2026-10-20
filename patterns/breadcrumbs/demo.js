/* Demo only: a small shared drive. Open a folder to go deeper; pick a crumb to climb back. */
(function () {
  var tree = {
    "Projects": {
      "Kiosk refit": { "Drawings": { "Ground floor": {}, "Signage": {} }, "Quotes": {}, "Site photos": {} },
      "Night market stall": { "Menu boards": {}, "Permits": {} }
    },
    "Invoices": { "2025": {}, "2026": { "October": {}, "September": {} } },
    "Team": { "Onboarding": {}, "Rotas": {} }
  };
  var list = document.querySelector(".crumbs");
  var rows = document.querySelector(".rows");
  var count = document.querySelector(".count");
  var path = [];

  function node() {
    return path.reduce(function (n, name) { return n[name]; }, tree);
  }

  function render() {
    var n = node();
    var names = Object.keys(n);
    rows.textContent = "";
    count.textContent = names.length ? names.length + (names.length === 1 ? " folder" : " folders") : "Empty";
    if (!names.length) {
      var p = document.createElement("li");
      p.className = "row-empty";
      p.textContent = "Nothing in this folder yet.";
      rows.appendChild(p);
      return;
    }
    names.forEach(function (name, i) {
      var li = document.createElement("li");
      li.style.setProperty("--row-i", i);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "row";
      var inside = Object.keys(n[name]).length;
      b.innerHTML = '<svg viewBox="0 0 20 16" aria-hidden="true"><path d="M1.5 3.5 a1.5 1.5 0 0 1 1.5 -1.5 h4 l2 2 h8 a1.5 1.5 0 0 1 1.5 1.5 v8 a1.5 1.5 0 0 1 -1.5 1.5 h-14 a1.5 1.5 0 0 1 -1.5 -1.5 Z"/></svg><span></span><small class="num"></small>';
      b.querySelector("span").textContent = name;
      b.querySelector("small").textContent = inside ? inside + " inside" : "empty";
      b.addEventListener("click", function () { open(name); });
      li.appendChild(b);
      rows.appendChild(li);
    });
  }

  function crumb(name, depth) {
    var li = document.createElement("li");
    var body = document.createElement("span");
    body.className = "crumb-body";
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = name;
    b.addEventListener("click", function () { up(depth); });
    body.appendChild(b);
    li.appendChild(body);
    return li;
  }

  function open(name) {
    path.push(name);
    breadcrumbs.push(list, crumb(name, path.length));
    render();
  }

  function up(depth) {
    if (depth === path.length) return;
    path = path.slice(0, depth);
    breadcrumbs.trim(list, depth + 1);
    render();
  }

  list.querySelector("button").addEventListener("click", function () { up(0); });
  render();

  // walk two folders deep on load, so the trail is seen growing
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTimeout(function () { if (!path.length) open("Projects"); }, 500);
    setTimeout(function () { if (path.length === 1) open("Kiosk refit"); }, 1200);
  }
})();
