// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
var ssList = {} // sessions list, example: {'ss1': {name:'ss1', color: '#fff'}}
var HomeWd = splashWd = {} // for localData call "save"
var gameWindows = []

function randomHexColor() {
  let hex = Math.floor(Math.random() * 16777215).toString(16)
  return '#' + hex;
}
function ObjEmpty(obj) {
  for (var i in obj) {
    return false;
  }
  return true;
}
function createSplashWindow() {
  let sw = new BrowserWindow({
    width: 809, height: 500,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'web/splash-preload.js')
    }
  })
  sw.loadFile('web/splash.html')
  return sw
}
function createHomeWindow() {
  let v
  let Hwin = new BrowserWindow({
    width: 600, minWidth: 500,
    height: 800, minHeight: 309,
    show: false,
    transparent: true,
    frame: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'web/dashboard-preload.js'),
      partition: 'home'
    }
  })
  Hwin.loadFile('web/dashboard.html');
  HomeWd = Hwin
  v = localData.load('gameSessions', 49)
  v ? ssList = JSON.parse(v) : null
  // console.log('[After load localData] ssList=', ssList)
  return Hwin
}
function newGameWindow(ssid = 'ss1', bgcolor = "#888") {
  let Gwin = new BrowserWindow({
    width: 540, minWidth: 540,
    height: 700, minHeight: 250,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: bgcolor,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      partition: ssid,
      preload: path.join(__dirname, 'AkiAuto-Jackpot.js')
    }
  })
  let c = gameWindows.length
  gameWindows.push(Gwin.id)
  console.log('gameWindows: (', gameWindows.length, '); Ids: ', gameWindows);
  Gwin.loadURL('https://www.nimo.tv/fragments/act/slots-game')
  Gwin.once('ready-to-show', () => {
    Gwin.show()
    Gwin.setPosition(c * 50, c * 45, true)
    Gwin.webContents.openDevTools()
  })
  return Gwin;
}
function newGameSs(ssid) {
  let bgcolor, z
  let id = `ss${ssid}`
  console.log('creating newGameSs:', id)
  if (!ssList[`${id}`]) {
    console.log(`ssList['${id}'] empty! Creating... `);
    bgcolor = randomHexColor();
    ssList[`${id}`] = {} // example: {ss1: {name: "ss1", color: "#fff"}}
    ssList[`${id}`].name = id //For DISPLAY in dashboard, will change to UserName
    ssList[`${id}`].color = bgcolor
    console.log(`Create session with data:`, ssList[`${id}`]);
    localData.save('gameSessions', JSON.stringify(ssList))
  } else {
    console.log("ssList exist! Re-creating... ");
    bgcolor = ssList[`${id}`]['color']
    console.log("Creating newGameWindow with EXIST ssid: ", id, ", bgColor: ", bgcolor);
  }
  console.log('create newGameWindow!', id, bgcolor)
  return newGameWindow(id, bgcolor)
}
class localData {
  // must run after HomeWd created. // HomeWd = createHomeWindow()
  static load(dtKey, fromLine = 'debugLine') {
    HomeWd.webContents
      .executeJavaScript(`localStorage.getItem('${dtKey}')`, true)
      .then(rs => {
        if (rs) {
          console.log(111, "localData Loaded! Key:", dtKey, " Value:", rs)
          return rs
        } else {
          console.log("localData not Found! Key:", dtKey, " Value:", rs, "From:", fromLine)
          return false
        }
      })
  }
  static save(dtKey, value) {
    // console.log(117, 'localData: Saving data.. ', dtKey, '=', value)
    HomeWd.webContents
      .executeJavaScript(`localStorage.${dtKey}='${value}'`, true)
      .then(rs => {
        console.log(121, 'localData saved! Key: ', dtKey, " Value: ", value)
      });
  }
}
function mainLog(mess) {
  HomeWd.webContents.send('mainLog', mess)
}
app.whenReady().then(() => {
  //////////////////// START APP HERE ////////////////////////
  splashWd = createSplashWindow()
  HomeWd = createHomeWindow()
  HomeWd.once('ready-to-show', () => {
    let firstGameWindow = newGameSs(0)
    setTimeout(() => {
      splashWd.destroy()
      HomeWd.show()
    }, 1000)
    firstGameWindow.webContents.once('did-finish-load', () => {
      HomeWd.webContents.openDevTools({ mode: 'detach' })
    })
  })

  ipcMain.on('new', (event, mess) => {
    // let webContents = event.sender
    // const senderWd = BrowserWindow.fromWebContents(webContents)
    // senderWd.setTitle(title) // do something with sender window
    switch (mess) {
      case 'session':
        mainLog('Đang mở cửa sổ game mới...')
        let ssId = 'ss' + gameWindows.length
        let w = newGameSs(ssId)
        w.webContents.once('did-finish-load', () => {
          mainLog(`Đã mở cửa sổ game mới. session id: <b>${ssId}</b>`)
          HomeWd.webContents.send('removeLoading', 'panel-btn-newSs')
          HomeWd.focus();
        })
        break;
      default: console.log('from ipc: new', mess, 'UnDefined!')
        break;
    }
  })
  ipcMain.on('log', (event, mess) => {
    console.log(mess)
  })

})


app.on('activate', () => {    // For macOS
  let c = BrowserWindow.getAllWindows().length
  if (c === 0) createHomeWindow().show()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
