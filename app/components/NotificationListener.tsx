'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { getMessaging, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';

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

    const setupListener = async () => {
      try {
        console.log('🔔 Setting up foreground notification listener...');

        // Dynamic import to avoid SSR issues
        const { getMessaging, onMessage } = await import('firebase/messaging');

        // We need to ensure we have the app initialized
        // Since app is exported from lib/firebase, it should be ready or we init it here
        // But getMessaging require standard firebase app instance.
        // Let's rely on lib/firebase to give us a clean entry if possible, 
        // but importing 'app' from there is safe.

        const messaging = getMessaging(app);

        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('📨 Foreground notification received:', payload);

          // Extract notification data
          // Cast payload to our interface
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

          console.log('✅ Toast notification displayed');
        });

        return () => {
          // unsubscribe(); // onMessage returns void in some versions or unsubscribe function in others. 
          // Recent firebase versions: onMessage returns Unsubscribe function.
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };

      } catch (error) {
        console.error('❌ Error setting up notification listener:', error);
      }
    };

    // Execute setup and handle cleanup
    let cleanup: (() => void) | undefined;

    setupListener().then(unsub => {
      cleanup = unsub;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}
