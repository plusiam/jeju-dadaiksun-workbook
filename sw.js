// Service Worker for 다다익선 제주 현장학습
const CACHE_NAME = 'jeju-workbook-v1';
const urlsToCache = [
  '/jeju-dadaiksun-workbook/',
  '/jeju-dadaiksun-workbook/index.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// 설치 이벤트 - 캐시 생성
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 열기 완료');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('캐시 추가 실패:', error);
      })
  );
  // 즉시 활성화
  self.skipWaiting();
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 즉시 클라이언트 제어
  self.clients.claim();
});

// fetch 이벤트 - 네트워크 우선, 실패시 캐시
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 응답이 유효한 경우 캐시에 저장하고 반환
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // 네트워크 실패시 캐시에서 찾기
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // 오프라인 페이지 반환 (선택사항)
            if (event.request.mode === 'navigate') {
              return caches.match('/jeju-dadaiksun-workbook/index.html');
            }
          });
      })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workbook-data') {
    event.waitUntil(syncWorkbookData());
  }
});

async function syncWorkbookData() {
  // 나중에 구현할 수 있는 동기화 로직
  console.log('워크북 데이터 동기화');
}

// 푸시 알림 (선택사항)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '제주 현장학습 알림',
    icon: '/jeju-dadaiksun-workbook/icon-192.png',
    badge: '/jeju-dadaiksun-workbook/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('다다익선 제주 현장학습', options)
  );
});