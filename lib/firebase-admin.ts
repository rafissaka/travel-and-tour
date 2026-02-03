import { prisma } from './prisma';

let messaging: any = null;
let isInitialized = false;

// Lazy initialization of Firebase Admin
async function initializeFirebaseAdmin() {
  if (isInitialized) return;

  try {
    const admin = await import('firebase-admin');
    const adminApp = admin.apps.length === 0
      ? admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
      : admin.apps[0];

    if (adminApp) {
      console.log('✅ Firebase Admin initialized successfully');
      messaging = adminApp.messaging();
      isInitialized = true;
    } else {
      console.error('❌ Failed to initialize Firebase Admin app');
    }
  } catch (error) {
    console.warn('⚠️ Firebase Admin SDK initialization failed:', error);
    messaging = null;
  }
}

export { messaging };

interface PushNotificationData {
  title: string;
  body: string;
  actionUrl?: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/**
 * Send push notification to a single user
 */
export async function sendPushNotification(
  userId: string,
  notification: PushNotificationData
): Promise<void> {
  // Initialize Firebase Admin if not already done
  await initializeFirebaseAdmin();

  // Check if Firebase Admin is available
  if (!messaging) {
    console.log('Firebase Admin not configured - skipping push notification');
    return;
  }

  try {
    // Get user's active device tokens
    const deviceTokens = await prisma.device_tokens.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      select: { token: true, id: true },
    });

    if (deviceTokens.length === 0) {
      console.log(`No active device tokens for user ${userId}`);
      return;
    }

    const tokens = deviceTokens.map((dt) => dt.token);

    // Prepare message payload
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
      },
      data: {
        actionUrl: notification.actionUrl || '/profile/notifications',
        ...notification.data,
      },
      tokens,
    };

    // Send notification to multiple devices
    const response = await messaging.sendEachForMulticast(message);

    console.log(`Successfully sent ${response.successCount} notifications to user ${userId}`);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];

      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${idx}:`, resp.error);
          failedTokens.push(tokens[idx]);
        }
      });

      // Deactivate failed tokens (they might be invalid or expired)
      if (failedTokens.length > 0) {
        await prisma.device_tokens.updateMany({
          where: {
            token: { in: failedTokens },
          },
          data: { is_active: false },
        });
        console.log(`Deactivated ${failedTokens.length} invalid tokens`);
      }
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToMultipleUsers(
  userIds: string[],
  notification: PushNotificationData
): Promise<void> {
  try {
    // Send notifications to each user
    await Promise.allSettled(
      userIds.map((userId) => sendPushNotification(userId, notification))
    );
  } catch (error) {
    console.error('Error sending push notifications to multiple users:', error);
    throw error;
  }
}

/**
 * Send push notification to all admins
 */
export async function sendPushNotificationToAdmins(
  notification: PushNotificationData
): Promise<void> {
  // Initialize Firebase Admin if not already done
  await initializeFirebaseAdmin();

  // Check if Firebase Admin is available
  if (!messaging) {
    console.log('Firebase Admin not configured - skipping push notification');
    return;
  }

  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
      },
      select: { id: true },
    });

    const adminIds = admins.map((admin) => admin.id);

    await sendPushNotificationToMultipleUsers(adminIds, notification);
  } catch (error) {
    console.error('Error sending push notifications to admins:', error);
    throw error;
  }
}

/**
 * Send topic-based push notification
 * Useful for broadcasting to all users subscribed to a topic
 */
export async function sendTopicNotification(
  topic: string,
  notification: PushNotificationData
): Promise<void> {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
      },
      data: {
        actionUrl: notification.actionUrl || '/profile/notifications',
        ...notification.data,
      },
      topic,
    };

    const response = await messaging.send(message);
    console.log(`Successfully sent topic notification to ${topic}:`, response);
  } catch (error) {
    console.error('Error sending topic notification:', error);
    throw error;
  }
}

/**
 * Subscribe user's device tokens to a topic
 */
export async function subscribeToTopic(
  userId: string,
  topic: string
): Promise<void> {
  try {
    const deviceTokens = await prisma.device_tokens.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      select: { token: true },
    });

    if (deviceTokens.length === 0) {
      console.log(`No active device tokens for user ${userId}`);
      return;
    }

    const tokens = deviceTokens.map((dt) => dt.token);
    const response = await messaging.subscribeToTopic(tokens, topic);

    console.log(`Subscribed ${response.successCount} tokens to topic ${topic}`);
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
}

/**
 * Unsubscribe user's device tokens from a topic
 */
export async function unsubscribeFromTopic(
  userId: string,
  topic: string
): Promise<void> {
  try {
    const deviceTokens = await prisma.device_tokens.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      select: { token: true },
    });

    if (deviceTokens.length === 0) {
      console.log(`No active device tokens for user ${userId}`);
      return;
    }

    const tokens = deviceTokens.map((dt) => dt.token);
    const response = await messaging.unsubscribeFromTopic(tokens, topic);

    console.log(`Unsubscribed ${response.successCount} tokens from topic ${topic}`);
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
}
