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
  let time_ = (new Date).toLocaleString('en-US', { hour12: false }).substring(11, 20)
  let c = color || "";
  APP_LOGS.innerHTML += `<br>${time_}  <span style="color:${c}"> ${mess} </span>`
  APP_LOGS.scrollTop = APP_LOGS.scrollHeight
}
const COLOR = class {
  static invertHex(hex) {
    return '#' + ("000000" + (0xFFFFFF ^ parseInt(hex.substring(1), 16)).toString(16)).slice(-6);
  }
  static randomHex() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
  }
}

const APP_LOGS = $id("APP_LOGS")
const appData = {
  wins: [] //list window: {wid,ss}
  , sess: [] //list session: {ssid, sscol}
  , accs: [] //list accounts: {username, bean, }
}
const winMan = class {
  static data = {}
  static updateTable(data) {
    winMan.data = data
    let newSsidList = Object.keys(winMan.data)
    $qs('#WindowTable tbody').innerHTML = ""
    newSsidList.forEach(ssid => {
      // ex: ss1: { Uname: 'TheUserName', color: '#fea' }
      // add key 'ssid' inside object to exploit in addRow() -> ${x.ssid}
      winMan.data[ssid]['ssid'] = ssid;
      winMan.addRow(winMan.data[ssid])
      ipc.send('getGwCount', ssid)
    })
  }
  static updateGwCount(ssid) {
    let data = winMan.data[ssid].windowCount
    let row = $qs(`#WindowTable tbody .${ssid}`)
    let cE = row.querySelector('.windowCount')
    cE.innerHTML = data
  }
  static addRow(x) {
    // console.log('from addRow: x=', x) // DEBUG
    let styleString = `background-color:${x.color}`
    $qs('#WindowTable tbody').innerHTML += /*template*/`
    <tr class="${x.ssid}">
      <td class='winToggle noSort borderNONE'>
        <label class="switch">
          <input type="checkbox" name=autoToggle data-target="${x.ssid}"
            onchange="winMan.toggle(this.dataset.target,this.checked)">
          <span class="slider round"></span>
        </label>
      </td>
      <td class="windowCount has-text-centered">${x.windowCount || 0}</td>
      <td class=ss_menu>
        <button class="button is-success" title="Cửa sổ mới"
          id="BTN-NEW-SS-${x.ssid}" onclick="menu.new('GameWindowSession-${x.ssid}',this)">+</button>
        <button class="button is-danger"  title="Đóng các cửa sổ"
          onclick="menu.closeAllWdSs(this)">x</button>
        <button class="button is-dark"  title="Xóa session"
          onclick="menu.delSS(this,event)">
          <img class=invert src="./svgs/regular/trash-can.svg" width=13>
        </button>
      </td>
      <td class=ssid_color>
        <div class=FlexContainer>
          <span class=ssColor style="${styleString}"> </span>
          <span class=ssid>${x.ssid}</span>
        </div>
      </td>
      <td class='uname'>${x.Uname || 'Not Login'}</td>
      <td class='bean'>${x.chips || ''}</td>
      <td class='pool'>${x.pool || ''}</td>
      <td class='bet'>${x.bet || ''}</td>
    </tr>
  `;
  }
  static toggle(TargetID, value) {
    mainLog(`Turn <b>${value.toOnOff()}</b> AUTO for session id ${TargetID}`)
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
    ['top', 'bottom'].forEach(p => { // active first button each position
      $qs(`#APP_SIDEMENU .${p} button.toggleShow`).click()
    });
  }
  static new(what, btnCaller) {
    btnCaller.classList.add('is-loading')
    btnCaller.disabled = true
    ipc.send('new', what)
  }
  static delSS(btnCaller, ev) {
    let ssid = btnCaller.parentElement.parentElement.classList[0], confirm_;
    if (ev.shiftKey) {
      confirm_ = confirm(`Chắc chắn xóa TOÀN BỘ SESSION? Tất cả cửa sổ sẽ bị đóng!`)
      if (confirm_) {
        $qsa('#WindowTable tbody tr').forEach(tr => { ipc.send('deleteSS', tr.classList[0]) })
      }
    } else {
      confirm_ = confirm(`Chắc chắn xóa session: ${ssid}?\nTất cả cửa sổ sử dụng ${ssid} sẽ bị đóng!`)
      if (confirm_) { ipc.send('deleteSS', ssid) }
    }
  }
  static closeAllWdSs(btnCaller) {
    let ssid = btnCaller.parentElement.parentElement.classList[0]
    ipc.send('closeAllWdSs', ssid)
  }
  static toggleShow(btnCaller) {
    let target = $id(btnCaller.dataset.target) || []
    // remove current active same position
    let oldActive = btnCaller.parentElement.querySelector('.toggleShow.is-active') || null
    oldActive ? oldActive.click() : null
    btnCaller ? btnCaller.classList.toggle('is-active') : null
    target ? target.classList.toggle('show') : null
  }
  static updateSelect(td) {
    $id('panel-UserName').innerHTML = td.innerHTML;
  }
  static AskToQuit() {
    let rep = window.confirm('QUIT APP?')
    rep ? ipc.send('action', 'QUITAPP') : window.focus();
  }
  static Minimize() {
    ipc.send('action', 'MINIMIZE')
  }
  static toggleExpand(id, btnCaller) {
    $id(id).classList.toggle('expand')
    btnCaller ? btnCaller.classList.toggle('is-active') : null
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
  mainLog('Welcome!')
  preventSortable()
})

