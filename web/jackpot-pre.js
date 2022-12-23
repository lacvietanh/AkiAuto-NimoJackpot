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

ipc.getResponse('appPath').then(r => { window.appPath = r })

injectCode_prepare = () => {
  let injectCODE = {}
  $qsa('[name=inject]').forEach(tag => {
    injectCODE[`${tag.getAttribute('opt')}`] = tag.outerHTML
  })
  ipc.send('saveAppData', { key: 'gameWindowHTML', value: injectCODE })
  setTimeout(() => {
    // ipc.send('loadURL', 'https://www.nimo.tv/fragments/act/slots-game')
  }, 2000)
}
injectCode_run = () => {
  ipcRenderer.send('getAppData', { key: 'gameWindowHTML' })
  ipcRenderer.once(`responseAppData-gameWindowHTML`, (ev, data) => {
    console.log(data) // DEBUG
    Object.keys(data).forEach((e) => {
      // console.log('e=' + e, '\ndata[e]=' + data[e]) // DEBUG 
      if (e != "body") {
        let containerEle = document.createElement('x')
        containerEle.innerHTML = data[e]
        let ele = containerEle.firstChild
        if (e == "jackpot") {
          let path = "file://" + appPath + '/web/' + ele.getAttribute("src")
          console.log('pathFix=', path)
          ele.setAttribute("src", path)
        } else if (e == "AppBase") {
          let path = "file://" + appPath + '/web/' + ele.getAttribute("href")
          console.log('pathFix=', path)
          ele.setAttribute("href", path)
        }
        document.head.appendChild(ele)
      } else {
        document.body.innerHTML += data[e]
      }
    })
  })
}
addEventListener('DOMContentLoaded', () => {
  if (!window.location.host.includes('nimo.tv')) {
    injectCode_prepare()
  } else {
    injectCode_run()
  }
})
addEventListener('load', () => {
  ipc.send('get', 'ssInfo')
  // mainLog('loaded! from preload using page function')
  // ipc.send('log', 'loaded! from preload to main process!')
})

