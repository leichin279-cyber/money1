/* ── PWA 설치 로직 ── */

let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
const iosBanner  = document.getElementById('iosBanner');

/* 1) Android / Chrome / Edge: beforeinstallprompt 이벤트 */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'flex'; // 설치 버튼 표시
});

/* 설치 버튼 클릭 */
function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      deferredPrompt = null;
    });
  }
}

/* 2) iOS Safari: beforeinstallprompt 없음 → 직접 배너 표시 */
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandalone = window.navigator.standalone === true;
const iosDismissed = sessionStorage.getItem('ios_banner_dismissed');

if (isIos && !isInStandalone && !iosDismissed) {
  iosBanner.style.display = 'flex';
}
document.getElementById('iosBanner').querySelector('button').addEventListener('click', () => {
  sessionStorage.setItem('ios_banner_dismissed', '1');
});

/* 3) 이미 설치된 경우 버튼 숨기기 */
window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  deferredPrompt = null;
});

/* 4) Service Worker 등록 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW failed:', err));
  });
}
