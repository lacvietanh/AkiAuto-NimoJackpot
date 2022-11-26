// AkiApp-base-js:
function $id(id) { return document.getElementById(id); }
function $qs(s) { return document.querySelector(s); }
function $qsa(a) { return document.querySelectorAll(a); }
function setHTML(id, _html) { document.getElementById(id).innerHTML = _html }
window.addEventListener('blur', () => { $id('APP_TITLEBAR').classList.remove('active') })
window.addEventListener('focus', () => { $id('APP_TITLEBAR').classList.add('active') })

function addRow(x) {
  $qs('#AccountTable tbody').innerHTML += /*html*/`
    <tr>
    <td class="counter child"></td>
    <td class="accSelector" onclick="selectAcc(this)">${x.username}</td>
    <td>${x.ssid}</td>
    <td>${x.bean}</td>
    <td>${x.status}</td>
    </tr>
  `;
}

function selectAcc(td) {
  if (!td.classList.contains('selected')) {
    let x = $qs('td.accSelector.selected');
    x ? x.classList.remove('selected') : null;
    td.classList.add('selected');
    menu.updateSelect(td);
  } else {
    console.log(`${td.innerHTML} already selected`);
  }
}
function mainLog(mess) {
  let x = $id('APP_LOGS')
  x.innerHTML += "<br>" + mess
  x.scrollTop = x.scrollHeight
}
menu = class {
  static updateSelect(td) {
    $id('panel-UserName').innerHTML = td.innerHTML;
  }
  static newSession(btnCall) {
    btnCall.classList.add('is-loading')
    ipc.send('new', 'session')
  }
}

window.addEventListener('DOMContentLoaded', () => {
  let data = [
    { ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
    { ssid: "ss02", username: "nguyen", bean: "523k", status: "Waiting" },
    { ssid: "ss02", username: "binh", bean: "523k", status: "Waiting" },
    { ssid: "ss04", username: "nimo2020145", bean: "523k", status: "Waiting" },
    { ssid: "ss05", username: "NguyenHang", bean: "10000", status: "Running" },
    { ssid: "ss06", username: "QuocViet", bean: "0", status: "Idle" },
    { ssid: "ss07", username: "BaoPhuong", bean: "1.3M", status: "Running" },
    { ssid: "ss08", username: "LacAnh", bean: "50k", status: "Running" },
    { ssid: "ss06", username: "QuocViet", bean: "0", status: "Idle" },
    { ssid: "ss07", username: "BaoPhuong", bean: "1.3M", status: "Running" },
    { ssid: "ss08", username: "LacAnh", bean: "50k", status: "Running" },
    { ssid: "ss06", username: "QuocViet", bean: "0", status: "Idle" },
    { ssid: "ss07", username: "BaoPhuong", bean: "1.3M", status: "Running" },
    { ssid: "ss08", username: "LacAnh", bean: "50k", status: "Running" },
    { ssid: "ss06", username: "QuocViet", bean: "0", status: "Idle" },
    { ssid: "ss07", username: "BaoPhuong", bean: "1.3M", status: "Running" },
    { ssid: "ss08", username: "LacAnh", bean: "50k", status: "Running" },
    { ssid: "ss06", username: "QuocViet", bean: "0", status: "Idle" },
    { ssid: "ss07", username: "BaoPhuong", bean: "1.3M", status: "Running" },
    { ssid: "ss08", username: "LacAnh", bean: "50k", status: "Running" },
  ]
  data.forEach((row) => { addRow(row) });
})

