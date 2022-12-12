// AkiApp-base-js:
function $id(id) { return document.getElementById(id); }
function $qs(s) { return document.querySelector(s); }
function $qsa(a) { return document.querySelectorAll(a); }
function setHTML(id, _html) { document.getElementById(id).innerHTML = _html }
window.addEventListener('blur', () => { $id('APP_TITLEBAR').classList.remove('active') })
window.addEventListener('focus', () => { $id('APP_TITLEBAR').classList.add('active') })
window.addEventListener('click', () => { $id('APP_TITLEBAR').classList.add('active') })
Boolean.prototype.toOnOff = function () {
  let r, v = this.valueOf()
  v ? r = 'ON' : r = 'OFF'
  return r
}
const mainLog = function (mess, color) {
  let time_ = (new Date).toLocaleString('en-US', { hour12: false }).substring(11, 19)
  let c = color || "";
  APP_LOGS.innerHTML += `<br>${time_}  <span style="color:${c}"> ${mess} </span>`
  APP_LOGS.scrollTop = APP_LOGS.scrollHeight
}
const COLOR = class {
  static invertHex(hex) {
    return '#' + ("000000" + (0xFFFFFF ^ parseInt(hex.substring(1), 16)).toString(16)).slice(-6);
  }
  static randomHex() {
    let hex = Math.floor(Math.random() * 16777215).toString(16)
    return '#' + hex;
  }
}

const APP_LOGS = $id("APP_LOGS")
const appData = {
  wins: [] //list window: {wid,ss}
  , sess: [] //list session: {ssid, sscol}
  , accs: [] //list accounts: {username, bean, }
}
const winMan = class {
  static init() {
    let data = [
      { wid: 3, username: "vua cỏ", color: COLOR.randomHex(), ssid: "001", bet: "450", pool: "Nhỏ", bean: "280k" },
      { wid: 4, username: "vua bài", color: COLOR.randomHex(), ssid: "002", bet: "900", pool: "Nhỏ", bean: "403k" },
      { wid: 5, username: "vua nghiện", color: COLOR.randomHex(), ssid: "003", bet: "9000", pool: "Lớn", bean: "1.2M" },
      { wid: 6, username: "vua nghiện", color: COLOR.randomHex(), ssid: "003", bet: "4500", pool: "Lớn", bean: "1.2M" },
      { wid: 6, username: "vua nghiện", color: COLOR.randomHex(), ssid: "003", bet: "4500", pool: "Lớn", bean: "1.2M" },
      { wid: 6, username: "vua nghiện", color: COLOR.randomHex(), ssid: "003", bet: "4500", pool: "Lớn", bean: "1.2M" },
      // { wid: 7, username: "vua tôm", color: COLOR.randomHex(), ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
      // { wid: 7, username: "vua tôm", color: COLOR.randomHex(), ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
      // { wid: 8, username: "vua tôm", color: COLOR.randomHex(), ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
      // { wid: 9, username: "vua tôm", color: COLOR.randomHex(), ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
      // { wid: 10, username: "vua tôm", color: COLOR.randomHex(), ssid: "004", bet: "45000", pool: "Lớn", bean: "37000" },
    ]
    data.forEach((row) => { winMan.addRow(row) })
  }
  static addRow(x) {
    let styleString = `background-color:${x.color}`
    $qs('#WindowTable tbody').innerHTML += /*html*/`
    <tr class="accSelector" >
      <td id="window_${x.wid}" class='winID noSort borderNONE'>
        <label class="switch">
          <input type="checkbox" name=autoToggle data-target="window_${x.wid}"
            onchange="winMan.toggle(this.dataset.target,this.checked)">
          <span class="slider round"></span>
        </label>
      </td>
      <td class="borderNONE">
        <button class="button is-small">...</button>
      </td>
      <td class="">${x.wid}</td>
      <td class='uname'>${x.username}</td>
      <td>
        <span class=ssid> ${x.ssid} </span>
        <span class=ssColor style="${styleString}"> </span>
      </td>
      <td class='bet'>${x.bet}</td>
      <td class='pool'>${x.pool}</td>
      <td class='bean'>${x.bean}</td>
    </tr>
  `;
  }
  // static toggleByRow(tr) {
  //   let t = tr.querySelector('input[name=autoToggle]')
  //   t.click()
  // }
  static toggle(TargetID, value) {
    mainLog(`Turn <b>${value.toOnOff()}</b> AUTO for window id ${TargetID}`)
  }
  static toggleAll(value) {
    let t = $id('WindowTable').querySelectorAll('input[name=autoToggle]')
    t.forEach(sw => sw.checked = value)
    mainLog(`TURN <b>${value.toOnOff()}</b> AUTO FOR ALL <b>${t.length}</b> WINDOWS`, 'yellow')
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

menu = class {
  static init() {
    $qsa(`#APP_SIDEMENU button.toggleShow`).forEach((btn) => {
      btn.addEventListener('click', () => menu.toggleShow(btn))
    });
    ['top', 'bottom'].forEach(c => { // active first button each position
      $qs(`#APP_SIDEMENU .${c} button.toggleShow`).click()
    });
  }
  static toggleShow(btnCall) {
    let target = $id(btnCall.dataset.target) || []
    // remove current active same position
    let oldActive = btnCall.parentElement.querySelector('.toggleShow.is-active') || null
    oldActive ? oldActive.click() : null
    btnCall ? btnCall.classList.toggle('is-active') : null
    target ? target.classList.toggle('show') : null
  }
  static updateSelect(td) {
    $id('panel-UserName').innerHTML = td.innerHTML;
  }
  static new(what, btnCall) {
    btnCall.classList.add('is-loading')
    btnCall.disabled = true
    ipc.send('new', what)
  }
  static AskToQuit() {
    let rep = window.confirm('QUIT APP?')
    rep ? ipc.send('action', 'QUITAPP') : window.focus();
  }
  static Minimize() {
    ipc.send('action', 'MINIMIZE')
  }
  static toggleExpand(id, btnCall) {
    $id(id).classList.toggle('expand')
    btnCall ? btnCall.classList.toggle('is-active') : null
  }

}
function preventSortable() {
  if ($qs('table.sortable')) {
    $qsa('table.sortable').forEach(table => {
      let th = table.querySelectorAll('th.DONT_SORTABLE') || []
      th.forEach(e => { e.outerHTML = e.outerHTML })
    })
  }
}

window.addEventListener('load', () => {
  menu.init()
  winMan.init()
  mainLog('Welcome!')
  preventSortable()
})

