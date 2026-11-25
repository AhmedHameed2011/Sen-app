import { db } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let unsubscribe = null;

document.addEventListener('DOMContentLoaded', () => {
  const btnCheck = document.getElementById('btnCheck');
  const btnEnable = document.getElementById('btn-enable-notifications');
  
  // ==========================================
  // 1. زر متابعة حالة الطالب
  // ==========================================
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
      
      if (unsubscribe) unsubscribe();

      try {
        const docRef = doc(db, "presence", studentId);
        
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const lastSeenTime = new Date(data.lastSeen).getTime();
            const now = new Date().getTime();
            const diffInSeconds = (now - lastSeenTime) / 1000;
            
            // تحديد حالة الاتصال
            let isOnline = false;
            if (data.isOnline && diffInSeconds < 30) {
              isOnline = true;
            }

            // تحديد حالة الموقع
            let locationText = '';
            if (data.locationStatus === 'school') {
              locationText = ' | 🏫 في المدرسة';
            } else if (data.locationStatus === 'home') {
              locationText = ' | 🏠 في المنزل';
            } else if (data.locationStatus === 'outside') {
              locationText = ' | 🚶 خارج النطاق';
            }

            // تحديث واجهة المستخدم
            if (isOnline) {
              statusCard.className = 'status-online';
              statusText.innerHTML = `🟢 الطالب يستخدم التطبيق الآن${locationText}`;
              timeText.textContent = `آخر تحديث: ${new Date(data.lastSeen).toLocaleTimeString('ar-SA')}`;
            } else {
              statusCard.className = 'status-offline';
              statusText.innerHTML = `🔴 الطالب غير متصل${locationText}`;
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

  // ==========================================
  // 2. زر تفعيل الإشعارات
  // ==========================================
  if (btnEnable) {
    btnEnable.addEventListener('click', async () => {
      try {
        // التحقق من دعم المتصفح
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          alert('متصفحك لا يدعم الإشعارات. يرجى استخدام Chrome أو Edge أو Safari (مع إضافة التطبيق للشاشة الرئيسية).');
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // استيراد الدوال من firebase-config.js
          const { getToken, messaging } = await import('./firebase-config.js');
          
          // ⚠️ يجب أن يكون مفتاح VAPID موجوداً في firebase-config.js أو هنا
          const VAPID_KEY = "BIv8-VJ7jMy6uhHg-UsLfFDhymJo8Nc8Q4HWKtYfWZa9JVWAT-F5vuVLgrUBRG-G03hTMQsziBobrFvkLgs-7NU"; // استبدل هذا بمفتاحك الحقيقي

          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          
          if (token) {
            const email = document.getElementById('parentEmail').value.trim().toLowerCase();
            if (email) {
              const parentId = email.replace(/[^a-zA-Z0-9]/g, '_');
              // استيراد setDoc من Firestore
              const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
              
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
        alert('حدث خطأ أثناء تفعيل الإشعارات. تأكد من أن التطبيق مثبت على الشاشة الرئيسية (للآيفون).');
      }
    });
  }
});