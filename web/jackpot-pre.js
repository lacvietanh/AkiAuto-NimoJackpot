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
ipcRenderer.on('mainLog', (event, mess) => {
  mainLog(mess)
})
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

addEventListener('DOMContentLoaded', () => {
  if (!window.location.host.includes('nimo.tv')) {
    let injectCODE = $qsa('[name=inject]')
    localStorage.injectCODE = JSON.stringify(injectCODE)
    // ipc.send('loadURL', 'https://www.nimo.tv/fragments/act/slots-game')
  } else {
    let injectCODE = JSON.parse(localStorage.injectCODE)
    injectCODE.forEach((e, i) => {
      if (i != 3) { // link:css bulma, link:css AppBase, script:src jackpot
        let x = e.cloneNode(true)
        document.head.appendChild(x)
      } else { //body 
        document.body.innerHTML += e.innerHTML
      }
    })
  }
})
addEventListener('load', () => {

  // mainLog('loaded! from preload using page function')
  // ipc.send('log', 'loaded! from preload to main process!')
})

