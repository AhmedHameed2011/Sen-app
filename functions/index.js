const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendParentNotification = onDocumentUpdated("presence/{studentId}", async (event) => {
  const eventId = event.id;
  const db = admin.firestore();
  
  // 🔍 فحص التكرار لمنع الإشعارات المكررة لنفس الحدث
  const processedRef = db.collection('processedEvents').doc(eventId);
  const processedDoc = await processedRef.get();
  if (processedDoc.exists) {
    return null; // تجاهل الحدث المكرر
  }

  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  if (!afterData) return null;

  const wasOnline = beforeData ? beforeData.isOnline : false;
  const isNowOnline = afterData.isOnline;

  // 🛑 تجاهل إذا لم تتغير الحالة (نبضات القلب)
  if (wasOnline === isNowOnline) {
    return null;
  }

  const studentId = event.params.studentId;
  
  // 🔍 التحقق من وجود ولي أمر مرتبط فعلاً
  const parentDoc = await db.collection('parent_tokens').doc(studentId).get();
  if (!parentDoc.exists) {
    console.log('No parent linked for student:', studentId);
    return null; // لا يوجد ولي أمر مرتبط، لا ترسل إشعاراً
  }

  const fcmToken = parentDoc.data().fcmToken;
  if (!fcmToken) return null;

  let notificationBody = '';
  if (!wasOnline && isNowOnline) {
    notificationBody = 'الطالب فتح التطبيق الآن! 🟢';
  } else if (wasOnline && !isNowOnline) {
    notificationBody = 'الطالب أغلق التطبيق الآن! 🔴';
  } else {
    return null;
  }

  const payload = {
    notification: {
      title: 'سند | تنبيه النشاط',
      body: notificationBody,
    },
    token: fcmToken
  };

  try {
    await admin.messaging().send(payload);
    console.log(`Notification sent: ${notificationBody}`);
    
    // ✅ تسجيل الحدث كـ "تمت معالجته"
    await processedRef.set({ 
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      studentId: studentId
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
  return null;
});