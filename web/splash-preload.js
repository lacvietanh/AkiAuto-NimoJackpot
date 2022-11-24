function setHTML(id, text) {
  document.getElementById(id).innerHTML = text
}
function LoadingSplashScreen() {
  const info = document.querySelectorAll('#info div');
  ['chrome', 'node', 'electron'].forEach((c, i) => {
    info[i].innerHTML = `
      ${c}: ${process.versions[c]}  
    `;
  })
}

window.addEventListener('DOMContentLoaded', () => {
  LoadingSplashScreen();
  setHTML('appBrand', 'AkiAuto')
  setHTML('appName', "NimoJackpot") // need fix to app.getName()
  setHTML('appVersion', "2022.11.23") //need fix to app.getVersion()

})
