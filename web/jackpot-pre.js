$id = (id) => { return document.getElementById(id); }
$qs = (s) => { return document.querySelector(s); }
$qsa = (a) => { return document.querySelectorAll(a); }
setHTML = (id, _html) => { document.getElementById(id).innerHTML = _html }

ELECTRON_DISABLE_SECURITY_WARNINGS = false
var customCSS
const { ipcRenderer } = require('electron')

ipc = class {
  static send(mess, data) {
    ipcRenderer.send(mess, data)
  }
  static getResponse(question) {
    ipcRenderer.send('get', question)
    return new Promise(r => {
      ipcRenderer.once(`response-${question}`, (ev, data) => {
        console.log(`respond for question "${question}":`, data)
        r(data)
      })
    })
  }
}
////////// Code run before load
ipc.getResponse('appPath').then(r => { window.appPath = r })
if (window.location.host.includes('nimo.tv')) {
  document.write('<h1>LOADING...</h1>')
}


////////// IPC LISTEN 
ipcRenderer.on('removeLoading', (event, EleId) => {
  $id(EleId).classList.remove('is-loading')
  $id(EleId).disabled = false
})
ipcRenderer.on('data', (event, data) => {
  console.log('received data from wid ', event.senderId, ': ', data) // DEBUG
  if (data.ssid) {
    window.ssid = data.ssid
    window.color = data.color
    $qs('#APP_TITLEBAR .ssid').innerHTML = data.ssid
    $qs('#APP_TITLEBAR .ssColor').style = `background-color:${data.color}`
  }
})
ipcRenderer.on('mainLog', (event, mess) => { mainLog(mess) })
ipcRenderer.on('action', (event, mess) => {
  switch (mess) {
    case 'ask-to-quit': menu.AskToQuit();
      break;
    case 'click-btn-TITLEBAR_BTN_NEW': $id('TITLEBAR_BTN_NEW').click()
      break;
    default: console.log('ipc received "action" but', mess, 'not defined yet!');
      break;
  }
})

addEventListener('contextmenu', (ev) => {
  ev.shiftKey ? ipc.send('InspectMeAtPos', { x: ev.x, y: ev.y }) : null
})

addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded')
})

addEventListener('load', () => {
  if (window.location.host.includes('nimo.tv')) {
    ipc.send('getAppData', { key: 'gwInjectCode' })
    ipcRenderer.once(`responseAppData-gwInjectCode`, (ev, data) => {
      Object.keys(data).forEach((e) => {
        // console.log('e=' + e, '\ndata[e]=' + data[e]) // DEBUG 
        let containerEle, ele, path
        containerEle = document.createElement('div')
        containerEle.innerHTML = data[e]
        switch (e) {
          case "body":
            containerEle.setAttribute('id', 'AKI_HTML_INJECT')
            document.body.appendChild(containerEle)
            document.body.classList.add('noside')
            break
          case "bulma": case "AppBase":
            ele = containerEle.firstChild
            document.head.appendChild(ele)
            // console.log(ele) // DEBUG 
            break
          case "jackpot":
            let x = document.createElement('script')
            x.innerHTML = data[e]
            x.setAttribute('name', 'inject')
            x.setAttribute('opt', 'jackpot')
            document.head.appendChild(x)
            break
        }
      })
      afterInject()
    })
  }

  ipc.send('get', 'ssInfo')

})

