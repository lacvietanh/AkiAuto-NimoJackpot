// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')

function splashWindow() {
  return new BrowserWindow({
    width: 500, height: 309,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
}
function newWindow(ssid = 1) {
  return new BrowserWindow({
    width: 540, minWidth: 540,
    height: 545, minHeight: 250,
    // titleBarStyle: 'hiddenInset',
    show: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      partition: ssid,
      preload: path.join(__dirname, 'AkiAuto-Jackpot.js')
    }
  })
}

// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  splashScreen = splashWindow()
  splashScreen.loadFile('splash.html')
  MainWindow = newWindow('main')
  MainWindow.loadURL('https://www.nimo.tv/fragments/act/slots-game')

  MainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splashScreen.destroy();
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
