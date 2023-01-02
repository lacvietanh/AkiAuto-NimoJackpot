window.addEventListener('blur', () => { $id('APP_TITLEBAR').classList.remove('active') })
window.addEventListener('focus', () => { $id('APP_TITLEBAR').classList.add('active') })
window.addEventListener('click', () => { $id('APP_TITLEBAR').classList.add('active') })
Boolean.prototype.toOnOff = function () {
  let r, v = this.valueOf()
  v ? r = 'ON' : r = 'OFF'
  return r
}
const gameURL = 'https://www.nimo.tv/fragments/act/slots-game'

var target_percent = 70
  ;
var AkiAutoRunBtn
  , AutoInterval
  , AkiAccUname
  , AkiAccAvt
  , nimoBtnSpin
  , nimoNumWin
  ;
var akiPanelCss = ''
var akiPanel = ''

//////////////////// FUNCTION ////////////////////
getSsid = () => $qs('#APP_TITLEBAR .ssid').innerHTML
function parseCookie() {
  return document.cookie
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
}
function delCookie(name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function randomStr(length) {
  var result = '';
  var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var l = c.length;
  for (var i = 0; i < length; i++) {
    result += c.charAt(Math.floor(Math.random() * l));
  }
  return result;
}
function getNimoNum(x) {
  // bean: 0, prize: 1, bet: 2 
  let t = "", z;
  document.querySelectorAll('.slots-panel-nums')[x].childNodes.forEach(s => {
    z = s.classList[1].split('-')[1];
    (z == "dot") ? t += '.' : t += z;
  }); return t;
}
UI = class {
  static gamePanelToggle() {
    let e = $id('GamePanel'), b = $id('auto-panel-toggle')
    e.classList.toggle('min')
    e.classList.contains('min') ? b.innerHTML = "&#8592" : b.innerHTML = "&#8594"
  }
  static gameSizeToggle() {
    let e = $id('APP_BODY'), b = $id('gameSize-toggle')
    e.classList.toggle('min')
    if (e.classList.contains('min')) {
      b.innerHTML = "&#8609"; window.resizeTo(540, 180)
    } else {
      b.innerHTML = "&#8607"; window.resizeTo(540, 700)
    }
  }
}
menu = class {
  static getBean = () => getNimoNum(0)
  static getPrize = () => getNimoNum(1)
  static getBet = () => getNimoNum(2)
  static getUserName() {
    if (document.cookie.includes('userName')) {
      window.userName = parseCookie()['userName'] || "Not Login"
      $id('APP_TITLE').innerHTML = window.userName
      $id('AkiAccAvt').src = parseCookie()['avatarUrl'] || null
      ipc.send('updateInfo', {
        obj: 'ss', ssid: getSsid(), uname: window.userName
      })
    }
  }
  static UpdatePrize() {
    $id('gameInfo-prize').innerHTML = menu.getPrize();
  }
  static UpdateBean() {
    document.getElementById('panel-acc-balance').innerHTML = menu.getBean();
  }
  static updateSpinCount() {
    document.getElementById('counterSPIN').innerHTML = localStorage['cSpin'];
  }
  static updateAutoSpinCount() {
    document.getElementById('counterAUTO').innerHTML = localStorage['cAuto'];
  }
  static NimoHomepage() {
    let options = "menubar=no,scrollbars=yes,location=no,toolbar=no";
    return window.open('/', '_blank', 'width=1260,height=640' + options);
  }
  static clickBET(w) {
    if (window.location.host.includes('nimo.tv')) {
      w ? $qs('div.control-area__plus-btn').click()
        : $qs('div.control-area__minus-btn').click()
      menu.updateBET()
    }
  }
  static updateBET() {
    menu.UpdatePrize()
    let bet, pool
    bet = menu.getBet(); $id('gameInfo-BET').innerHTML = bet;
    if (+ bet >= 4500) {
      pool = 'BIG'
      $id('gameInfo-BET').classList.add('o')
      $id('gameInfo-prize').classList.add('o')
    } else {
      pool = 'SMALL'
      $id('gameInfo-BET').classList.remove('o')
      $id('gameInfo-prize').classList.remove('o')
    }
    ipc.send('updateInfo', {
      obj: 'bet', ssid: getSsid(), bet: bet, pool: pool
    })
  }
  static setTargetPercent() {
    document.getElementById('targetPrizeStop').value
      = Math.floor(menu.getPrize() * target_percent / 100);
  }
  static RUN() {
    function ClickSpin() {
      nimoBtnSpin.click();
      localStorage['cAuto'] = parseInt(localStorage['cAuto']) + 1;
      menu.updateAutoSpinCount();
    }
    function check() {
      //////////////////////// AUTO RUN CONDITION HERE ////////////////////////
      let target = document.getElementById('targetPrizeStop').value;
      if (menu.getPrize() > target) {
        if (nimoBtnSpin.querySelector('.num-img')) {
          console.log('Free mode... Waiting...!');
        } else {
          console.log(`Prize > ${target} . .  continue..`);
          ClickSpin();
          // setTimeout(aki.hack, 900);
        }
      } else {
        console.log(`Prize below ${target} . . Waiting..`);
      }
    }
    //////////////////////// END AUTO RUN CONDITION  ////////////////////////
    if (!AutoInterval) {
      check();
      AutoInterval = setInterval(check, 3000);
      AkiAutoRunBtn.innerHTML = 'STOP';
    } else {
      clearInterval(AutoInterval);
      AutoInterval = false;
      AkiAutoRunBtn.innerHTML = 'RUN';
    }
  }

}

aki = class {
  static init() {
    // init variable:
    AkiAutoRunBtn = document.getElementById('AkiAutoRunBtn');
    AkiAccUname = document.getElementById('panel-acc-uname');
    AkiAccAvt = document.getElementById('panel-acc-avt');
    nimoBtnSpin = document.querySelector('.control-area__bet-btn');
    nimoNumWin = document.querySelector('.control-area__win-num');
    // nimoWalledD = document.querySelector('.nimo-wallet .c5').innerHTML;
    // nimoWalledB = document.querySelector('.nimo-wallet .c7').innerHTML;
    // (localStorage['maxP']) ? menu.updateMaxP() : localStorage['maxP'] = 0;
    // (localStorage['maxWin']) ? menu.updateMaxWin() : localStorage['maxWin'] = 0;
    menu.setTargetPercent();
    menu.getUserName();
    menu.UpdatePrize();
    menu.UpdateBean();
    setInterval(() => {
      menu.UpdatePrize();
      menu.UpdateBean();
    }, 3000);
  }
}
/////////////////// RUN ///////////////////
addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded')
})

afterInject = function () {
  console.log('afterInject')
  menu.getUserName()
  menu.updateBET()
  setInterval(menu.UpdatePrize, 3000)
}