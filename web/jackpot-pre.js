ELECTRON_DISABLE_SECURITY_WARNINGS = false
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

ipcRenderer.on('removeLoading', (event, EleId) => {
  $id(EleId).classList.remove('is-loading')
  $id(EleId).disabled = false
})
ipcRenderer.on('data', (event, data) => {
  console.log('received data from window ', event.senderId, '. Data: ', data)
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
  if (!window.location.host.includes('nimo.tv')) {
    let injectCODE = {}
    $qsa('[name=inject]').forEach(tag => {
      console.log(tag)
      injectCODE[`${tag.getAttribute('opt')}`] = tag.outerHTML
    })
    localStorage.injectCODE = JSON.stringify(injectCODE)
    console.log(localStorage.injectCODE) // DEBUG
    setTimeout(() => { ipc.send('loadURL', 'https://www.nimo.tv/fragments/act/slots-game') }
      , 2000)
  } else {
    let injectCODE = JSON.parse(localStorage.injectCODE)
    injectCODE.forEach((e) => {
      if (e.getAttribute('opt') != "body") {
        let x = e.cloneNode(true)
        document.head.appendChild(x)
      } else {
        document.body.innerHTML += e.innerHTML
      }
    })
  }
})
addEventListener('load', () => {

  // mainLog('loaded! from preload using page function')
  // ipc.send('log', 'loaded! from preload to main process!')
})

