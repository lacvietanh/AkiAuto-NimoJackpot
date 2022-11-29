// AkiApp-base-js:
function $id(id) { return document.getElementById(id); }
function $qs(s) { return document.querySelector(s); }
function $qsa(a) { return document.querySelectorAll(a); }
function setHTML(id, _html) { document.getElementById(id).innerHTML = _html }
window.addEventListener('blur', () => { $id('APP_TITLEBAR').classList.remove('active') })
window.addEventListener('focus', () => { $id('APP_TITLEBAR').classList.add('active') })

winMan = class {
  static init() {
    let data = [
      { id: 1, ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
      { id: 1, ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
      { id: 1, ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
      { id: 1, ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
      { id: 1, ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
      { id: 1, ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
      { id: 1, ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
      { id: 1, ssid: "ss01", username: "vua cỏ", bean: "37000", status: "Running" },
    ]
    data.forEach((row) => { winMan.addRow(row) });
  }
  static addRow(x) {
    $qs('#AccountTable tbody').innerHTML += /*html*/`
    <tr>
    <td class="counter child"></td>
    <td class="accSelector" onclick="winMan.selectAcc(this)">${x.username}</td>
    <td>${x.ssid}</td>
    <td>${x.bean}</td>
    <td>${x.status}</td>
    <td>${x.id}</td>
    </tr>
  `;
  }
  static selectAcc(td) {
    if (!td.classList.contains('selected')) {
      let x = $qs('td.accSelector.selected');
      x ? x.classList.remove('selected') : null;
      td.classList.add('selected');
      menu.updateSelect(td);
    } else {
      console.log(`${td.innerHTML} already selected`);
    }
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
  static AskToQuit() {
    let rep = window.confirm('QUIT APP?')
    rep ? window.close() : window.focus()
  }
  static Minimize() {
    ipc.send('action', 'MINIMIZE')
  }
}

window.addEventListener('load', () => {
  winMan.init()
})

