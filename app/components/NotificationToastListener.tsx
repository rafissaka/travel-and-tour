'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NotificationToastListener() {
  const lastNotificationId = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Poll for new notifications every 10 seconds
    const pollNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?limit=1');
        if (!response.ok) return;

        const data = await response.json();
        const notifications = data.notifications || [];

        if (notifications.length > 0) {
          const latestNotification = notifications[0];

          // If this is a new notification (different from last seen)
          if (
            lastNotificationId.current !== latestNotification.id &&
            !latestNotification.isRead
          ) {
            lastNotificationId.current = latestNotification.id;

            // Only show toast from poller if we don't have permission (FCM handles granted)
            // This prevents duplicate notifications
            if (Notification.permission !== 'granted') {
              toast(latestNotification.title, {
                description: latestNotification.message,
                duration: 5000,
                action: latestNotification.actionUrl
                  ? {
                    label: 'View',
                    onClick: () => {
                      router.push(latestNotification.actionUrl);
                    },
                  }
                  : undefined,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    };

    // Initial poll
    pollNotifications();

    // Set up polling interval
    const interval = setInterval(pollNotifications, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [router]);

  return null; // This component doesn't render anything
}
