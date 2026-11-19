import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-lni6b1OQbRtIJmUxJzy3j1tlILOm-Vc",
  authDomain: "sanad-determination-app.firebaseapp.com",
  projectId: "sanad-determination-app",
  storageBucket: "sanad-determination-app.firebasestorage.app",
  messagingSenderId: "762926889463",
  appId: "1:762926889463:web:1db2902b680ba2511856f2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const messaging = getMessaging(app);
export { getToken, onMessage };