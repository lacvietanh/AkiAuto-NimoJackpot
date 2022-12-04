const { ipcRenderer } = require('electron')
ipc = class {
  static send(mess, data) {
    ipcRenderer.send(mess, data)
  }
  static getResponse(question) {
    ipcRenderer.send('get', question)
    return new Promise(function (resolve, reject) {
      ipcRenderer.once(`response-${question}`, (ev, data) => {
        // console.log(`respond for question "${question}":`, data) //DEB
        resolve(data)
      })
    })
  }
}
setHTML = function (id, text) {
  document.getElementById(id).innerHTML = text
}
//-------- run:
ipc.getResponse('appInfo')
  .then(mess => {
    console.log('Received appInfo data: ', mess)
    setHTML('appBrand', mess.appBrand)
    setHTML('appName', mess.appName)
    setHTML('appVersion', mess.appVersion)
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
