/* ── PWA 설치 로직 ── */

let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
const iosBanner  = document.getElementById('iosBanner');

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.navigator.standalone === true
  || window.matchMedia('(display-mode: standalone)').matches;

/* 이미 설치된 앱이면 버튼 숨김 */
if (isStandalone) {
  installBtn.style.display = 'none';
} else if (isIos) {
  /* iOS: 배너 안내 */
  const dismissed = sessionStorage.getItem('ios_banner_dismissed');
  if (!dismissed) iosBanner.style.display = 'flex';
  iosBanner.querySelector('button').addEventListener('click', () => {
    sessionStorage.setItem('ios_banner_dismissed', '1');
    iosBanner.style.display = 'none';
  });
  installBtn.style.display = 'none'; /* iOS는 버튼 숨기고 배너로 안내 */
} else {
  /* Android / Chrome / Edge: 일단 버튼 보여두기 */
  installBtn.style.display = 'flex';
}

/* beforeinstallprompt: 설치 팝업 준비됐을 때 */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'flex';
});

/* 설치 버튼 클릭 */
function installApp() {
  if (deferredPrompt) {
    /* 브라우저 설치 팝업 */
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') installBtn.style.display = 'none';
      deferredPrompt = null;
    });
  } else {
    /* 팝업 준비 안 됐을 때 안내 */
    alert('설치하려면:\n\n① 주소창 오른쪽 설치 아이콘(⊕)을 클릭하거나\n② 브라우저 메뉴 → "앱 설치" 또는 "홈 화면에 추가"를 선택하세요.');
  }
}

/* 설치 완료 */
window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  deferredPrompt = null;
});

/* Service Worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW:', reg.scope))
      .catch(err => console.warn('SW 실패:', err));
  });
}
