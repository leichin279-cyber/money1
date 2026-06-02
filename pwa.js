/* ── PWA 설치 로직 (Service Worker 없음) ── */

let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
const iosBanner  = document.getElementById('iosBanner');

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.navigator.standalone === true
  || window.matchMedia('(display-mode: standalone)').matches;

if (isStandalone) {
  /* 이미 설치된 앱으로 실행 중 → 버튼 숨김 */
  installBtn.style.display = 'none';
} else if (isIos) {
  /* iOS Safari → 배너 안내 */
  const dismissed = sessionStorage.getItem('ios_banner_dismissed');
  if (!dismissed) iosBanner.style.display = 'flex';
  iosBanner.querySelector('button').addEventListener('click', () => {
    sessionStorage.setItem('ios_banner_dismissed', '1');
    iosBanner.style.display = 'none';
  });
  installBtn.style.display = 'none';
} else {
  /* Android / Chrome / Edge → 버튼 항상 표시 */
  installBtn.style.display = 'flex';
}

/* 브라우저가 설치 준비됐을 때 */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'flex';
});

/* 설치 버튼 클릭 */
function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') installBtn.style.display = 'none';
      deferredPrompt = null;
    });
  } else {
    alert('설치 방법:\n\n📱 Android: 주소창 오른쪽 설치 아이콘(⊕) 클릭\n💻 PC: 주소창 오른쪽 설치 아이콘 클릭\n🍎 iPhone: 하단 공유 버튼 → 홈 화면에 추가');
  }
}

/* 설치 완료 */
window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  deferredPrompt = null;
});

/* Service Worker 완전 제거 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
}
