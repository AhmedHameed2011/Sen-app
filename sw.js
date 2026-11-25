const CACHE_NAME = 'sanad-v6-realtime';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/i18n.js',
  './js/privacy.js',
  './js/speech.js',
  './js/school.js',
  './js/life.js',
  './js/aac.js',
  './js/calm.js',
  './js/safecard.js',
  './js/auditor.js',
  './js/app.js',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

// 1. تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE); // ✅ تم تصحيح الاسم هنا
    })
  );
});

// 2. تفعيل الـ Service Worker وحذف الكاش القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
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

// 3. استراتيجية الجلب (Network First)
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

// ==========================================
// 4. استقبال إشعارات Firebase (ضروري للآيفون)
// ==========================================
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// ⚠️ يجب أن تضع إعدادات Firebase الخاصة بك هنا (نفس الإعدادات الموجودة في firebase-config.js)
const firebaseConfig = {
  apiKey: "AIzaSyB-lni6b1OQbRtIJmUxJzy3j1tlILOm-Vc",
  authDomain: "sanad-determination-app.firebaseapp.com",
  projectId: "sanad-determination-app",
  storageBucket: "sanad-determination-app.firebasestorage.app",
  messagingSenderId: "762926889463",
  appId: "1:762926889463:web:1db2902b680ba2511856f2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية (عندما يكون التطبيق مغلقاً أو في الخلفية)
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'سند | تنبيه النشاط';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك تحديث جديد',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    // إضافة بيانات إضافية إذا لزم الأمر
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// استقبال الأحداث من المتصفح (خاصة للآيفون)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.notification?.title || 'سند';
    const options = {
      body: data.notification?.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// عند النقر على الإشعار، افتح التطبيق
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});