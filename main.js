/*
___2023___
- Cần load luôn UserName vào titlebar khi chưa load game
*/

const env = 'development'
// const env = 'production'
if (env == 'development') {
  require('electron-reloader')(module, { debug: false, watchRenderer: true })
  // module "hot reload" này khiến Electron rất lag trên window
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
const fs = require('fs')

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
    width: 737, minWidth: 660, maxWidth: 800,
    height: 600, minHeight: 580,
    show: false,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true
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
const homeConsoleLog = function (what) { HomeWd.webContents.send('consoleLog', what) }
const PatchMenu = function () {
  const menu = Menu.getApplicationMenu()
  menu.items[1] = (new MenuItem({
    label: 'File',
    submenu: [
      { label: "Reload", role: 'reload', },
      { label: "Close", role: 'close', },
      {
        label: "Go to URL", accelerator: 'CommandOrControl+G',
        click: () => {
          let w = BrowserWindow.getFocusedWindow()
          if (w != null && w != HomeWd) { w.webContents.send('action', 'goURL') }
        }
      },
      {
        label: "Open URL", accelerator: 'CommandOrControl+O',
        click: () => {
          let w = BrowserWindow.getFocusedWindow()
          if (w != null && w != HomeWd) { w.webContents.send('action', 'openURL') }
        }
      },
    ],
  }))
  menu.items[3] = (new MenuItem({
    label: 'AkiAuto',
    submenu: [
      {
        label: "NEW SESSION",
        accelerator: 'CommandOrControl+N',
        click: () => { HomeWd.webContents.send('action', 'click-btn-BTN-NEW-SS') }
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
  let listRoleRemove = ['viewmenu', 'help']
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
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
  }
}
const ss = class {
  // ss.list: {  ss1: {Uname: undefined, color: #fea},
  //             ss2: {Uname: undefined, color: #33b},     }
  static ParPath = `${USERDATA}/Partitions`
  static list = {}
  static load = () => { ss.list = appData.get('ss') || {} }
  static save = () => appData.set('ss', ss.list)
  static count = () => { let c = appData.get('ssid_INCREMENT') || 0; return c }
  static updateUserName = (ssid, uName) => { ss.list[ssid]['uname'] = uName; ss.save() }
  static getColor = (ssid) => { ss.list[ssid]['color'] }
  static clear = (ssid) => {
    delete ss.list[ssid]; ss.save()
    log(`Đã xóa session id: ${ssid}`)
    if (Object.keys(ss.list).length == 0) { appData.set('ssid_INCREMENT', 0) }
    GameWindow.closeBySs(ssid)
    fs.rm(`${ss.ParPath}/${ssid}`, { recursive: true }, () => {
      console.log(`Deleted dir: ${ss.ParPath}/${ssid}`)
    })
    ss.cleanup()
  }
  static cleanup() {
    // Đôi khi thư mục partition không đc xóa hoàn toàn => tạo ss mới không chính xác.
    // Cần dọn dẹp dựa trên ss.list, sau đó set lại INCREMENT thành số nhỏ nhất
    let list = appData.get('ss')
      , listKeyArr = Object.keys(list)
    // console.log('from ss.cleanup(); list=', list) // DEBUG 
    fs.readdirSync(ss.ParPath).forEach(f => {
      let curPath = `${ss.ParPath}/${f}`
      let x = fs.statSync(curPath)
      // DELETE Partition Dir if DirName (ssid) not in config file:
      if (x.isDirectory()) {
        if (!listKeyArr.includes(f)) {
          fs.rm(curPath, { recursive: true }, () => {
            console.log(`Deleted dir: ${curPath}`)
          })
        }
      }
    })
    // Find and set Nearest INCREMENT NUMBER (next continue number in ss.list):
    let nextIncrementNum = +listKeyArr[listKeyArr.length - 1].slice(2)
    console.log('setting ssid_INCREMENT number to: ', nextIncrementNum)
    appData.set('ssid_INCREMENT', nextIncrementNum)
  }
  constructor() {
    let ID_increment = +ss.count() + 1
    let ssid = this.id = `ss${ID_increment}`
    this.color = COLOR.randomHex()
    log(`Creating new session: ssid=${this.id}; color=${this.color}`)
    ss.list[ssid] = { uname: undefined, color: this.color }
    appData.set('ssid_INCREMENT', ID_increment)
    ss.save()
    return { ssid: ssid };
  }
}
const GameWindow = class {
  id; ssid; par; move; list; closeBySs; countBySs; sendCount;
  static count = 0
  static list = {} // for manage what ssid use for BrowserWindow (id) 
  constructor(ssType, ssid = "", par = "") {
    ssType == 'NEW' ? ssid = (new ss()).ssid : ssid = ssType
    par = `persist:${ssid}`
    GameWindow.count += 1 // for handle move()
    this.move = function () {
      let c = GameWindow.count
      wd.setPosition(c * 50, c * 45, true)
    }
    let wd = new BrowserWindow({
      width: 540, minWidth: 540, maxWidth: 540,
      height: 700, minHeight: 140,
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
    GameWindow.list[id] = ssid  // ADD to list. ex: {3: 'ss1', 4: 'ss2'}
    // console.log('gwlist: ', GameWindow.list) // DEBUG
    this.ssid = ssid
    wd.loadFile('web/game.html')
    log(`Created GameWindow: id=${id}, ssid=${ssid}, partition=${par}`)
    wd.once('ready-to-show', () => {
      wd.show(); this.move()
      wd.webContents.openDevTools({ mode: 'detach' })
    })
    wd.once('close', () => {
      GameWindow.count -= 1
      delete GameWindow.list[id] // REMOVE from list
      // console.log('gwlist after closed: ', GameWindow.list) // DEBUG
      wd.destroy()
      GameWindow.sendCount(ssid)
    })
    return wd;
  }
  static ForceQuit = 0 //quit by user or by app.quit?
  static closeBySs(ssid) {
    let l = GameWindow.list
    Object.keys(l).forEach(wid => {
      if (l[wid] == ssid) {
        let id = +wid
        // console.log(`id=_${id}_; l[wid]=_${l[wid]}_; ssid=_${ssid}_`) // DEBUG
        BrowserWindow.fromId(id).close()
        log(`Closed window id ${wid} [session id ${ssid}]`)
      }
    })
  }
  static countBySs(ssid) {
    let l = GameWindow.list, r = 0
    Object.keys(l).forEach(wid => { if (l[wid] == ssid) { r++ } })
    return r
  }
  static sendCount(ssid) {
    let r = GameWindow.countBySs(ssid), q = GameWindow.ForceQuit
    if (q == 0) {
      HomeWd.webContents.send('gw', { action: 'updateCount', ssid: ssid, data: r })
    }
  }
}

//////////////////////////////// START APP HERE /////////////////////////////////
app.whenReady().then(() => {
  PatchMenu(); ss.load()
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
    }, 500)
    // })
  })
})

////////////////////////  IPC AREA 
ipcMain.on('new', (event, mess) => {
  let wd
  switch (mess) {
    case 'SS':
      wd = new GameWindow('NEW')
      wd.webContents.once('dom-ready', () => {
        HomeWd.webContents.send('btnLoadingDone', 'BTN-NEW-SS')
      })
      break;
    default:
      if (mess.split('-')[0] == "GameWindowSession") {
        let ssid = mess.split('-')[1]
        wd = new GameWindow(ssid)
        wd.webContents.once('dom-ready', () => {
          HomeWd.webContents.send('btnLoadingDone', 'BTN-NEW-SS-' + ssid)
          GameWindow.sendCount(ssid)
        })
      } else {
        console.log('ipc received "new" but', mess, 'not defined yet!')
      }
      break;
  }
})
ipcMain.on('InspectMeAtPos', (ev, cursorPos) => {
  let senderWd = BrowserWindow.fromWebContents(ev.sender)
  senderWd.webContents.inspectElement(cursorPos.x, cursorPos.y)
})

ipcMain.on('action', (ev, mess) => {
  let senderWd = BrowserWindow.fromWebContents(ev.sender)
  let wtid = senderWd.getTitle() + senderWd.id
  console.log("action from wtid=", wtid) // DEBUG
  switch (mess) {
    case 'CLOSE':
      let lastBounds = senderWd.getBounds()
      appData.set('bounds', { wtid: lastBounds })
      senderWd.close()
      break
    case 'QUITAPP':
      console.log('received QUITAPP action!'); GameWindow.ForceQuit = 1
      ss.save(); ss.cleanup(); HomeWd.destroy(); app.quit();
      break
    case 'MINIMIZE':
      let backup = senderWd.transparent
      backup ? senderWd.transparent = false : null
      senderWd.minimize(); senderWd.transparent = backup
      break
    case 'restorePosition': // in dev
      console.log(wtid)
      break
    case 'ssCleanup': ss.cleanup(); break
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
    case 'appPath': result = app.getAppPath(); break
    case 'ssList': result = ss.list; break
    case 'ssInfo':
      let ssid = GameWindow.list[senderWd.id]
      let ssColor = ss.getColor(ssid)
      senderWd.send('data', { ssid: ssid, color: ssColor })
      break
    default: console.log('ipc received "get" but', mess, 'not defined yet!')
  }
  senderWd.send(`response-${mess}`, result)
})
ipcMain.on('deleteSS', (ev, ssid) => {
  ss.clear(ssid); HomeWd.webContents.send('action', 'reloadSSID')
})
ipcMain.on('closeAllWdSs', (ev, ssid) => {
  GameWindow.closeBySs(ssid); HomeWd.webContents.send('action', 'reloadSSID')
})
ipcMain.on('loadURL', (ev, mess) => {
  let senderWd = BrowserWindow.fromWebContents(ev.sender)
  senderWd.loadURL(mess)
})
ipcMain.on('getGwCount', (ev, ssid) => GameWindow.sendCount(ssid))
ipcMain.on('log', (ev, mess) => console.log(mess))
ipcMain.on('saveAppData', (ev, mess) => appData.set(mess.key, mess.value))
ipcMain.on('getAppData', (ev, mess) => {
  let senderWd = BrowserWindow.fromWebContents(ev.sender)
  let data = appData.get(mess.key)
  senderWd.webContents.send(`responseAppData-${mess.key}`, data)
})
ipcMain.on('updateInfo', (ev, mess) => {
  // console.log('IPC _ updateInfo: ', mess) // DEBUG
  switch (mess.obj) {
    case "ss":
      ss.list[mess.ssid].Uname = mess.uname;
      ss.save(); HomeWd.webContents.send('action', 'reloadSSID')
      break
    case 'bet':
      ss.list[mess.ssid].bet = mess.bet
      ss.list[mess.ssid].pool = mess.pool
      log(`set BET value: ${mess.bet} [${ss.list[mess.ssid].Uname}]`)
      ss.save(); HomeWd.webContents.send('action', 'reloadSSID')
      break
    default: console.log('ipc received "updateInfo" but', mess.obj, 'not defined yet!')
  }

})

////////////////////////  END IPC AREA

app.on('activate', () => {    // For macOS
  let c = BrowserWindow.getAllWindows().length
  if (c === 0) createHomeWindow().show()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// On Window if "script cant be run... ", open powershell with administrator:
// Set - ExecutionPolicy - Scope CurrentUser - ExecutionPolicy Unrestricted
