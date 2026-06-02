/* SW: 캐시 없음 — 항상 네트워크에서 최신 파일 로드 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
/* fetch 핸들러 없음 = 캐시 안 함 */
