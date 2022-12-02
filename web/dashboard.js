// AkiApp-base-js:
function $id(id) { return document.getElementById(id); }
function $qs(s) { return document.querySelector(s); }
function $qsa(a) { return document.querySelectorAll(a); }
function setHTML(id, _html) { document.getElementById(id).innerHTML = _html }
window.addEventListener('blur', () => { $id('APP_TITLEBAR').classList.remove('active') })
window.addEventListener('focus', () => { $id('APP_TITLEBAR').classList.add('active') })

const APP_LOGS = $id("APP_LOGS")
const appData = {
  wins: [] //list window: {wdid,ss}
  , sess: [] //list session: {ssid, sscol}
  , accs: [] //list accounts: {username, bean, }
}
const winMan = class {
  static init() {
    let data = [
      { wid: 1, username: "vua cỏ", color: "#8f5ab2", ssid: "001", pool: "Lớn", bean: "37000" },
    ]
    data.forEach((row) => { winMan.addRow(row) })
  }
  static addRow(x) {
    $qs('#AccountTable tbody').innerHTML += /*html*/`
    <tr class="accSelector">
      <td class="counter child"></td>
      <td id="window-${x.wid}" class='is-inline-flex'>
        <label class="switch">
          <input type="checkbox" name=${x.wid}>
        <span class="slider round"></span>
      </label>
      </td>
      <td class='uname'>${x.username}</td>
      <td class='ss' style="color:${x.color}">${x.ssid}</td>
      <td class='pool'>${x.pool}</td>
      <td class='bean'>${x.bean}</td>
    </tr>
  `;
  }
  static selectAcc(tr) {
    if (!tr.classList.contains('selected')) {
      let x = $qs('tr.accSelector.selected');
      x ? x.classList.remove('selected') : null;
      tr.classList.add('selected');
      menu.updateSelect(tr);
    } else {
      console.log(` already selected`);
    }
  }
}

function mainLog(mess) {
  let time_ = (new Date).toLocaleString('en-US', { hour12: false }).substring(11, 19)
  APP_LOGS.innerHTML += `<br>${time_}  ${mess}`
  APP_LOGS.scrollTop = APP_LOGS.scrollHeight
}
menu = class {
  static updateSelect(td) {
    $id('panel-UserName').innerHTML = td.innerHTML;
  }
  static newAcc(btnCall) {
    btnCall.classList.add('is-loading')
    ipc.send('new', 'acc')
  }
  static AskToQuit() {
    let rep = window.confirm('QUIT APP?')
    rep ? ipc.send('action', 'QUITAPP') : window.focus();
  }
  static Minimize() {
    ipc.send('action', 'MINIMIZE')
  }
}

window.addEventListener('load', () => {
  mainLog('Welcome!')
  winMan.init()
})

