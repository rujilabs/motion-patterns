// Demo only: a fake search with a set wait per place. The loader is wave-pendulum-loader.js:
// start() when the search goes out, land() when the results come back.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wave = document.getElementById("wave");
  var loader = document.getElementById("loader");
  var list = document.getElementById("results");
  var status = document.getElementById("status");
  var PLACES = {
    cameron: { name: "Cameron Highlands", wait: 2600, found: 46, rows: [
      ["Rumah Teh Bertam", "Tanah Rata", "4.8", 213, 186], ["Kabus Lodge", "Brinchang", "4.6", 98, 142], ["Dusun Strawberi Homestay", "Kea Farm", "4.9", 61, 228]] },
    kundasang: { name: "Kundasang", wait: 3400, found: 19, rows: [
      ["Kinabalu View Cabin", "Mesilau", "4.9", 144, 265], ["Desa Kabus Inn", "Kundasang town", "4.5", 77, 158], ["Rumah Kayu Pinausok", "Ranau", "4.7", 52, 199]] },
    pangkor: { name: "Pulau Pangkor", wait: 4300, found: 31, rows: [
      ["Teluk Nipah Beach House", "Teluk Nipah", "4.6", 189, 210], ["Coral Bay Chalet", "Pasir Bogak", "4.7", 102, 176], ["Rumah Nelayan", "Sungai Pinang Kecil", "4.4", 66, 128]] }
  };
  var EASE = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";
  var run = 0, fade = null;

  function fill(p) {
    list.innerHTML = "";
    p.rows.forEach(function (r) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="r-name"></span><span class="r-where"></span><span class="r-rate"><b></b> </span><span class="r-price num">RM <small>a night</small></span>';
      li.querySelector(".r-name").textContent = r[0];
      li.querySelector(".r-where").textContent = r[1];
      li.querySelector(".r-rate b").textContent = r[2];
      li.querySelector(".r-rate").appendChild(document.createTextNode(r[3] + " reviews"));
      li.querySelector(".r-price").firstChild.textContent = "RM " + r[4] + " ";
      list.appendChild(li);
    });
  }
  function search(key) {
    var p = PLACES[key], me = ++run, t0 = performance.now();
    if (fade) fade.cancel();
    loader.classList.add("is-on");
    list.classList.add("is-waiting");
    status.textContent = "Searching homestays in " + p.name + ".";
    wave.pendulum.start();
    setTimeout(function () {
      if (me !== run) return;
      fill(p);
      list.classList.remove("is-waiting");
      wave.pendulum.land();
      status.textContent = p.found + " homestays in " + p.name + ", found in " + ((performance.now() - t0) / 1000).toFixed(1) + " s.";
      if (reduce.matches) { loader.classList.remove("is-on"); return; }
      // the swings die away and the loader fades, then the results rise in
      [].forEach.call(list.children, function (li, i) {
        li.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 420, delay: 520 + i * 70, easing: EASE, fill: "backwards" });
      });
      fade = loader.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, delay: 250, easing: "ease-in", fill: "forwards" });
      fade.onfinish = function () { if (me !== run) return; loader.classList.remove("is-on"); fade.cancel(); fade = null; };
    }, p.wait);
  }
  document.querySelectorAll('input[name="place"]').forEach(function (r) {
    r.addEventListener("change", function () { if (r.checked) search(r.value); });
  });
  // the first search goes out when the page comes into view
  var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); search("cameron"); } }, { threshold: 0.3 });
  io.observe(list);
})();
