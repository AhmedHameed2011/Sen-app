import { db } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let unsubscribe = null;

document.getElementById('btnCheck').addEventListener('click', () => {
  const email = document.getElementById('parentEmail').value.trim().toLowerCase();
  if (!email) return alert('الرجاء إدخال البريد الإلكتروني.');
  
  // نستخدم البريد الإلكتروني كمعرّف فريد للطالب
  const studentId = email.replace(/[^a-zA-Z0-9]/g, '_');
  
  const statusCard = document.getElementById('status-card');
  const statusText = document.getElementById('statusText');
  const timeText = document.getElementById('timeText');
  
  statusCard.style.display = 'block';
  statusText.textContent = 'جاري التحقق...';
  
  // إلغاء أي اتصال سابق
  if (unsubscribe) unsubscribe();

  // الاستماع المباشر للتغييرات في Firestore
  const docRef = doc(db, "presence", studentId);
  unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.isOnline) {
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
  });
});