const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

// ⚠️ ضع إحداثيات المدرسة والمنزل هنا (من Google Maps)
const SCHOOL_LOCATION = { lat: 24.7136, lng: 46.6753 }; // مثال
const HOME_LOCATION = { lat: 24.7500, lng: 46.7000 };   // مثال
const RADIUS_METERS = 200; // نطاق 200 متر

// دالة حساب المسافة (صيغة Haversine)
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // نصف قطر الأرض بالمتر
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// دالة تحديد الحالة
function getLocationStatus(studentLat, studentLng) {
  if (!studentLat || !studentLng) return "unknown";

  const distToSchool = getDistanceFromLatLonInMeters(studentLat, studentLng, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
  const distToHome = getDistanceFromLatLonInMeters(studentLat, studentLng, HOME_LOCATION.lat, HOME_LOCATION.lng);

  if (distToSchool <= RADIUS_METERS) return "school";
  if (distToHome <= RADIUS_METERS) return "home";
  return "outside";
}

exports.sendParentNotification = onDocumentUpdated("presence/{studentId}", async (event) => {
  const eventId = event.id;
  const db = admin.firestore();
  
  // فحص التكرار
  const processedRef = db.collection('processedEvents').doc(eventId);
  const processedDoc = await processedRef.get();
  if (processedDoc.exists) return null;

  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  if (!afterData) return null;

  const wasOnline = beforeData ? beforeData.isOnline : false;
  const isNowOnline = afterData.isOnline;
  
  // تحديد حالة الموقع
  const location = afterData.location || {};
  const locationStatus = getLocationStatus(location.lat, location.lng);

  // تحديث حالة الموقع في Firestore (ليقرأها تطبيق ولي الأمر)
  await db.collection('presence').doc(event.params.studentId).set({
    locationStatus: locationStatus
  }, { merge: true });

  // إذا لم تتغير حالة الاتصال، لا نرسل إشعار
  if (wasOnline === isNowOnline) {
    return null;
  }

  const studentId = event.params.studentId;
  const parentDoc = await db.collection('parent_tokens').doc(studentId).get();
  if (!parentDoc.exists) return null;
  const fcmToken = parentDoc.data().fcmToken;
  if (!fcmToken) return null;

  let notificationBody = '';
  let locationText = '';

  // تحديد نص الموقع
  if (locationStatus === 'school') locationText = ' (في المدرسة)';
  else if (locationStatus === 'home') locationText = ' (في المنزل)';
  else if (locationStatus === 'outside') locationText = ' (خارج النطاق)';

  // إشعار الفتح / الإغلاق
  if (!wasOnline && isNowOnline) {
    notificationBody = `الطالب فتح التطبيق الآن! 🟢${locationText}`;
  } else if (wasOnline && !isNowOnline) {
    notificationBody = `الطالب أغلق التطبيق الآن! 🔴${locationText}`;
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
    
    await processedRef.set({ 
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      studentId: studentId
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
  return null;
});