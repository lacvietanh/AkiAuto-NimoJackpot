// AkiApp-base-js:
function $id(id) { return document.getElementById(id); }
function $qs(s) { return document.querySelector(s); }
function $qsa(a) { return document.querySelectorAll(a); }
function setHTML(id, _html) { document.getElementById(id).innerHTML = _html }
Boolean.prototype.toOnOff = function () {
  let r, v = this.valueOf()
  v ? r = 'ON' : r = 'OFF'
  return r
}

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
      { wid: 3, username: "vua cỏ", color: "#8f5ab2", ssid: "001", bet: "450", pool: "Nhỏ", bean: "280k" },
      { wid: 4, username: "vua bài", color: "#324687", ssid: "002", bet: "900", pool: "Nhỏ", bean: "403k" },
      { wid: 5, username: "vua nghiện", color: "#990840", ssid: "003", bet: "9000", pool: "Lớn", bean: "1.2M" },
      { wid: 6, username: "vua nghiện", color: "#990840", ssid: "003", bet: "4500", pool: "Lớn", bean: "1.2M" },
      { wid: 7, username: "vua tôm", color: "#267890", ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
      { wid: 8, username: "vua tôm", color: "#267890", ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
      { wid: 9, username: "vua tôm", color: "#267890", ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
      { wid: 10, username: "vua tôm", color: "#267890", ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
    ]
    data.forEach((row) => { winMan.addRow(row) })
  }
  static addRow(x) {
    $qs('#WindowTable tbody').innerHTML += /*html*/`
    <tr class="accSelector" onclick="winMan.toggleROW(this)">
      <td class="counter child borderNONE"></td>
      <td id="window_${x.wid}" class='winID noSort borderNONE'
        style="display:flex;justify-content:center;">
        <div class="switch">
          <input type="checkbox" name=autoToggle data-target="window_${x.wid}"
            onchange="winMan.toggle(this.dataset.target,this.checked)">
          <span class="slider round"></span>
        </div>
      </td>
      <td class='uname'>${x.username}</td>
      <td class='ss' style="color:${x.color}">${x.ssid}</td>
      <td class='bet'>${x.bet}</td>
      <td class='pool'>${x.pool}</td>
      <td class='bean'>${x.bean}</td>
    </tr>
  `;
  }
  static toggleROW(tr) {
    let t = tr.querySelector('input[name=autoToggle]')
    t.click()
  }
  static toggle(TargetID, value) {
    mainLog(`Turn <b>${value.toOnOff()}</b> AUTO for window id ${TargetID}`)
  }
  static ALL(value) {
    let t = $id('WindowTable').querySelectorAll('input[name=autoToggle]')
    t.forEach(sw => sw.checked = value)
    mainLog(`TURN ${value.toOnOff()} AUTO FOR ALL <b>${t.length}</b> WINDOWS`)
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
  if ($qs('table.sortable')) {
    $qsa('table.sortable').forEach(table => {
      let th = table.querySelectorAll('th.DONT_SORTABLE') || []
      if (th.length) {
        th.forEach(e => { e.outerHTML = e.outerHTML })
      }
    })
  }
})

