// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker with your config
firebase.initializeApp({
  apiKey: "AIzaSyB-jVj7-YUb07udtnwsxAkqa8RwWYuumsY",
  authDomain: "godfirsteducation-and-tours.firebaseapp.com",
  projectId: "godfirsteducation-and-tours",
  storageBucket: "godfirsteducation-and-tours.firebasestorage.app",
  messagingSenderId: "972138896496",
  appId: "1:972138896496:web:155fd40c52c40c698428b5",
  measurementId: "G-F00DCXKGD1"
});

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages (when app is in background or closed)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Customize notification
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.notificationId || payload.data?.type || 'notification',
    data: {
      ...payload.data,
      url: payload.data?.actionUrl || payload.fcmOptions?.link || '/profile/notifications'
    },
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  // Don't do anything if user clicked 'close'
  if (event.action === 'close') {
    return;
  }

  // Get URL to open
  const urlToOpen = event.notification.data?.url || '/profile/notifications';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open with this URL
        for (const client of clientList) {
          if (client.url === fullUrl && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// Handle push events (alternative to onBackgroundMessage)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[firebase-messaging-sw.js] Push data:', payload);
      
      // Extract notification data
      const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.notificationId || payload.data?.type || 'notification',
        data: {
          ...payload.data,
          url: payload.data?.actionUrl || payload.fcmOptions?.link || '/profile/notifications'
        },
        requireInteraction: false,
        vibrate: [200, 100, 200],
        actions: [
          {
            action: 'open',
            title: 'Open'
          },
          {
            action: 'close',
            title: 'Dismiss'
          }
        ]
      };
      
      console.log('[firebase-messaging-sw.js] Attempting to show notification:', notificationTitle, notificationOptions);
      
      // Show notification using the push event
      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
          .then(() => {
            console.log('[firebase-messaging-sw.js] ✅ Notification displayed successfully!');
          })
          .catch((error) => {
            console.error('[firebase-messaging-sw.js] ❌ Error showing notification:', error);
          })
      );
      
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', error);
    }
  }
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting();
});
