import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, isSupported } from 'firebase/messaging';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-jVj7-YUb07udtnwsxAkqa8RwWYuumsY",
  authDomain: "godfirsteducation-and-tours.firebaseapp.com",
  projectId: "godfirsteducation-and-tours",
  storageBucket: "godfirsteducation-and-tours.firebasestorage.app",
  messagingSenderId: "972138896496",
  appId: "1:972138896496:web:155fd40c52c40c698428b5",
  measurementId: "G-F00DCXKGD1"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get messaging instance (only in browser)
let messaging: Messaging | null = null;

// Helper function to get or initialize messaging
async function getMessagingInstance(): Promise<Messaging | null> {
  if (messaging) {
    return messaging;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase messaging is not supported in this browser');
      return null;
    }

    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
    return null;
  }
}

export { app, messaging };

/**
 * Request notification permission and get FCM token
 * This should be called after user login/signup
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    console.log('🔔 Starting notification permission request...');
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('❌ This browser does not support notifications');
      return null;
    }

    // Check if messaging is supported and get instance
    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      console.warn('❌ Firebase messaging is not supported or could not be initialized');
      return null;
    }

    console.log('✅ Firebase messaging initialized');

    // Request permission
    console.log('🔔 Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    console.log('🔔 Permission result:', permission);
    
    if (permission !== 'granted') {
      console.warn('❌ Notification permission denied');
      return null;
    }

    console.log('✅ Notification permission granted');

    // Get FCM token
    console.log('🔑 Requesting FCM token...');
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.error('❌ VAPID key is not configured');
      return null;
    }

    const token = await getToken(messagingInstance, {
      vapidKey: vapidKey,
    });
    
    if (token) {
      console.log('✅ FCM Token obtained successfully!');
      console.log('📱 FCM Token:', token);
    } else {
      console.error('❌ Failed to obtain FCM token');
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
}

/**
 * Listen for foreground messages (when app is open)
 */
export async function onMessageListener() {
  return new Promise(async (resolve) => {
    const messagingInstance = await getMessagingInstance();
    if (messagingInstance) {
      onMessage(messagingInstance, (payload) => {
        console.log('📨 Message received in foreground:', payload);
        resolve(payload);
      });
    } else {
      console.warn('❌ Cannot listen for messages: messaging not available');
    }
  });
}

/**
 * Get current FCM token without requesting permission
 * Useful for checking if token exists
 */
export async function getCurrentToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    if (Notification.permission !== 'granted') {
      console.log('ℹ️ Notification permission not granted');
      return null;
    }

    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      console.warn('❌ Firebase messaging is not available');
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('❌ VAPID key is not configured');
      return null;
    }

    const token = await getToken(messagingInstance, {
      vapidKey: vapidKey,
    });

    if (token) {
      console.log('✅ Current FCM token retrieved');
    }

    return token;
  } catch (error) {
    console.error('❌ Error getting current token:', error);
    return null;
  }
}
