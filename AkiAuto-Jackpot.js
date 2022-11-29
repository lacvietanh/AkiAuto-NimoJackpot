// Author: Lac Viet Anh
// Script đang còn thử nghiệm, vui lòng không sao chép..
////
var AkiSriptAuthor = 'Lạc Việt Anh'
  , target_percent = 70
  ;
var AkiAutoRunBtn
  , AutoInterval
  , AkiAccUname
  , AkiAccAvt
  , nimoBtnSpin
  , nimoNumWin
  ;

var akiPanelCss = /*css*/`
  body{margin-top:45px!important}
  .inline-flex {
    display: inline-flex;
    align-items: center;
  }
  .akipanel {
    font-family: Tahoma, sans-serif;
    font-size: 0.9rem;
  }
  .akinav {
    z-index: 999;
    display: flex;
    position: fixed;
    top: 0;left: 0;right: 0;
    overflow: hidden;
    color: #eee;
    align-items: center;
    justify-content: space-between;
    -webkit-app-region: drag;
    -webkit-user-select: none;
  }
  .akinav>.brand {
    height: 45px;
    padding-left:15px;
    display:flex;
    align-items:center;
    flex: 1 0 auto;
    font-weight: bold;
    font-family: Tahoma, sans-serif;
    background:#333;
    background: linear-gradient(90deg,
      #333 20%,
      #fff0 50%,
      #333 80%
      );
  }
  .akinav>.menu {
    background-color: #333;
    display: inline-flex;
    align-items: center;
    height: 45px;
  }
  .akinav>.menu>.item {
    margin: 0 2px;
    padding: 5px;
    text-align: center;
  }
  #panel-acc-uname {
    color: #3daadc;
    font-weight: bold;
  }
  #panel-acc-balance {
    color: orange;
  }
  #panel-prize-now {
    color: yellow;
  }
  .btn {
    background-color: #7ac;
    padding: 5px;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    border: none;
  }
  .bold{font-weight: bold;}
  .show {
    display: block !important;
    right: 0 !important;
  }
  .akiinfo {
    z-index: 999;
    display: flex;
    justify-content: space-around;
    position: fixed;
    padding: 5px;
    font-size:0.7rem;
    top: 45px;
    left: 0;
    right: 0;
    background-color: #eee;
  }
  .akiinfo > div {
    background-color: #e0e0e0;
    padding: 3px 6px;
    border-radius: 5px;
  }
`;
var akiPanel =/*html*/`
  <nav class=akinav>
    <div class="brand">AkiAuto</div>
    <div class="menu">
      <div class="item">
        <button id="AkiReload" class="btn" onclick="menu.NimoHomepage()">
          Nimo  
        <i class="fa-solid fa-up-right-from-square"></i>
        </button>
      </div>
      <div class="item">
        <button id="AkiAutoRunBtn" class="btn" onclick="menu.RUN()" style="background-color: red">RUN</button>
      </div>
      <div class="item">P:
        <span id=panel-prize-now>...</span>
      </div>
      <div class="item">B:
        <span id=panel-acc-balance>...</span>
      </div>
      <div class="item inline-flex">
        <span id=panel-acc-uname>Not Login</span>
        <img id=panel-acc-avt width="35" height="35" style="margin: 0 4px;">
      </div>
    </div>
  </nav>
  <div class="akiinfo">
    <div>
      <span>Clicked:</span>
      <span id="counterSPIN" class="bold">0</span>
      <br>
      <span>AutoClicked:</span>
      <span id="counterAUTO" class="bold">0</span>
    </div>
    <div>
      <span>Max Priz:</span>
      <span id="info-max-p" class="bold">...</span>
      <br>
      <span>Max Win:</span>
      <span id="info-max-w" class="bold">...</span>
    </div>
    <div>
      <span>Stop when:</span><br>
      <input id="targetPrizeStop" class="bold" type=number style=width:75px>
      <button onclick="menu.setTargetPercent()" class="btn" style="margin:2px">Set 70%</button>
    </div>
  </div>
`;
//////////////////// END HTML ////////////////////

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
menu = class {
  static getBean() { return getNimoNum(0) }
  static getPrize() { return getNimoNum(1) }
  static getBet() { return getNimoNum(2) }
  static getUserName() {
    if (document.cookie.includes('userName')) {
      AkiAccUname.innerHTML = parseCookie()['userName'] || "Not Login";
      AkiAccAvt.src = parseCookie()['avatarUrl'] || null;
    }
  }
  static UpdatePrize() {
    document.getElementById('panel-prize-now').innerHTML = menu.getPrize();
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
  static increSpinCount() {
    localStorage['cSpin'] = parseInt(localStorage['cSpin']) + 1;
    menu.updateSpinCount();
  }
  static NimoHomepage() {
    let options = "menubar=no,scrollbars=yes,location=no,toolbar=no";
    return window.open('/', '_blank', 'width=1260,height=640' + options);
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
  static add() {
    let e;
    // Aki Panel HTML:
    e = document.querySelector('div.akipanel');
    e ? e.remove() : console.log('Init AkiPanel...');;
    let panel = document.createElement('div');
    panel.innerHTML = akiPanel;
    panel.classList.add('akipanel');
    document.body.appendChild(panel);
    // Aki Panel CSS:
    let panelCss = document.createElement('style');
    panelCss.innerHTML = akiPanelCss;
    panelCss.setAttribute('name', "AkiPanelCss");
    e = document.querySelector('style[name=AkiPanelCss]');
    e ? e.remove() : console.log('Init AkiPanel Css...');
    document.head.appendChild(panelCss);
    // Fontawesome:
    let Fontawesome = document.createElement('link');
    Fontawesome.setAttribute('name', 'fontawesome');
    Fontawesome.type = 'text/css';
    Fontawesome.rel = 'stylesheet';
    Fontawesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css';
    e = document.querySelector('link[name=fontawesome]');
    e ? e.remove() : console.log('Init FontAwesome...');
    document.head.appendChild(Fontawesome);
  }
  static init() {
    // init variable:
    AkiAutoRunBtn = document.getElementById('AkiAutoRunBtn');
    AkiAccUname = document.getElementById('panel-acc-uname');
    AkiAccAvt = document.getElementById('panel-acc-avt');
    nimoBtnSpin = document.querySelector('.control-area__bet-btn');
    nimoNumWin = document.querySelector('.control-area__win-num');
    nimoWalledD = document.querySelector('.nimo-wallet .c5').innerHTML;
    nimoWalledB = document.querySelector('.nimo-wallet .c7').innerHTML;
    (localStorage['cSpin']) ? menu.updateSpinCount() : localStorage['cSpin'] = 0;
    (localStorage['cAuto']) ? menu.updateAutoSpinCount() : localStorage['cAuto'] = 0;
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
  aki.add();
})

addEventListener('load', () => {
  aki.init();
  nimoBtnSpin.addEventListener('click', menu.increSpinCount, false);
  console.log('AkiAuto-Nimo-Jackpot ---- Author: ' + AkiSriptAuthor);
})
