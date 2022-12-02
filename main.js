// Modules to control application life and create native browser window
const {
  app, BrowserWindow, Menu, ipcMain,
  dialog, session, shell
} = require('electron')
const USERDATA = app.getPath('userData')
const path = require('path')
const fs = require('fs')
const Store = require('electron-store')
const appData = new Store()
// appData.get('ssList') 
var HomeWd = splashWd = {}
const gameWindowList = []
const ss = class {  // the session persist on disk.
  static path = `${USERDATA}/Partitions`
  static list = () => fs.readdirSync(ss.path)
  static count = () => ss.getList().length
  constructor(id = ss.count(), color = randomHexColor()) {
    log(`Creating new session: ssid=${id}; name=${id}; color=${color}`)
    // example: ssList: {ss1: {name: "ss1", color: "#fff"}}
    ssList[id] = {}
    ssList[id].name = id // can change soon, may be userName when logged in
    ssList[id].color = color
    console.log(`Create new session with data:`, ssList[id]);
    log(`Created new session with data:` + JSON.stringify(ssList[id]));
    console.log('create new GameWindow with session: ', id, color)
  }
  static clear = (ssid) => shell.trashItem(`${SS.path}/${ssid}`)
}

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
      nodeIntegration: false,
      contextIsolation: false, // Muốn page chạy script của preload thì false
      devTools: false,
      preload: path.join(__dirname, 'web/splash-pre.js')
    }
  })
  sw.loadFile('web/splash.html')
  // sw.webContents.openDevTools({ mode: 'detach' })
  return sw
}
function createHomeWindow() {
  let HomeWd = new BrowserWindow({
    width: 600, minWidth: 500,
    height: 500, minHeight: 400, maxHeight: 600,
    resizable: false,
    show: false,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false
      , contextIsolation: false
      , preload: path.join(__dirname, 'web/dashboard-pre.js')
      // , partition: 'persist:home'
    }
  })
  HomeWd.loadFile('web/dashboard.html')
  HomeWd.on('close', (e) => {
    HomeWd.webContents.send('action', 'ask-to-quit')
    e.preventDefault()
  })
  return HomeWd
}
function newGameWindow(ssid, color) {
  let Gwin = new BrowserWindow({
    width: 540, minWidth: 540,
    height: 700, minHeight: 250,
    transparent: true,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: color,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      partition: "persist:" + "ss" + ssid,
      preload: path.join(__dirname, 'web/pre-jackpot.js')
    }
  })
  Gwin.loadURL('https://www.nimo.tv/fragments/act/slots-game')
  let c = gameWindowList.length
  gameWindowList.push(Gwin.id)
  Gwin.once('ready-to-show', () => {
    Gwin.show()
    HomeWd.webContents.send('data', 'Created Game Window: ' + JSON.stringify(ssList[ssid])) //report to HomeWd
    Gwin.setPosition(c * 50, c * 45, true)
    Gwin.webContents.openDevTools({ mode: 'bottom' })
  })
  Gwin.once('closed', () => {
    gameWindowList.splice(indexOf(Gwin.id), 1)
  })
  return Gwin;
}
function log(mess, sendToMain = true) {
  console.log(mess)
  sendToMain ? HomeWd.webContents.send('mainLog', mess) : null
}

////////////////////////////////////// START APP HERE ///////////////////////////////////////////
app.whenReady().then(() => {
  splashWd = createSplashWindow()
  splashWd.webContents.send('mess', 'Đang tải bảng điều khiển...')
  HomeWd = createHomeWindow()
  HomeWd.webContents.once('ready-to-show', () => {
    splashWd.webContents.send('mess', 'Đang tải cửa sổ game...')
    // let firstGameWindow = newAcc(1)
    // firstGameWindow.webContents.once('did-finish-load', () => {
    splashWd.webContents.send('mess', 'Hoàn tất! Chúc bạn một ngày vui vẻ😉')
    setTimeout(() => {
      splashWd.destroy()
      HomeWd.show()
    }, 700)
    // })
  })

})

////////////////////////  IPC AREA 
ipcMain.on('new', (event, mess) => {
  switch (mess) {
    case 'acc':
      let c = gameWindows.length, s = c + 1
      log(`Đang mở cửa sổ game mới... (Đang có: ${c})`)
      let wd = newAcc(s)
      wd.webContents.once('dom-ready', () => {
        setTimeout(() => {
          log(`Tải xong cửa sổ game mới. acc id: <b>acc${s}</b>, tổng ${s}`)
          HomeWd.webContents.send('removeLoading', 'panel-btn-newSs')
          HomeWd.focus();
        }, 3000)
      })
      break;
    default: console.log('ipc received "new" but', mess, 'not defined yet!')
      break;
  }
})
ipcMain.on('action', (ev, mess) => {
  let senderWd = BrowserWindow.fromWebContents(ev.sender)
  switch (mess) {
    case 'QUITAPP': console.log('received QUITAPP action!'); HomeWd.destroy(); app.quit();
      break
    case 'MINIMIZE':
      let backup = senderWd.transparent
      backup ? senderWd.transparent = false : null
      senderWd.minimize();
      senderWd.transparent = backup
      break
    default: console.log('ipc received "action" but', mess, 'not defined yet!')
      break
  }
})
ipcMain.on('log', (ev, mess) => {
  console.log(mess)
})
ipcMain.on('get', (ev, mess) => {
  switch (mess) {
    case 'appInfo':
      let senderWd = BrowserWindow.fromWebContents(ev.sender)
      let appInfo = {
        appBrand: 'AkiNet', appName: app.getName(), appVersion: app.getVersion()
      }
      senderWd.send('appInfo', appInfo) //respond to every window asker
      break
    default: console.log('ipc received "get" but', mess, 'not defined yet!')
  }
})
////////////////////////  END IPC AREA

app.on('activate', () => {    // For macOS
  let c = BrowserWindow.getAllWindows().length
  if (c === 0) createHomeWindow().show()
})

app.on('window-all-closed', () => {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// On Window if "script cant be run... ", open powershell with administrator:
// Set - ExecutionPolicy - Scope CurrentUser - ExecutionPolicy Unrestricted
