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
  , NimoBtnSpin
  , NimoNumWin
  , NimoRollCol5
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
      NimoBtnSpin.click();
      localStorage['cAuto'] = parseInt(localStorage['cAuto']) + 1;
      menu.updateAutoSpinCount();
    }
    function check() {
      //////////////////////// AUTO RUN CONDITION HERE ////////////////////////
      let target = document.getElementById('targetPrizeStop').value;
      if (menu.getPrize() > target) {
        if (NimoBtnSpin.querySelector('.num-img')) {
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
    NimoBtnSpin = document.querySelector('.control-area__bet-btn');
    NimoNumWin = document.querySelector('.control-area__win-num');
    NimoRollCol5 = document.querySelector('.screen-area__animation-container.line-5');
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
  static hack() {
    //jackpot: x111; free: x101
    var Slot_Free = /*html*/`
     <div class="screen-area__icon-bg n-as-abs n-as-cc"></div><span class="nimo-image screen-area__icon icon-10 show">
     <picture>
      <img src="data:image/png;base64,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" alt="Nimo TV">
     </picture></span>
      <div class="screen-area__icon n-as-abs n-as-cc svga nimo-svga-gift" style="text-align: left;"><canvas width="165" height="165" style="background-color: transparent; transform: matrix(0.448485, 0, 0, 0.448485, -45.5, -45.5);"></canvas></div>
    `;
    console.log('hacking line: 1');
    document.querySelectorAll('.line-1 > div')[10].firstChild.id = "111";
    document.querySelectorAll('.line-1 > div')[10].firstChild.innerHTML = Slot_Free;
    for (let i = 1; i < 5; i++) {
      setTimeout(() => {
        console.log(`hacking line: ${i + 1}`);
        document.querySelectorAll(`.line-${i + 1} > div`)[10].firstChild.setAttribute('id', `${i}101`);
        document.querySelectorAll(`.line-${i + 1} > div`)[10].firstChild.innerHTML = Slot_Free;
      }, 900);
    }
  }
}
/////////////////// RUN ///////////////////

addEventListener('DOMContentLoaded', () => {
  aki.add();
})

addEventListener('load', () => {
  aki.init();
  NimoBtnSpin.addEventListener('click', menu.increSpinCount, false);
  console.log('AkiAuto-Nimo-Jackpot ---- Author: ' + AkiSriptAuthor);
})
