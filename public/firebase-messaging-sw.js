/* eslint-disable no-undef */
// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ---- Firebase config – same as in parent.js (must match) ----
const firebaseConfig = {
  apiKey: "AIzaSyB-lni6b1OQbRtIJmUxJzy3j1tlILOm-Vc",
  authDomain: "sanad-determination-app.firebaseapp.com",
  projectId: "sanad-determination-app",
  storageBucket: "sanad-determination-app.firebasestorage.app",
  messagingSenderId: "762926889463",
  appId: "1:762926889463:web:1db2902b680ba2511856f2",
  
};

const messaging = firebase.messaging();

// Show notification when a message arrives while the page is closed.
messaging.onBackgroundMessage((payload) => {
  const { title = "Student Activity", body = "Your child is active", icon } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: icon || "/icon.png",
    tag: "student-presence",
  });
});