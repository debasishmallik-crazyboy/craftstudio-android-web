const CACHE_NAME = 'river-studio-v2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/studio.css',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './apps/vectorcraft/',
  './apps/photocraft/',
  './apps/designcraft/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('River Studio ServiceWorker: Pre-caching core shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('River Studio ServiceWorker: Clearing legacy cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache WASM, JS, and font assets so tablet can run 100% standalone offline!
        const url = event.request.url;
        if (url.includes('.wasm') || url.includes('.js') || url.includes('.part-') || url.includes('.ttf') || url.includes('.txt')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // Fallback to cache if network fails (offline standalone mode)
        return caches.match(event.request);
      });
    })
  );
});
