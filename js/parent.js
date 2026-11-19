import { db, messaging, getToken, onMessage } from './firebase-config.js';
import { doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ ضع مفتاح VAPID هنا (من Firebase Console -> Cloud Messaging)
const VAPID_KEY = "BIv8-VJ7jMy6uhHg-UsLfFDhymJo8Nc8Q4HWKtYfWZa9JVWAT-F5vuVLgrUBRG-G03hTMQsziBobrFvkLgs-7NU";

document.addEventListener('DOMContentLoaded', () => {
  const btnCheck = document.getElementById('btnCheck');
  const btnEnable = document.getElementById('btn-enable-notifications');
  
  if (btnCheck) {
    btnCheck.addEventListener('click', () => {
      const email = document.getElementById('parentEmail').value.trim().toLowerCase();
      if (!email) return alert('الرجاء إدخال البريد الإلكتروني.');
      
      const studentId = email.replace(/[^a-zA-Z0-9]/g, '_');
      
      const statusCard = document.getElementById('status-card');
      const statusText = document.getElementById('statusText');
      const timeText = document.getElementById('timeText');
      
      statusCard.style.display = 'block';
      statusText.textContent = 'جاري التحقق...';
      
      if (window.unsubscribe) window.unsubscribe();

      try {
        const docRef = doc(db, "presence", studentId);
        
        window.unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const lastSeenTime = new Date(data.lastSeen).getTime();
            const now = new Date().getTime();
            const diffInSeconds = (now - lastSeenTime) / 1000;
            
            if (data.isOnline && diffInSeconds < 30) {
              statusCard.className = 'status-online';
              statusText.innerHTML = '🟢 الطالب يستخدم التطبيق الآن';
              timeText.textContent = `آخر تحديث: ${new Date(data.lastSeen).toLocaleTimeString('ar-SA')}`;
            } else {
              statusCard.className = 'status-offline';
              statusText.innerHTML = '🔴 الطالب غير متصل';
              timeText.textContent = `آخر ظهور: ${new Date(data.lastSeen).toLocaleString('ar-SA')}`;
            }
          } else {
            statusCard.className = '';
            statusText.innerHTML = 'لم يتم العثور على بيانات.';
            timeText.textContent = 'تأكد من أن ابنك أدخل هذا البريد في تطبيقه.';
          }
        }, (error) => {
          console.error("Firebase error:", error);
          statusText.innerHTML = '⚠️ خطأ في الاتصال بقاعدة البيانات.';
        });
      } catch (error) {
        console.error("Setup error:", error);
        statusText.innerHTML = '⚠️ حدث خطأ غير متوقع.';
      }
    });
  }

  // تفعيل الإشعارات
  if (btnEnable) {
    btnEnable.addEventListener('click', async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) {
            const email = document.getElementById('parentEmail').value.trim().toLowerCase();
            if (email) {
              const parentId = email.replace(/[^a-zA-Z0-9]/g, '_');
              await setDoc(doc(db, "parent_tokens", parentId), {
                fcmToken: token,
                updatedAt: new Date().toISOString()
              }, { merge: true });
              alert('✅ تم تفعيل الإشعارات بنجاح!');
            } else {
              alert('الرجاء إدخال البريد الإلكتروني أولاً.');
            }
          }
        } else {
          alert('❌ لم يتم السماح بالإشعارات. يرجى تفعيلها من إعدادات المتصفح.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء تفعيل الإشعارات.');
      }
    });
  }
});

// استقبال الإشعارات عندما يكون التطبيق مفتوحاً
onMessage(messaging, (payload) => {
  console.log('Message received: ', payload);
  alert(`${payload.notification.title}: ${payload.notification.body}`);
});