function $id(id) { return document.getElementById(id); }
function $qs(s) { return document.querySelector(s); }
function $qsa(a) { return document.querySelectorAll(a); }

const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('ipc', {
  new: (mess) => ipcRenderer.send('new', mess)
})

ipcRenderer.on('loading-remove', (event, EleId) => {
  console.log(event, EleId);
  $id(EleId).classList.remove('is-loading')
})
