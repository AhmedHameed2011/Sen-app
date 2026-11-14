const CACHE_NAME = 'sanad-v4-realtime';

const ASSETS_TO_PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/i18n.js',
  './js/speech.js',
  './js/school.js',
  './js/life.js',
  './js/aac.js',
  './js/calm.js',
  './js/safecard.js',
  './js/auditor.js',
  './js/app.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_PRECACHE);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        // Delete ALL older caches to prevent stale UI
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Cleaning old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-First for HTML & Navigation, Stale-while-revalidate for assets
self.addEventListener('fetch', (e) => {
  const isNavigate = (e.request.mode === 'navigate' || e.request.destination === 'document');

  if (isNavigate) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(e.request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Network First for scripts and styles to ensure latest code
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
