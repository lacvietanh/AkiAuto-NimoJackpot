// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const Main = require('electron/main');
const path = require('path')
const ssList = {} // sessions list {id:{name;color}}

function randomHexColor() {
  let hex = Math.floor(Math.random() * 16777215).toString(16)
  return '#' + hex;
}

function splashWindow() {
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
function createMainWindow() {
  let mw = new BrowserWindow({
    width: 540, minWidth: 500,
    height: 600, minHeight: 309,
    show: false,
    transparent: true,
    frame: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      partition: 'main'
    }
  })
  mw.loadFile('web/dashboard.html');
  return mw
}
function newGameWindow(ssid = 1) {
  let bgcolor
  let id = `ss${ssid}`
  if (ssList[id]) {
    bgcolor = ssList[id]['color']
  } else {
    bgcolor = randomHexColor();
    ssList[id] = id
    ssList[id]['name'] = id //For DISPLAY in dashboard, will change to UserName
    ssList[id]['color'] = bgcolor
  }
  let wd = new BrowserWindow({
    width: 540, minWidth: 540,
    height: 700, minHeight: 250,
    transparent: true,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: bgcolor,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      partition: 'ss' + ssid,
      preload: path.join(__dirname, 'AkiAuto-Jackpot.js')
    }
  })
  wd.loadURL('https://www.nimo.tv/fragments/act/slots-game')
  let c = BrowserWindow.getAllWindows().length - 3 // count GameWindow
  console.log(c);
  wd.once('ready-to-show', () => {
    wd.show()
    wd.setPosition(c * 25, c * 15, true)
    wd.webContents.openDevTools({ mode: 'bottom' })
  })
  return wd;
}

app.whenReady().then(() => {
  splashWd = splashWindow()
  MainWindow = createMainWindow()
  let ss1 = newGameWindow(1)

  MainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splashWd.destroy()
      ss1.show()
      MainWindow.show()
      MainWindow.focus()
    }, 2000);
  });


  app.on('activate', () => {    // For macOS
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
  app.on('session-created', (ss) => {
    console.log(ss)
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
// app.on('session-created', (session) => {
//   console.log(session)
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// win = this.webview.openDevTools({ mode: 'detach' });
