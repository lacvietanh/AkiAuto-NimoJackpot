// Listen ipc mess from main process:
const { ipcRenderer } = require('electron')
ipc = class {
  static send(mess, data) {
    ipcRenderer.send(mess, data)
  }
  static getResponse(question) {
    ipcRenderer.send('get', question)
    return new Promise(r => {
      ipcRenderer.once(`response-${question}`, (ev, data) => {
        // console.log(`respond for question "${question}":`, data) // DEBUG
        r(data)
      })
    })
  }
}

ipcRenderer.on('btnLoadingDone', (event, btnID) => {
  $id(btnID).classList.remove('is-loading')
  $id(btnID).disabled = false
  btnID == "BTN-NEW-SS" ? LoadSSID() : null;
})
ipcRenderer.on('data', (event, data) => {
  console.log('received data from window ', event.senderId, '. Data: ', data)
})
ipcRenderer.on('mainLog', (event, mess) => {
  mainLog(mess)
})
ipcRenderer.on('gw', (ev, mess) => {
  if (mess.action == 'updateCount') {
    setTimeout(() => {
      console.log(`winMan.data['${mess.ssid}']=`, winMan.data[`${mess.ssid}`]) // DEBUG
      winMan.data[`${mess.ssid}`]['windowCount'] = mess.data
      winMan.updateGwCount(mess.ssid)
    }, 100)
  } else if (mess.action == 'moreSomething') {
    // moreSomething
  } else {
    console.log(`received "gw" with undefined action "${mess.action}"`)
  }
})
ipcRenderer.on('action', (ev, mess) => {
  switch (mess) {
    case 'ask-to-quit': menu.AskToQuit();
      break;
    case 'click-btn-BTN-NEW-SS': $id('BTN-NEW-SS').click();
      break;
    case 'click-btn-BTN-NEW-SPEC_SS': $id('BTN-NEW-SPEC_SS').click();
      break;
    case 'reloadSSID': LoadSSID();
      break;
    default: console.log('ipc received "action" but', mess, 'not defined yet!');
      break;
  }
})
addEventListener('contextmenu', (ev) => {
  if (ev.shiftKey && ev.altKey) {
    ipc.send('InspectMeAtPos', { x: ev.x, y: ev.y })
  }
})

function LoadSSID() {
  ipc.getResponse('ssList').then(data => { winMan.updateTable(data) })
}

addEventListener('load', () => { //test
  LoadSSID()

  // console.log('loaded ! from preload');
  // mainLog('loaded! from preload using page function')
  // ipc.send('log', 'loaded! from preload to main process!')
})
