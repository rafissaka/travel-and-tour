/**
 * Generate firebase-messaging-sw.js with environment variables at build time
 * This script runs during the build process to inject Firebase config into the service worker
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
  console.log('✅ Loaded environment variables from .env.local');
}

// Read environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate all required variables are present
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId') // measurementId is optional
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required Firebase environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n⚠️  Firebase service worker will not be generated.');
  console.error('   Add missing variables to .env.local or deployment platform.\n');
  process.exit(1);
}

// Service worker template
const serviceWorkerContent = `// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker with config from environment variables
// This file is auto-generated at build time by scripts/generate-firebase-sw.js
firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});

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
`;

// Write the service worker file to public directory
const outputPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');

try {
  fs.writeFileSync(outputPath, serviceWorkerContent, 'utf8');
  console.log('✅ Firebase service worker generated successfully!');
  console.log(`   Location: ${outputPath}`);
  console.log('   Firebase config injected from environment variables.');
} catch (error) {
  console.error('❌ Error writing service worker file:', error);
  process.exit(1);
}
