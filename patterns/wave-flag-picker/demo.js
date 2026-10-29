// Demo only: the fare line and the button follow the chosen site; the Wind switch pauses the flag.
// The picker is wave-flag-picker.js.
(function () {
  var picker = document.getElementById("picker");
  var price = document.getElementById("price");
  var cta = document.getElementById("cta");
  var SITES = {
    my: ["ms", "Pergi balik dari RM 1,286", "Teruskan"],
    id: ["id", "Pulang pergi mulai Rp 4.512.300", "Lanjutkan"],
    jp: ["ja", "往復 ¥41,820 から", "続ける"],
    th: ["th", "ไป-กลับ เริ่มต้น ฿9,860", "ดำเนินการต่อ"],
    vn: ["vi", "Khứ hồi từ 8.364.000 ₫", "Tiếp tục"]
  };
  picker.addEventListener("change", function (e) {
    var s = SITES[e.detail.option.dataset.site];
    price.lang = cta.lang = s[0];
    price.textContent = s[1];
    cta.textContent = s[2];
  });
  document.getElementById("wind").addEventListener("change", function (e) {
    if (e.target.checked) picker.flagPicker.play(); else picker.flagPicker.pause();
  });
})();
