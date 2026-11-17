/* ------------------------------------------------------------------
   Parent Dashboard – Sanad Determination
   ---------------------------------------------------------------*/
(() => {
  // ---------------------------------------------------------------
  // 1️⃣  Firebase configuration (replace with your own project keys)
  // ---------------------------------------------------------------
  const firebaseConfig = {
  apiKey: "AIzaSyB-lni6b1OQbRtIJmUxJzy3j1tlILOm-Vc",
  authDomain: "sanad-determination-app.firebaseapp.com",
  projectId: "sanad-determination-app",
  storageBucket: "sanad-determination-app.firebasestorage.app",
  messagingSenderId: "762926889463",
  appId: "1:762926889463:web:1db2902b680ba2511856f2",
  
};

  // Initialise Firebase (compat SDK to keep the existing code style)
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // ---------------------------------------------------------------
  // 2️⃣  UI elements
  // ---------------------------------------------------------------
  const studentIdInput = document.getElementById("studentId");
  const parentIdInput   = document.getElementById("parentId");
  const registerBtn    = document.getElementById("registerBtn");
  const logDiv         = document.getElementById("log");

  const log = (msg) => {
    console.log(msg);
    logDiv.textContent += `${msg}\n`;
  };

  // ---------------------------------------------------------------
  // 3️⃣  Request notification permission & get FCM token
  // ---------------------------------------------------------------
  const requestPermission = async () => {
    try {
      await Notification.requestPermission();
      const token = await messaging.getToken({
        vapidKey: "BIv8-VJ7jMy6uhHg-UsLfFDhymJo8Nc8Q4HWKtYfWZa9JVWAT-F5vuVLgrUBRG-G03hTMQsziBobrFvkLgs-7NU",   // <-- replace with your VAPID key
      });
      log("✅ Notification permission granted.");
      return token;
    } catch (err) {
      log("⚠️ Permission/error getting token: " + err);
      return null;
    }
  };

  // ---------------------------------------------------------------
  // 4️⃣  Register token with backend
  // ---------------------------------------------------------------
  const registerToken = async (studentId, parentId, token) => {
    try {
      const resp = await fetch("/api/register-parent-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, parentId, token }),
      });
      const data = await resp.json();
      if (resp.ok) {
        log("✅ Token registered on server.");
      } else {
        log("⚠️ Server error: " + (data.error || "unknown"));
      }
    } catch (e) {
      log("⚠️ Network error: " + e);
    }
  };

  // ---------------------------------------------------------------
  // 5️⃣  Button click – combine everything
  // ---------------------------------------------------------------
  registerBtn.addEventListener("click", async () => {
    const studentId = studentIdInput.value.trim();
    const parentId   = parentIdInput.value.trim();

    if (!studentId || !parentId) {
      log("⚠️ Both fields are required.");
      return;
    }

    const token = await requestPermission();
    if (token) {
      await registerToken(studentId, parentId, token);
    }
  });

  // ---------------------------------------------------------------
  // 6️⃣  Background message handler (will run when page is closed)
  // ---------------------------------------------------------------
  messaging.onMessage((payload) => {
    // This runs when the page is in focus.
    log("🔔 Foreground notification received:");
    log(JSON.stringify(payload, null, 2));
  });
})();