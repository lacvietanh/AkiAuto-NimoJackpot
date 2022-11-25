const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipc', {
  send: (channel, payload) => ipcRenderer.send(channel, payload)
})

