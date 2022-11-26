const { ipcRenderer } = require('electron')
ipc = class {
  static send(mess, data) {
    ipcRenderer.send(mess, data)
  }
}
setHTML = function (id, text) {
  document.getElementById(id).innerHTML = text
}
//-------- run:
ipcRenderer.on('appInfo', (event, mess) => {
  console.log('Received appInfo data: ', mess)
  setHTML('appBrand', mess.appBrand)
  setHTML('appName', mess.appName) // need fix to app.getName()
  setHTML('appVersion', mess.appVersion) //need fix to app.getVersion()
})
ipcRenderer.on('mess', (event, mess) => {
  setHTML('MESS', mess)
})

window.addEventListener('DOMContentLoaded', () => {
  ipc.send('get', 'appInfo')
  const info = document.querySelectorAll('#info div');
  ['chrome', 'node', 'electron'].forEach((c, i) => {
    info[i].innerHTML = `
      ${c}: ${process.versions[c]}  
    `;
  })
})
