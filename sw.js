const CACHE_NAME = 'craftstudio-v1.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/studio.css',
  './js/app.js',
  './js/engine/vector-engine.js',
  './js/engine/raster-engine.js',
  './js/engine/touch-controller.js',
  './js/engine/chatgpt-bridge.js',
  './js/engine/export-engine.js',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('CraftStudio ServiceWorker: Caching app assets for offline use');
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
            console.log('CraftStudio ServiceWorker: Removing old cache', key);
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
      return cachedResponse || fetch(event.request);
    })
  );
});
