var S = { name: "", slots: [null, null, null], done: [] };
var page = "home",
  formIdx = -1,
  showRes = false;
var DAYS = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];
try {
  var _d = localStorage.getItem("chevar");
  if (_d) S = JSON.parse(_d);
} catch (e) {}
function save() {
  try {
    localStorage.setItem("chevar", JSON.stringify(S));
  } catch (e) {}
}
function $(i) {
  return document.getElementById(i);
}
function fmt(n) {
  return Number(n)
    .toLocaleString("ru-RU")
    .replace(/\u00a0/g, " ");
}
function today() {
  var d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
function left(s) {
  var ms = s.start + s.hours * 3600000 - Date.now();
  if (ms <= 0) return "Vaqti tugadi";
  var m = Math.ceil(ms / 60000);
  return (
    "Qoldi: " +
    (m >= 60 ? Math.floor(m / 60) + " soat " : "") +
    (m % 60) +
    " daqiqa"
  );
}
var ICON =
  '<svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="#c4829c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="22" fill="#f8eef2" stroke="none"/><path d="M17 12h14l-3 6 7 18H13l7-18z" fill="#fff"/><path d="M20 12c0 3 2 5 4 5s4-2 4-5"/></svg>';
function go(p) {
  page = p;
  formIdx = -1;
  render();
}
function setName() {
  var v = $("nm").value.trim();
  if (!v) return;
  S.name = v;
  save();
  render();
}
function addSlot(i) {
  var n = $("kn").value.trim(),
    m = parseFloat($("ks").value),
    h = parseFloat($("kh").value);
  if (!n || !(m >= 0) || !(h > 0)) {
    alert("Hamma joyni to'ldiring");
    return;
  }
  S.slots[i] = { name: n, sum: m, hours: h, start: Date.now() };
  formIdx = -1;
  save();
  render();
}
function fin(i) {
  var s = S.slots[i];
  S.done.push({ name: s.name, sum: s.sum, hours: s.hours, day: today() });
  S.slots[i] = null;
  save();
  render();
}
function changeName() {
  var v = prompt("Yangi ism:", S.name);
  if (v && v.trim()) {
    S.name = v.trim();
    save();
    render();
  }
}
function reset() {
  if (confirm("Hamma ma'lumot o'chiriladi. Rozimisiz?")) {
    S = { name: S.name, slots: [null, null, null], done: [] };
    save();
    showRes = false;
    render();
  }
}
function homeView() {
  var h = "";
  for (var i = 0; i < 3; i++) {
    var s = S.slots[i];
    if (s) {
      h +=
        '<div class="card"><div class="row"><span class="big">' +
        esc(s.name) +
        '</span><span class="big">' +
        fmt(s.sum) +
        ' so\'m</span></div><div class="mut">' +
        s.hours +
        ' soatda bitadi</div><div class="left" data-i="' +
        i +
        '">' +
        left(s) +
        '</div><button class="ok" onclick="fin(' +
        i +
        ')">Bitdi</button></div>';
    } else if (formIdx === i) {
      h +=
        '<div class="card"><input id="kn" placeholder="Ko\'ylak nomi"><input id="ks" type="number" inputmode="numeric" placeholder="Summasi (so\'m)"><input id="kh" type="number" inputmode="decimal" placeholder="Necha soatda bitadi?"><button onclick="addSlot(' +
        i +
        ')">Qo\'shish</button><button class="g" onclick="formIdx=-1;render()">Bekor qilish</button></div>';
    } else
      h +=
        '<div class="card empty"><div class="mut">Bo\'sh joy ' +
        (i + 1) +
        '</div><button onclick="formIdx=' +
        i +
        ";render()\">Yangi qo'shish</button></div>";
  }
  return h + calcView();
}
function wk(day) {
  var p = day.split("-");
  var d = new Date(+p[0], +p[1] - 1, +p[2]);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
function sh(k) {
  var p = k.split("-");
  var a = new Date(+p[0], +p[1] - 1, +p[2]),
    b = new Date(a);
  b.setDate(b.getDate() + 6);
  var f = function (d) {
    return (
      String(d.getDate()).padStart(2, "0") +
      "." +
      String(d.getMonth() + 1).padStart(2, "0")
    );
  };
  return f(a) + " - " + f(b);
}
function sum(list) {
  var h = 0,
    m = 0;
  list.forEach(function (d) {
    h += d.hours;
    m += d.sum;
  });
  return { n: list.length, h: Math.round(h * 10) / 10, m: m };
}
function calcView() {
  var cw = wk(today()),
    cur = S.done.filter(function (d) {
      return wk(d.day) === cw;
    }),
    t = sum(cur),
    all = sum(S.done);
  var h =
    '<button onclick="showRes=!showRes;render()">Hammasini hisoblash</button>';
  if (!showRes) return h;
  h +=
    '<div class="card res" style="margin-top:14px"><div class="mut">Shu hafta (' +
    sh(cw) +
    ')</div><div><span class="mut">Tikilgan ko\'ylaklar</span><b>' +
    t.n +
    ' ta</b></div><div><span class="mut">Ketgan vaqt</span><b>' +
    t.h +
    ' soat</b></div><div><span class="mut">Shu haftadagi summa</span><b>' +
    fmt(t.m) +
    " so'm</b></div><div><span class=\"mut\">Shu paygacha tikilgan ko'ylaklar summasi</span><b>" +
    fmt(all.m) +
    ' so\'m</b><span class="mut">Jami ' +
    all.n +
    ' ta ko\'ylak</span></div><div class="mut" style="font-size:13px">Hafta har dushanba yangilanadi</div></div>';
  var wks = {};
  S.done.forEach(function (d) {
    var k = wk(d.day);
    if (k !== cw) (wks[k] = wks[k] || []).push(d);
  });
  var ks = Object.keys(wks).sort().reverse().slice(0, 6);
  if (ks.length) {
    h +=
      '<div class="card"><div class="mut" style="margin-bottom:6px">Oldingi haftalar</div>';
    ks.forEach(function (k) {
      var x = sum(wks[k]);
      h +=
        '<div class="row" style="margin:8px 0"><span class="mut">' +
        sh(k) +
        "</span><b>" +
        x.n +
        " ta, " +
        fmt(x.m) +
        " so'm</b></div>";
    });
    h += "</div>";
  }
  h += '<button class="g" onclick="reset()">Hammasini tozalash</button>';
  return h;
}
function statView() {
  var cw = wk(today()),
    c = [0, 0, 0, 0, 0, 0, 0];
  S.done.forEach(function (d) {
    if (wk(d.day) !== cw) return;
    var p = d.day.split("-");
    var w = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
    c[(w + 6) % 7]++;
  });
  var tot = c.reduce(function (a, b) {
    return a + b;
  }, 0);
  var mx = 0,
    mn = 0;
  for (var i = 1; i < 7; i++) {
    if (c[i] > c[mx]) mx = i;
    if (c[i] < c[mn]) mn = i;
  }
  var top = Math.max.apply(null, c) || 1,
    h =
      '<div class="mut" style="margin-bottom:8px">Shu hafta: ' +
      sh(cw) +
      '</div><div class="card">';
  for (var i = 0; i < 7; i++)
    h +=
      '<div class="bar"><span class="d">' +
      DAYS[i] +
      '</span><div class="t"><i style="width:' +
      (c[i] / top) * 100 +
      '%"></i></div><b>' +
      c[i] +
      "</b></div>";
  h += "</div>";
  if (tot)
    h +=
      '<div class="card"><div class="row"><span class="mut">Eng ko\'p tikilgan kun</span><b>' +
      DAYS[mx] +
      " (" +
      c[mx] +
      ' ta)</b></div><div class="row" style="margin-top:10px"><span class="mut">Eng kam tikilgan kun</span><b>' +
      DAYS[mn] +
      " (" +
      c[mn] +
      " ta)</b></div></div>";
  else h += '<div class="card empty">Bu hafta hali ko\'ylak tikilmagan</div>';
  return h + calcView();
}
function render() {
  var a = $("app");
  if (!S.name) {
    a.innerHTML =
      '<div class="hero">' +
      ICON +
      '<h1 style="margin-top:14px">Xush kelibsiz</h1><div class="card" style="margin-top:20px;text-align:left"><div class="mut">Ismingizni yozing</div><input id="nm" placeholder="Masalan: Karima"><button onclick="setName()">Davom etish</button></div></div>';
    $("nm").onkeydown = function (e) {
      if (e.key === "Enter") setName();
    };
    return;
  }
  var h =
    '<div class="top">' +
    ICON +
    "<div><h1>" +
    esc(S.name) +
    ' Chevarxonasi</h1></div><button class="link" onclick="changeName()">Ismni o\'zgartirish</button></div>';
  h +=
    '<div class="tabs"><button class="' +
    (page === "home" ? "on" : "") +
    '" onclick="go(\'home\')">Ishlar</button><button class="' +
    (page === "stat" ? "on" : "") +
    '" onclick="go(\'stat\')">Statistika</button></div>';
  h += page === "home" ? homeView() : statView();
  a.innerHTML = h;
}
render();
var lastW = wk(today());
setInterval(function () {
  if (wk(today()) !== lastW) {
    lastW = wk(today());
    render();
    return;
  }
  document.querySelectorAll(".left").forEach(function (e) {
    var s = S.slots[e.dataset.i];
    if (s) e.textContent = left(s);
  });
}, 30000);
