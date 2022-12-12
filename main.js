const env = 'development'
if (env === 'development') {
  require('electron-reloader')(module, { debug: false, watchRenderer: true })
}
//////// REQUIRE //////
const {
  app, ipcMain, dialog, globalShortcut,
  BrowserWindow, Menu, MenuItem, session,
  shell
} = require('electron')
const execSync = require('child_process').execSync
const Store = require('electron-store')
const path = require('path')

//////// MY FUNCTIONS //////
const sh = (cmd) => execSync(cmd, { encoding: 'utf-8' })
const generateUUID = function () {
  let
    d = new Date().getTime(),
    d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
}
const ObjEmpty = function (obj) {
  for (var i in obj) { return false }
  return true
}
const createSplashWindow = function () {
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
  return sw
}
const createHomeWindow = function () {
  let HomeWd = new BrowserWindow({
    width: 600,
    height: 700,
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
      // , partition: DEFAULT 
    }
  })
  HomeWd.loadFile('web/dashboard.html')
  HomeWd.on('close', (e) => {
    HomeWd.webContents.send('action', 'ask-to-quit')
    e.preventDefault()
  })
  return HomeWd
}
const log = function (mess, sendToMain = true) {
  console.log(mess)
  sendToMain ? HomeWd.webContents.send('mainLog', mess) : null
}
const initMenu = function () {
  const menu = Menu.getApplicationMenu()
  menu.items[0] = (new MenuItem({
    label: 'AkiAuto',
    submenu: [
      {
        label: "Reload", role: 'reload',
        accelerator: 'CommandOrControl+R',
      },
      {
        label: "NEW SPEC SESSION",
        accelerator: 'CommandOrControl+Shift+N',
        click: () => {
          HomeWd.webContents.send('action', 'click-btn-TITLEBAR_BTN_NEW')
        }
      },
      {
        label: 'DevTools', role: 'toggleDevTools', accelerator: 'F12'
      },
      {
        label: 'Quit', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
        click: () => { HomeWd.webContents.send('action', 'ask-to-quit') }
      }
    ]
  }))
  let listRoleRemove = ['appmenu', 'viewmenu', 'help']
  let menu_fix = menu?.items.filter((item) => {
    return !listRoleRemove.includes(item.role)
  })
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu_fix))
}

//////// MY VARIABLES //////
const USERDATA = app.getPath('userData')
const appData = new Store()
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true
var HomeWd = splashWd = {}

//////// MY CLASSES //////
const COLOR = class {
  static invertHex(hex) {
    return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
  }
  static randomHex() {
    let hex = Math.floor(Math.random() * 16777215).toString(16)
    return '#' + hex;
  }
}
const ss = class {
  static ParPath = `${USERDATA}/Partitions`
  static list = {}
  static count = () => ss.getList().length
  constructor(id, color) {
    this.id = `ss${ss.count()}`
    this.color = COLOR.randomHex()
    log(`Creating new session: ssid=${id}; name=${id}; color=${color}`)
    ssList[id] = {}
    ssList[id].name = id // can change soon, may be userName when logged in
    ssList[id].color = color
    console.log(`Create new session with data:`, ssList[id]);
    log(`Created new session with data:` + JSON.stringify(ssList[id]));
    console.log('create new GameWindow with session: ', id, color)
  }
  static clear = (ssid) => shell.trashItem(`${ss.path}/${ssid}`)
}
const GameWindow = class {
  id; ssid; par; move;
  static count = 0
  static list = {} // to manage what ssid use for BrowserWindow (id) 
  constructor(ssid = "SPEC", par = (new Date()).getTime()) {
    ssid != 'SPEC' ? par = `persist:${ssid}` : log('Open new sperate session: ' + par)
    GameWindow.count += 1 // for handle move()
    this.move = function () {
      let c = GameWindow.count
      wd.setPosition(c * 50, c * 45, true)
    }
    let wd = new BrowserWindow({
      width: 540, minWidth: 540, maxWidth: 540,
      height: 700, minHeight: 250,
      transparent: true,
      show: false,
      frame: false,
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'icon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false,
        partition: par,
        webviewTag: true,
        preload: path.join(__dirname, 'web/jackpot-pre.js')
      }
    })
    let id = this.id = wd.id
    this.ssid = ssid // chưa sử dụng
    this.par = par // for handle delete on disk
    GameWindow.list[id] = ssid
    wd.loadFile('web/game.html')
    // wd.loadURL('https://www.nimo.tv/fragments/act/slots-game')
    log(`created GameWindow: id=${id}, ssid=${ssid}, partition=${par}`)
    wd.once('ready-to-show', () => {
      wd.show()
      this.move()
    })
    wd.once('close', () => {
      GameWindow.count -= 1
      delete GameWindow.list[id]
      GameWindow.log_close(id, ssid)
      wd.destroy()
    })
    return wd;
  }
  static log_close(id, ssid) {
    if (GameWindow.ForceQuit == 0) { //prevent Object Detroyed
      log(`Đã đóng cửa sổ game id ${id} (sử dụng session ${ssid})`)
    }
  }
  static ForceQuit = 0 //quit by user or by app.quit?
}

