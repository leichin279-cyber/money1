/* ── PWA 설치 로직 ── */
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isStandalone = window.navigator.standalone === true
  || window.matchMedia('(display-mode: standalone)').matches;

/* 이미 설치된 상태면 버튼 숨김 */
if (isStandalone) {
  installBtn.style.display = 'none';
}

/* Android/Chrome/Edge: 브라우저가 설치 가능 판단 시 */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  /* 자동으로 설치 배너 띄우기 */
  setTimeout(() => {
    if (deferredPrompt) showInstallBanner();
  }, 2000);
});

/* 설치 배너 자동 표시 */
function showInstallBanner() {
  if (isStandalone) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(result => {
    if (result.outcome === 'accepted') installBtn.style.display = 'none';
    deferredPrompt = null;
  });
}

/* 설치 버튼 클릭 */
function installApp() {
  if (isStandalone) return;

  if (deferredPrompt) {
    /* Chrome/Edge/Android: 설치 팝업 */
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') installBtn.style.display = 'none';
      deferredPrompt = null;
    });
  } else if (isIos) {
    /* iOS: 방법 안내 모달 */
    document.getElementById('modalBody').innerHTML = `
      <p>Safari에서 아래 순서로 설치하세요.</p>
      <ol>
        <li>하단 가운데 <strong>공유 버튼</strong> 탭 (□↑ 아이콘)</li>
        <li>스크롤해서 <strong>홈 화면에 추가</strong> 탭</li>
        <li>오른쪽 상단 <strong>추가</strong> 탭</li>
      </ol>
      <p class="note">※ 반드시 Safari 브라우저에서 열어야 합니다.</p>
    `;
    document.getElementById('modalBg').style.display = 'flex';
  } else {
    /* 기타: 주소창 안내 모달 */
    document.getElementById('modalBody').innerHTML = `
      <p>브라우저 주소창 오른쪽의 설치 아이콘을 클릭하세요.</p>
      <ol>
        <li>주소창 오른쪽 끝 <strong>⊕ 아이콘</strong> 클릭</li>
        <li><strong>설치</strong> 클릭</li>
      </ol>
      <p class="note">※ Chrome 또는 Edge 브라우저를 사용하세요.</p>
    `;
    document.getElementById('modalBg').style.display = 'flex';
  }
}

function closeModal() {
  document.getElementById('modalBg').style.display = 'none';
}

/* 설치 완료 */
window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  deferredPrompt = null;
});

/* Service Worker: 캐시 없이 등록만 (PWA 설치 조건 충족용) */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
  navigator.serviceWorker.register('./sw.js');
}
