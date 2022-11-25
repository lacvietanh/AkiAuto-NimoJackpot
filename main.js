// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
// const { ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
var ssList = {} // sessions list, example: {'ss1': {name:'ss1', color: '#fff'}}
var HomeWd = splashWd = {} // for localData call "save"

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
      partition: 'home'
    }
  })
  Hwin.loadFile('web/dashboard.html');
  return Hwin
}
function newGameWindow(ssid = 'ss1', bgcolor = "#888") {
  let c = BrowserWindow.getAllWindows().length - 1 // count GameWindow
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
  wd.loadURL('https://www.nimo.tv/fragments/act/slots-game')
  wd.once('ready-to-show', () => {
    wd.setPosition(c * 50, c * 25, true)
    wd.webContents.openDevTools({ mode: 'bottom' })
  })
  return wd;
}
async function newGameSs(ssid) {
  let bgcolor, v, z
  let id = `ss${ssid}`
  console.log('creating newGameSs:', id)
  console.log('[Before load localData] ssList=', ssList)
  v = await localData.load('gameSessions', 78)
  v ? ssList = JSON.parse(v) : null
  console.log('[After load localData] ssList=', ssList)
  if (ObjEmpty(ssList)) {
    console.log("ssList empty! Creating... ");
    bgcolor = randomHexColor();
    ssList[`${id}`] = {} // example: {ss1: {name: "ss1", color: "#fff"}}
    ssList[`${id}`].name = id //For DISPLAY in dashboard, will change to UserName
    ssList[`${id}`].color = bgcolor
    console.log(`Create session with data:`, ssList[`${id}`]);
    console.log(`After ss1 created| ssList=(${Object.keys(ssList).length}): `, ssList);
    localData.save('gameSessions', JSON.stringify(ssList))
  } else {
    bgcolor = ssList[`${id}`]['color']
    console.log("Create newGameWindow with EXIST ssid: ", id, ", bgColor: ", bgcolor);
  }
  z = newGameWindow(id, bgcolor)
  console.log('created newGameWindow', id, bgcolor, z.id)
  return z
}
class localData {
  // must run after HomeWd created. // HomeWd = createHomeWindow()
  static async load(dtKey, fromLine = 'debugLine') {
    console.log('localData: Loading ', dtKey)
    await HomeWd.webContents
      .executeJavaScript(`localStorage.getItem('${dtKey}')`, true)
      .then(rs => {
        if (rs) {
          console.log("localData Loaded! Key:", dtKey, " Value:", rs)
          return rs
        } else {
          console.log("localData not Found! Key:", dtKey, " Value:", rs, "From line:", fromLine)
          return false
        }
      })
  }
  static save(dtKey, value) {
    console.log('localData: Saving data.. ', dtKey, '=', value)
    HomeWd.webContents
      .executeJavaScript(`localStorage.${dtKey}='${value}'`, true)
      .then(rs => {
        console.log('localData saved! Key: ', dtKey, " Value: ", value)
      });
  }
}

app.whenReady().then(() => {
  //////////////////// START APP HERE ////////////////////////
  splashWd = createSplashWindow()
  HomeWd = createHomeWindow()
  HomeWd.once('ready-to-show', async () => {
    let ss0 = await newGameSs(0)

    ss0.once('ready-to-show', () => {
      splashWd.destroy()
      HomeWd.show()
      HomeWd.webContents.openDevTools({ mode: 'detach' })
    })
  })

  // ipcRenderer.on('newSs', () => {
  //   newGameSs(Object.keys(ssList).length + 1)
  // })


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
