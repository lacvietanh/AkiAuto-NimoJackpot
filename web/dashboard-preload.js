const { ipcRenderer } = require('electron')

ipc = class {
  static send(mess, data) {
    ipcRenderer.send(mess, data)
  }
}

ipcRenderer.on('removeLoading', (event, EleId) => {
  $id(EleId).classList.remove('is-loading')
})
ipcRenderer.on('mainLog', (event, mess) => {
  mainLog(mess)
})
addEventListener('load', () => {
  console.log('loaded ! from preload');
  mainLog('loaded! from preload using page function')
  ipc.send('log', 'loaded! from preload to main process!')
})

