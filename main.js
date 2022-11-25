// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const Main = require('electron/main');
const path = require('path')
const ssList = {} // sessions list {id:{name;color}}
var HomeWd = splashWd = {} // for localData call "save"

function randomHexColor() {
  let hex = Math.floor(Math.random() * 16777215).toString(16)
  return '#' + hex;
}

function createSplashWindow() {
  let sw = new BrowserWindow({
    width: 500, height: 309,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'web/splash-preload.js')
    }
  })
  sw.loadFile('web/splash.html')
  return sw
}
function createHomeWindow() {
  let mw = new BrowserWindow({
    width: 600, minWidth: 500,
    height: 800, minHeight: 309,
    show: false,
    transparent: true,
    frame: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      partition: 'home'
    }
  })
  mw.loadFile('web/dashboard.html');
  mw.once('ready-to-show', () => {
    mw.focus()
    mw.webContents.openDevTools({ mode: 'bottom' })
  })
  return mw
}
function newGameWindow(ssid = 'ss1', bgcolor = "#888") {
  let c = BrowserWindow.getAllWindows().length - 2 // count GameWindow
  let wd = new BrowserWindow({
    width: 540, minWidth: 540,
    height: 700, minHeight: 250,
    transparent: true,
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: bgcolor,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      partition: ssid,
      preload: path.join(__dirname, 'AkiAuto-Jackpot.js')
    }
  })
  // wd.blur()
  wd.loadURL('https://www.nimo.tv/fragments/act/slots-game')
  wd.once('ready-to-show', () => {
    wd.setPosition(c * 25, c * 15, true)
    wd.webContents.openDevTools({ mode: 'bottom' })
  })
  return wd;
}
function newGameSs(ssid) {
  let id = `ss${ssid}`
  let bgcolor
  // try load session list from local data to variable:
  let x = localData('load', 'gameSessions')
  if (x) {
    console.log('found session List in HomeWindow data', x)
    ssList = x
  }
  if (ssList[id]) {
    bgcolor = ssList[id]['color']
    console.log(`Create newGameWindow with EXIST ssid: ${id}, bgColor: ${bgcolor}`);
  } else {
    bgcolor = randomHexColor();
    ssList[id] = id
    ssList[id]['name'] = id //For DISPLAY in dashboard, will change to UserName
    ssList[id]['color'] = bgcolor
    console.log(`Create newGameWindow with NEW ssid: ${id}, bgColor: ${bgcolor}`);
    localData('save', 'gameSessions', ssList[id])
  }
  return newGameWindow(id, bgcolor)
}
function localData(type, dtKey, value) {
  // must run after HomeWd created. // HomeWd = createHomeWindow()
  if (type == "load") {
    HomeWd.webContents
      .executeJavaScript(`localStorage.${dtKey}`, true)
      .then(result => {
        if (result) {
          console.log(`Load data value ${result} of key ${dtKey}`)
          return result
        } else {
          console.log(`localData not Found! (key: ${dtKey}, value: ${result}`)
        }
      });
  } else if (type == "save") {
    HomeWd.webContents
      .executeJavaScript(`localStorage.${dtKey}='${value}';`, true)
      .then(result => {
        console.log(`saved data value ${value} for key ${dtKey}`)
      });
  }
}

app.whenReady().then(() => {
  //////////////////// START APP HERE ////////////////////////
  splashWd = createSplashWindow()
  HomeWd = createHomeWindow()
  let ss1 = newGameSs(1)

  ss1.once('ready-to-show', () => {
    splashWd.destroy()
    HomeWd.show()
    // MainWin.focus()
    // console.log(`mainWindow session: ${MainWin.webContents.session}`)

  });


  app.on('activate', () => {    // For macOS
    let c = BrowserWindow.getAllWindows().length
    if (c === 0) createHomeWindow().show()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
