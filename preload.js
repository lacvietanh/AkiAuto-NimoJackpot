const appBrand = "AkiAuto"
const { contextBridge, app } = require('electron')

function setHTML(id, text) {
  document.getElementById(id).innerHTML = text
}
function LoadingSplashScreen() {
  console.log(app.getGPUInfo())
  setHTML('appBrand', appBrand)
  setHTML('appName', app.getName())
  setHTML('appVersion', app.getVersion())

  const info = document.querySelectorAll('#info div');
  ['chrome', 'node', 'electron'].forEach((c, i) => {
    info[i].innerHTML = `
      ${c}: ${process.versions[c]}  
    `;
  })
}

window.addEventListener('DOMContentLoaded', () => {
  LoadingSplashScreen();

})
