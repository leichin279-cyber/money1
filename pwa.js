/* ── PWA 설치 로직 ── */

let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
const iosBanner  = document.getElementById('iosBanner');

/* Android / Chrome / Edge */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'flex';
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') installBtn.style.display = 'none';
      deferredPrompt = null;
    });
  }
}

/* iOS Safari */
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.navigator.standalone === true;
const iosDismissed = sessionStorage.getItem('ios_banner_dismissed');
if (isIos && !isStandalone && !iosDismissed) {
  iosBanner.style.display = 'flex';
}
document.getElementById('iosBanner').querySelector('button').addEventListener('click', () => {
  sessionStorage.setItem('ios_banner_dismissed', '1');
  iosBanner.style.display = 'none';
});

/* 설치 완료 시 버튼 숨기기 */
window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  deferredPrompt = null;
});

/* Service Worker 등록 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW failed:', err));
  });
}
