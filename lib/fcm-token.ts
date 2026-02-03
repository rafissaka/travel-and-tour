import { requestNotificationPermission, getCurrentToken } from './firebase';

/**
 * Save FCM token to backend
 * Call this after user login/signup
 */
export async function saveFCMToken(): Promise<boolean> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Notifications not supported in this environment');
      return false;
    }

    // Check if user has already granted permission
    let token: string | null = null;

    if (Notification.permission === 'granted') {
      // Get existing token if permission already granted
      token = await getCurrentToken();
    } else if (Notification.permission === 'default') {
      // Request permission if not asked yet
      token = await requestNotificationPermission();
    }

    // If no token (permission denied or not supported), return false
    if (!token) {
      console.log('No FCM token available');
      return false;
    }

    // Log token for testing in Firebase Console
    console.log('='.repeat(80));
    console.log('📱 FCM TOKEN FOR FIREBASE CONSOLE TESTING:');
    console.log('='.repeat(80));
    console.log(token);
    console.log('='.repeat(80));
    console.log('Copy this token to send test notifications from Firebase Console');
    console.log('Firebase Console > Cloud Messaging > Send test message');
    console.log('='.repeat(80));

    // Save token to backend
    const response = await fetch('/api/device-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        deviceType: 'WEB',
        userAgent: navigator.userAgent,
      }),
    });

    if (response.status === 401) {
      console.log('ℹ️ FCM token save skipped: user not logged in');
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to save FCM token to backend (Status: ${response.status})`);
    }

    console.log('✅ FCM token saved successfully to backend');
    return true;
  } catch (error) {
    // Only log actual errors, not expected status codes
    console.error('Error in saveFCMToken:', error);
    return false;
  }
}

/**
 * Request permission and save token
 * Call this when user explicitly wants to enable notifications
 */
export async function enableNotifications(): Promise<boolean> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Notifications not supported in this environment');
      return false;
    }

    const token = await requestNotificationPermission();

    if (!token) {
      return false;
    }

    // Log token for testing in Firebase Console
    console.log('='.repeat(80));
    console.log('📱 FCM TOKEN FOR FIREBASE CONSOLE TESTING:');
    console.log('='.repeat(80));
    console.log(token);
    console.log('='.repeat(80));
    console.log('Copy this token to send test notifications from Firebase Console');
    console.log('Firebase Console > Cloud Messaging > Send test message');
    console.log('='.repeat(80));

    // Save token to backend
    const response = await fetch('/api/device-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        deviceType: 'WEB',
        userAgent: navigator.userAgent,
      }),
    });

    if (response.status === 401) {
      console.log('ℹ️ FCM token save skipped: user not logged in');
      return false;
    }

    if (response.ok) {
      console.log('✅ FCM token saved successfully to backend');
      return true;
    }

    console.error('Failed to save FCM token to backend:', response.statusText);
    return false;
  } catch (error) {
    console.error('Error enabling notifications:', error);
    return false;
  }
}

/**
 * Remove FCM token from backend
 * Call this on logout or when user disables notifications
 */
export async function removeFCMToken(): Promise<boolean> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return true; // Nothing to remove in non-browser environment
    }

    const token = await getCurrentToken();

    if (!token) {
      return true; // No token to remove
    }

    const response = await fetch(`/api/device-tokens?token=${encodeURIComponent(token)}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('Error removing FCM token:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}
