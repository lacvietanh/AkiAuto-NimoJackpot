// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const Main = require('electron/main');
const path = require('path')

function splashWindow() {
  return new BrowserWindow({
    width: 500, height: 309,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      // nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
}
function newGameWindow(ssid) {
  let wd = new BrowserWindow({
    width: 540, minWidth: 540,
    height: 545, minHeight: 250,
    show: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      partition: ssid,
      preload: path.join(__dirname, 'AkiAuto-Jackpot.js')
    }
  })
  wd.loadURL('https://www.nimo.tv/fragments/act/slots-game')

}

app.whenReady().then(() => {
  splashWd = splashWindow()
  splashWd.loadFile('splash.html')

  MainWindow = new BrowserWindow({
    width: 540, minWidth: 540,
    height: 600, minHeight: 300,
    show: false,
    frame: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      partition: 'main'
      // preload: path.join(__dirname, 'AkiAuto-Jackpot.js')
    }
  })
  MainWindow.loadFile('main.html')
  MainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splashWd.destroy();
      MainWindow.show();
    }, 1500);
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
