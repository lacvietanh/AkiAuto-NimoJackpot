// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const Main = require('electron/main');
const path = require('path')
const ssList = [] // sessions list 

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

function newGameWindow(ssid = 1, bgcolor = "#888") {
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
  });
  let c = ssList.length // count GameWindow
  wd.loadURL('https://www.nimo.tv/fragments/act/slots-game')
  wd.once('ready-to-show', () => {
    wd.webContents.openDevTools({ mode: 'bottom' })
    wd.setPosition(c * 25, c * 25, true)
    wd.show()
  })
  return wd;
}

app.whenReady().then(() => {
  splashWd = splashWindow()
  MainWindow = new BrowserWindow({
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
  MainWindow.loadFile('web/dashboard.html');
  //Create first game window (session 1)
  let bgcolor = randomHexColor();
  let s = newGameWindow(1, bgcolor);
  // log session info to manage 
  ssList.push({
    ssid: "ss1", ssname: "ss1", sscolor: bgcolor
  });

  MainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splashWd.destroy()
      MainWindow.show()
    }, 2000);
  });




  app.on('activate', () => {    // For macOS
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
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