//////////////////////////////// START APP HERE /////////////////////////////////
app.whenReady().then(() => {
  initMenu()
  splashWd = createSplashWindow()
  splashWd.webContents.send('mess', 'Đang tải bảng điều khiển...')
  HomeWd = createHomeWindow()
  HomeWd.webContents.once('ready-to-show', () => {
    splashWd.webContents.send('mess', 'Đang tải cửa sổ game...')
    // NOTE: Chỗ này cần tạo 1 cửa sổ mẫu để lấy thông tin PRIZE
    // let firstGameWindow = new GameWindow(1)
    // firstGameWindow.webContents.once('did-finish-load', () => {
    splashWd.webContents.send('mess', 'Hoàn tất! Chúc bạn một ngày vui vẻ😉')
    setTimeout(() => {
      splashWd.destroy()
      HomeWd.show()
    }, 1300)
    // })
  })
  ////////// GLOBAL OS SHORTCUT //////////
  // if (process.platform === 'darwin') {
  //   globalShortcut.register('Command+Q', () => {
  //     HomeWd.webContents.send('action', 'ask-to-quit')
  //   })
  // }
})

////////////////////////  IPC AREA 
ipcMain.on('new', (event, mess) => {
  switch (mess) {
    case 'specSS':
      let wd = new GameWindow()
      wd.webContents.once('dom-ready', () => {
        HomeWd.webContents.send('removeLoading', 'TITLEBAR_BTN_NEW')
        HomeWd.focus()
      })
      break;
    default: console.log('ipc received "new" but', mess, 'not defined yet!')
      break;
  }
})
ipcMain.on('action', (ev, mess) => {
  let senderWd = BrowserWindow.fromWebContents(ev.sender)
  switch (mess) {
    case 'QUITAPP':
      console.log('received QUITAPP action!'); GameWindow.ForceQuit = 1
      HomeWd.destroy(); app.quit();
      break
    case 'MINIMIZE':
      let backup = senderWd.transparent
      backup ? senderWd.transparent = false : null
      senderWd.minimize(); senderWd.transparent = backup
      break
    default: console.log('ipc received "action" but', mess, 'not defined yet!')
      break
  }
})
ipcMain.on('get', (ev, mess) => {
  let senderWd = BrowserWindow.fromWebContents(ev.sender)
  let result
  switch (mess) {
    case 'appInfo':
      result = {
        appBrand: 'AkiNet', appName: app.getName(), appVersion: app.getVersion()
      }
      break
    case 'totalCodeLines':
      result = sh(`
        a=$(grep -c "" main.js);for i in web/*.* ;do a=$a+$(grep -c "" $i);done;echo $a|bc
      `)
      break
    case 'appPath': result = app.getAppPath()
      break
    default: console.log('ipc received "get" but', mess, 'not defined yet!')
  }
  senderWd.send(`response-${mess}`, result)
})
ipcMain.on('log', (ev, mess) => {
  console.log(mess)
})
ipcMain.on('loadURL', (ev, mess) => {
  let senderWd = BrowserWindow.fromWebContents(ev.sender)
  senderWd.loadURL(mess)
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
