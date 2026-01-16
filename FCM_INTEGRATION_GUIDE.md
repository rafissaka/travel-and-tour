# Firebase Cloud Messaging (FCM) Integration Guide

This guide provides step-by-step instructions for integrating Firebase Cloud Messaging (FCM) into your Godfirst Education and Tours application to enable push notifications.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Install Dependencies](#install-dependencies)
4. [Firebase Configuration](#firebase-configuration)
5. [Service Worker Setup](#service-worker-setup)
6. [Web App Manifest](#web-app-manifest)
7. [FCM Client Integration](#fcm-client-integration)
8. [Backend Integration](#backend-integration)
9. [Testing Push Notifications](#testing-push-notifications)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier is sufficient)
- HTTPS enabled (required for service workers and push notifications)
- Existing notification system (already implemented in this project)

---

## 1. Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select existing project
3. Enter project name: `godfirst-education-tours`
4. Disable Google Analytics (optional, can enable later)
5. Click **"Create project"**

### Step 2: Register Web App

1. In Firebase Console, click the **Web icon** (`</>`)
2. Register your app:
   - **App nickname**: `Godfirst Web App`
   - Check **"Also set up Firebase Hosting"** (optional)
3. Click **"Register app"**

### Step 3: Get Firebase Config

1. Copy the Firebase configuration object shown:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

2. **Save this configuration** - you'll need it later

### Step 4: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Cloud Messaging** tab
3. Under **Web configuration**, find your **Web Push certificates**
4. If no key exists, click **"Generate key pair"**
5. **Copy the VAPID key** (also called Web Push certificate key)
   - Example: `BKxT-1234567890abcdefghijklmnop...`

---

## 2. Install Dependencies

Install Firebase SDK in your project:

```bash
bun add firebase
# or
npm install firebase
```

---

## 3. Firebase Configuration

### Create Firebase Config File

Create `lib/firebase.ts`:

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get messaging instance (only in browser)
let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export { app, messaging };

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get FCM token
    if (messaging) {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      
      console.log('FCM Token:', token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

// Listen for foreground messages
export function onMessageListener() {
  return new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        resolve(payload);
      });
    }
  });
}
```

### Add Environment Variables

Add to `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Firebase Admin SDK (for backend)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

**Important**: Never commit `.env.local` to version control!

---

## 4. Service Worker Setup

Service workers run in the background and handle push notifications when the app is closed.

### Create `public/firebase-messaging-sw.js`

```javascript
// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
});

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.notificationId || 'default',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app or navigate to specific URL
    const urlToOpen = event.notification.data?.actionUrl || '/profile/notifications';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});
```

**Note**: Replace the Firebase config in the service worker with your actual values. You cannot use environment variables in service workers, so you'll need to hardcode the config or generate the file dynamically.

---

## 5. Web App Manifest

Create or update `public/manifest.json`:

```json
{
  "name": "Godfirst Education and Tours",
  "short_name": "Godfirst",
  "description": "Travel, Education, and Tours Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "gcm_sender_id": "103953800507"
}
```

**Note**: The `gcm_sender_id` value `103953800507` is a standard value for Firebase and should remain unchanged.

### Update `app/layout.tsx`

Add manifest link to your root layout:

```tsx
<head>
  {/* Existing head content */}
  <link rel="manifest" href="/manifest.json" />
</head>
```

---

## 6. FCM Client Integration

### Create FCM Hook

Create `hooks/useFCM.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { toast } from 'sonner';

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for foreground messages
    onMessageListener()
      .then((payload: any) => {
        console.log('Received foreground message:', payload);
        
        // Show toast notification
        toast.success(payload.notification?.title || 'New Notification', {
          description: payload.notification?.body,
          action: payload.data?.actionUrl ? {
            label: 'View',
            onClick: () => window.location.href = payload.data.actionUrl,
          } : undefined,
        });
      })
      .catch((error) => console.error('Error listening for messages:', error));
  }, []);

  const requestPermission = async () => {
    const fcmToken = await requestNotificationPermission();
    
    if (fcmToken) {
      setToken(fcmToken);
      setNotificationPermission('granted');
      
      // Save token to backend
      await saveTokenToBackend(fcmToken);
      
      toast.success('Notifications enabled!');
      return fcmToken;
    } else {
      toast.error('Could not enable notifications');
      return null;
    }
  };

  const saveTokenToBackend = async (fcmToken: string) => {
    try {
      const response = await fetch('/api/device-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fcmToken,
          deviceType: 'WEB',
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save token');
      }

      console.log('FCM token saved to backend');
    } catch (error) {
      console.error('Error saving token to backend:', error);
    }
  };

  return {
    token,
    notificationPermission,
    requestPermission,
  };
}
```

### Create Device Token API

Create `app/api/device-tokens/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Save device token
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, deviceType, userAgent } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Check if token already exists
    const existingToken = await prisma.deviceToken.findFirst({
      where: {
        userId: user.id,
        token,
      },
    });

    if (existingToken) {
      // Update existing token
      const updatedToken = await prisma.deviceToken.update({
        where: { id: existingToken.id },
        data: {
          isActive: true,
          userAgent,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json(updatedToken);
    }

    // Create new token
    const deviceToken = await prisma.deviceToken.create({
      data: {
        userId: user.id,
        token,
        deviceType,
        userAgent,
        isActive: true,
      },
    });

    return NextResponse.json(deviceToken, { status: 201 });
  } catch (error) {
    console.error('Error saving device token:', error);
    return NextResponse.json(
      { error: 'Failed to save device token' },
      { status: 500 }
    );
  }
}

// DELETE - Remove device token
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    await prisma.deviceToken.deleteMany({
      where: {
        userId: user.id,
        token,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting device token:', error);
    return NextResponse.json(
      { error: 'Failed to delete device token' },
      { status: 500 }
    );
  }
}
```

### Integrate into Notification Bell

Update `app/components/NotificationBell.tsx`:

```tsx
import { useFCM } from '@/hooks/useFCM';

export default function NotificationBell() {
  const { notificationPermission, requestPermission } = useFCM();
  // ... existing code

  // Add a button to request permission if not granted
  {notificationPermission === 'default' && (
    <button
      onClick={requestPermission}
      className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg"
    >
      Enable Push Notifications
    </button>
  )}
}
```

---

## 7. Backend Integration

### Install Firebase Admin SDK

```bash
bun add firebase-admin
# or
npm install firebase-admin
```

### Create Firebase Admin Config

Create `lib/firebase-admin.ts`:

```typescript
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const messaging = admin.messaging();

// Send push notification to a user
export async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    actionUrl?: string;
    data?: Record<string, string>;
  }
) {
  try {
    // Get user's device tokens
    const deviceTokens = await prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: { token: true, id: true },
    });

    if (deviceTokens.length === 0) {
      console.log(`No active device tokens for user ${userId}`);
      return;
    }

    const tokens = deviceTokens.map((dt) => dt.token);

    // Send notification
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        actionUrl: notification.actionUrl || '',
        ...notification.data,
      },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log(`Successfully sent ${response.successCount} notifications`);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      // Deactivate failed tokens
      if (failedTokens.length > 0) {
        await prisma.deviceToken.updateMany({
          where: {
            token: { in: failedTokens },
          },
          data: { isActive: false },
        });
      }
    }

    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}
```

### Update Notification Helper Functions

Update `lib/notifications.ts` to send push notifications:

```typescript
import { sendPushNotification } from './firebase-admin';

export async function createNotification(params: CreateNotificationParams) {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        metadata: params.metadata || {},
      },
    });

    // Send push notification
    await sendPushNotification(params.userId, {
      title: params.title,
      body: params.message,
      actionUrl: params.actionUrl,
      data: {
        notificationId: notification.id,
        type: params.type,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}
```

### Get Firebase Admin Private Key

1. Go to Firebase Console
2. **Project Settings** > **Service Accounts**
3. Click **"Generate new private key"**
4. Download the JSON file
5. Extract values:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

---

## 8. Testing Push Notifications

### Test 1: Test from Firebase Console

1. Go to Firebase Console > **Cloud Messaging**
2. Click **"Send your first message"**
3. Enter notification title and text
4. Click **"Send test message"**
5. Enter your FCM token (get from browser console)
6. Click **"Test"**

### Test 2: Test from Your App

Create a test endpoint `app/api/test-notification/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { notifySystemAlert } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await notifySystemAlert(
      user.id,
      'Test Notification',
      'This is a test push notification from your app!',
      '/profile/notifications'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
```

Test by making a POST request to `/api/test-notification`.

---

## 9. Troubleshooting

### Issue: Service Worker Not Registering

**Solution**:
- Ensure your app is served over HTTPS (required for service workers)
- Check browser console for errors
- Verify `firebase-messaging-sw.js` is in the `public` folder
- Clear service worker cache: Chrome DevTools > Application > Service Workers > Unregister

### Issue: No Push Notifications Received

**Checklist**:
1. ✅ Notification permission granted in browser
2. ✅ FCM token saved to database
3. ✅ Firebase config correct (both client and service worker)
4. ✅ VAPID key correct
5. ✅ Device token marked as active in database
6. ✅ No errors in browser console or server logs

### Issue: "Messaging: We are unable to register the default service worker"

**Solution**:
- Ensure service worker file path is correct: `/firebase-messaging-sw.js`
- Check that the service worker scope is correct
- Try clearing cache and reloading

### Issue: Notifications Work in Foreground but Not Background

**Solution**:
- Verify `firebase-messaging-sw.js` is properly configured
- Check that `onBackgroundMessage` handler is set up
- Ensure notification payload has correct structure
- Test with browser closed or minimized

### Issue: "Firebase: Error (auth/invalid-api-key)"

**Solution**:
- Double-check all Firebase environment variables
- Ensure `.env.local` is loaded (restart dev server)
- Verify API key has correct permissions in Firebase Console

---

## 10. Next Steps

### Production Deployment

1. **Secure Environment Variables**:
   - Add all Firebase env vars to your hosting platform (Vercel, Netlify, etc.)
   - Never expose private keys in client-side code

2. **Service Worker Dynamic Generation**:
   - Consider generating `firebase-messaging-sw.js` dynamically to use env vars
   - Or use build-time script to inject config

3. **Notification Preferences**:
   - Add UI for users to manage notification preferences
   - Allow users to opt-in/opt-out of specific notification types

4. **Analytics**:
   - Track notification open rates
   - Monitor delivery success rates
   - Analyze user engagement

5. **Advanced Features**:
   - Rich notifications with images
   - Action buttons in notifications
   - Notification grouping
   - Silent notifications for data sync

---

## Summary Checklist

- [ ] Firebase project created
- [ ] Firebase config added to `.env.local`
- [ ] Dependencies installed (`firebase`, `firebase-admin`)
- [ ] `lib/firebase.ts` created
- [ ] `lib/firebase-admin.ts` created
- [ ] `public/firebase-messaging-sw.js` created
- [ ] `public/manifest.json` created
- [ ] Manifest linked in `app/layout.tsx`
- [ ] `hooks/useFCM.ts` created
- [ ] `app/api/device-tokens/route.ts` created
- [ ] Notification helper updated to send push notifications
- [ ] NotificationBell integrated with FCM hook
- [ ] Tested in browser
- [ ] Service worker registered successfully
- [ ] Push notifications received and working

---

## Support

For issues or questions:
- Firebase Documentation: https://firebase.google.com/docs/cloud-messaging
- Next.js Documentation: https://nextjs.org/docs
- Project Repository: [Your GitHub Repo]

---

**Congratulations!** 🎉 You now have a fully functional push notification system integrated with Firebase Cloud Messaging!
