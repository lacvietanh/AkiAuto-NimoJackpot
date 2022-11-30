const { ipcRenderer } = require('electron')
ipc = class {
  static send(mess, data) {
    ipcRenderer.send(mess, data)
  }
}

ipcRenderer.on('removeLoading', (event, EleId) => {
  $id(EleId).classList.remove('is-loading')
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
    default: console.log('ipc received "action" but', mess, 'not defined yet!');
      break;
  }
})

addEventListener('load', () => { //test
  // console.log('loaded ! from preload');
  // mainLog('loaded! from preload using page function')
  // ipc.send('log', 'loaded! from preload to main process!')
})

