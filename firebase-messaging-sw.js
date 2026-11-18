// هذا الملف يعمل كـ Service Worker لاستقبال إشعارات Firebase
// يمكنك تركه فارغاً في البداية، أو إضافة كود الاستماع للإشعارات لاحقاً

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// يجب أن تضع هنا نفس إعدادات firebaseConfig الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyB-lni6b1OQbRtIJmUxJzy3j1tlILOm-Vc",
  authDomain: "sanad-determination-app.firebaseapp.com",
  projectId: "sanad-determination-app",
  storageBucket: "sanad-determination-app.firebasestorage.app",
  messagingSenderId: "762926889463",
  appId: "1:762926889463:web:1db2902b680ba2511856f2",
 };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});