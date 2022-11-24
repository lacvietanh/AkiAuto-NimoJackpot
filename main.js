// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const Main = require('electron/main');
const path = require('path')
const ssList = [] // sessions list 

function randomHexColor() {
  return Math.floor(Math.random() * 16777215).toString(16)
}
function splashWindow() {
  return new BrowserWindow({
    width: 500, height: 309,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      // nodeIntegration: true,
      preload: path.join(__dirname, 'splas-preload.js')
    }
  });
}
function newGameWindow(ssid = 1, bgcolor = "#888") {
  let wd = new BrowserWindow({
    width: 540, minWidth: 540,
    height: 545, minHeight: 250,
    show: false,
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      partition: 'ss' + ssid,
      preload: path.join(__dirname, 'AkiAuto-Jackpot.js')
    }
  });
  wd.loadURL('https://www.nimo.tv/fragments/act/slots-game');
  wd.once('ready-to-show', () => {
    wd.setBackgroundColor(bgcolor)
    wd.show()
  });
  return wd;
}

app.whenReady().then(() => {
  splashWd = splashWindow()
  splashWd.loadFile('splash.html')

  MainWindow = new BrowserWindow({
    width: 540, minWidth: 500,
    height: 600, minHeight: 309,
    show: false,
    transparent: true,
    frame: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      partition: 'main'
    }
  })
  MainWindow.loadFile('main.html');
  MainWindow.setBackgroundColor('#FF000088'); //test

  MainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splashWd.destroy()
      MainWindow.show()
      //Create first game window (session 1)
      let bgcolor = randomHexColor()
      let s = newGameWindow(1, bgcolor)
      ssList.push({
        ssid: "ss1",
        ssname: "ss1",
        sscolor: bgcolor
      });
      console.log(ssList[0])
    }, 1000);
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
