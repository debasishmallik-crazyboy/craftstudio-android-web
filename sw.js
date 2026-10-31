const CACHE_NAME = 'river-studio-v3.5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/studio.css?v=2.5',
  './manifest.json',
  './assets/icons/favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('River Studio ServiceWorker: Pre-caching core shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('River Studio ServiceWorker: Purging legacy cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // 1. Navigation / HTML requests: NETWORK-FIRST!
  // Always fetch latest index.html from network so users immediately see new updates!
  if (request.mode === 'navigate' || url.endsWith('/') || url.includes('index.html')) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // 2. CSS & JS updates: Network-First
  if (url.includes('.css') || (url.includes('.js') && !url.includes('_bg.wasm'))) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // 3. Heavy immutable assets (.wasm, .ttf, .part-): CACHE-FIRST for blazing offline speed
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      });
    })
  );
});
