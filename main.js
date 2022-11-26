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
      nodeIntegration: false,
      contextIsolation: false, // Muốn page chạy script của preload thì false
      devTools: false,
      preload: path.join(__dirname, 'web/splash-preload.js')
    }
  })
  sw.loadFile('web/splash.html')
  // sw.webContents.openDevTools({ mode: 'detach' })
  return sw
}
function createHomeWindow() {
  let Hwin = new BrowserWindow({
    width: 600, minWidth: 500,
    height: 800, minHeight: 309,
    show: false,
    transparent: true,
    frame: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.join(__dirname, 'web/dashboard-preload.js'),
      partition: 'home'
    }
  })
  Hwin.loadFile('web/dashboard.html');
  HomeWd = Hwin
  let v = localData.load('gameSessions', 49)
  v ? ssList = JSON.parse(v) : null
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
    // console.log(121, 'localData: Saving data.. ', dtKey, '=', value)
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
  splashWd.webContents.send('mess', 'Đang tải bảng điều khiển...')
  HomeWd = createHomeWindow()
  HomeWd.webContents.once('did-finish-load', () => {
    splashWd.webContents.send('mess', 'Đang tải cửa sổ game...')
    let firstGameWindow = newGameSs(0)
    firstGameWindow.webContents.once('did-finish-load', () => {
      splashWd.webContents.send('mess', 'Hoàn tất! Chúc bạn một ngày vui vẻ😉')
      setTimeout(() => {
        splashWd.destroy()
        HomeWd.show()
      }, 1700)
    })
  })


})

////////////////////////  IPC AREA 
ipcMain.on('new', (event, mess) => {
  switch (mess) {
    case 'session':
      let c = gameWindows.length
      mainLog(`Đang mở cửa sổ game mới... (Đang có: ${c})`)
      let w = newGameSs("ss" + c)
      w.webContents.once('did-finish-load', () => {
        mainLog(`Tải xong cửa sổ game mới. session id: <b>ss${c}</b>, tổng ${c + 1}`)
        HomeWd.webContents.send('removeLoading', 'panel-btn-newSs')
        HomeWd.focus();
      })
      break;
    default: console.log('ipc received "new" but', mess, 'not defined yet!')
      break;
  }
})
ipcMain.on('log', (event, mess) => {
  console.log(mess)
})
ipcMain.on('get', (event, mess) => {
  switch (mess) {
    case 'appInfo':
      let senderWd = BrowserWindow.fromWebContents(event.sender)
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
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
