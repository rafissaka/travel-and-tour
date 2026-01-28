'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { saveFCMToken } from '@/lib/fcm-token';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    title?: string;
    body?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  fcmOptions?: {
    link?: string;
  };
}

export default function NotificationListener() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      return;
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported in this browser');
      return;
    }

    const setupListener = async () => {
      try {
        console.log('🔔 Setting up foreground notification listener...');

        // Try to save FCM token for logged-in users (will check auth internally)
        try {
          await saveFCMToken();
        } catch (err) {
          console.log('ℹ️ FCM token save skipped (user may not be logged in)');
        }

        // Check if permission is granted
        if (Notification.permission !== 'granted') {
          console.log('ℹ️ Notification permission not granted - FCM listener not active');
          return;
        }

        // Dynamic imports to avoid SSR issues
        const { isSupported } = await import('firebase/messaging');
        const messagingSupported = await isSupported();
        
        if (!messagingSupported) {
          console.log('❌ Firebase messaging not supported in this browser');
          return;
        }

        const { getMessaging, onMessage } = await import('firebase/messaging');
        const { app } = await import('@/lib/firebase');

        const messaging = getMessaging(app);

        console.log('✅ Firebase messaging initialized, setting up listener...');

        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('📨 Foreground FCM notification received:', payload);

          // Extract notification data
          const data = payload as NotificationPayload;
          const title = data.notification?.title || data.data?.title || 'New Notification';
          const body = data.notification?.body || data.data?.body || 'You have a new notification';
          const actionUrl = data.data?.actionUrl || data.fcmOptions?.link;

          // Show toast notification
          toast(title, {
            description: body,
            duration: 5000,
            action: actionUrl ? {
              label: 'Open',
              onClick: () => {
                window.location.href = actionUrl;
              }
            } : undefined,
          });

          console.log('✅ Toast notification displayed from FCM');
        });

        return () => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
            console.log('🔕 FCM listener unsubscribed');
          }
        };

      } catch (error) {
        console.error('❌ Error setting up FCM notification listener:', error);
      }
    };

    // Execute setup and handle cleanup
    let cleanup: (() => void) | undefined;

    setupListener().then(unsub => {
      cleanup = unsub;
    }).catch(error => {
      console.error('❌ Failed to setup FCM listener:', error);
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}
