import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';

// Conditionally import Firebase Admin (only if installed)
let sendPushNotification: any;
let sendPushNotificationToAdmins: any;

try {
  const firebaseAdmin = require('./firebase-admin');
  sendPushNotification = firebaseAdmin.sendPushNotification;
  sendPushNotificationToAdmins = firebaseAdmin.sendPushNotificationToAdmins;
} catch (error) {
  // Firebase Admin not installed or configured - push notifications disabled
  console.log('Firebase Admin not available - push notifications disabled');
  sendPushNotification = async () => { /* no-op */ };
  sendPushNotificationToAdmins = async () => { /* no-op */ };
}

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notifications.create({
      data: {
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl,
        metadata: params.metadata || {},
      },
    });

    // Send push notification (non-blocking)
    sendPushNotification(params.userId, {
      title: params.title,
      body: params.message,
      actionUrl: params.actionUrl,
      data: {
        notificationId: notification.id,
        type: params.type,
      },
    }).catch((error: unknown) => {
      console.error('Failed to send push notification:', error);
      // Don't throw - database notification was created successfully
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const notifications = await prisma.notifications.createMany({
      data: userIds.map((userId) => ({
        user_id: userId,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl,
        metadata: params.metadata || {},
      })),
    });

    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Notify user about a new booking
 */
export async function notifyNewBooking(userId: string, bookingId: string, eventOrServiceName: string) {
  return createNotification({
    userId,
    type: 'NEW_BOOKING',
    title: 'New Booking Received',
    message: `You have a new booking for "${eventOrServiceName}"`,
    actionUrl: `/profile/bookings`,
    metadata: { bookingId },
  });
}

/**
 * Notify user about booking status change
 */
export async function notifyBookingStatusChange(
  userId: string,
  bookingId: string,
  status: string,
  eventOrServiceName: string
) {
  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Your booking has been confirmed',
    CANCELLED: 'Your booking has been cancelled',
    PENDING: 'Your booking is pending confirmation',
    COMPLETED: 'Your booking has been completed',
  };

  return createNotification({
    userId,
    type: 'BOOKING_STATUS_CHANGE',
    title: 'Booking Status Updated',
    message: `${statusMessages[status] || 'Booking status changed'} for "${eventOrServiceName}"`,
    actionUrl: `/profile/bookings`,
    metadata: { bookingId, status },
  });
}

/**
 * Notify user about a new application
 */
export async function notifyNewApplication(
  userId: string,
  applicationId: string,
  programName: string
) {
  return createNotification({
    userId,
    type: 'NEW_APPLICATION',
    title: 'Application Received',
    message: `Your application for "${programName}" has been received`,
    actionUrl: `/profile/applications`,
    metadata: { applicationId },
  });
}

/**
 * Notify user about application status change
 */
export async function notifyApplicationStatusChange(
  userId: string,
  applicationId: string,
  status: string,
  programName: string
) {
  const statusMessages: Record<string, string> = {
    PENDING: 'Your application is under review',
    APPROVED: 'Congratulations! Your application has been approved',
    REJECTED: 'Your application has been reviewed',
    WAITLISTED: 'You have been added to the waitlist',
  };

  return createNotification({
    userId,
    type: 'APPLICATION_STATUS_CHANGE',
    title: 'Application Status Updated',
    message: `${statusMessages[status] || 'Application status changed'} for "${programName}"`,
    actionUrl: `/profile/applications`,
    metadata: { applicationId, status },
  });
}

/**
 * Notify user about a new reservation
 */
export async function notifyNewReservation(
  userId: string,
  reservationId: string,
  type: string
) {
  return createNotification({
    userId,
    type: 'NEW_RESERVATION',
    title: 'Reservation Confirmed',
    message: `Your ${type.toLowerCase()} reservation has been confirmed`,
    actionUrl: `/profile/reservations`,
    metadata: { reservationId },
  });
}

/**
 * Notify admins about a new reservation from user
 */
export async function notifyAdminsNewReservation(
  reservationId: string,
  userName: string,
  reservationType: string
) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPER_ADMIN'],
      },
      isActive: true,
    },
    select: { id: true },
  });

  // Send push notifications to admins (non-blocking)
  sendPushNotificationToAdmins({
    title: 'New Reservation',
    body: `${userName} created a new ${reservationType} reservation`,
    actionUrl: '/profile/reservations',
    data: {
      type: 'NEW_RESERVATION',
      reservationId,
    },
  }).catch((error: unknown) => {
    console.error('Failed to send push notifications to admins:', error);
  });

  return createBulkNotifications(
    admins.map((admin) => admin.id),
    {
      type: 'NEW_RESERVATION',
      title: 'New Reservation',
      message: `${userName} created a new ${reservationType} reservation`,
      actionUrl: '/profile/reservations',
      metadata: { reservationId },
    }
  );
}

/**
 * Notify user about a new chat message
 */
export async function notifyChatMessage(
  userId: string,
  conversationId: string,
  senderName: string,
  messagePreview: string
) {
  return createNotification({
    userId,
    type: 'CHAT_MESSAGE',
    title: `New message from ${senderName}`,
    message: messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview,
    actionUrl: `/profile/chats`,
    metadata: { conversationId },
  });
}

/**
 * Notify admins about a new chat message from user
 */
export async function notifyAdminsNewChatMessage(
  conversationId: string,
  userName: string,
  messagePreview: string
) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPER_ADMIN'],
      },
      isActive: true,
    },
    select: { id: true },
  });

  const preview = messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview;

  // Send push notifications to admins (non-blocking)
  sendPushNotificationToAdmins({
    title: 'New Chat Message',
    body: `${userName}: ${preview}`,
    actionUrl: '/profile/chats',
    data: {
      type: 'CHAT_MESSAGE',
      conversationId,
    },
  }).catch((error: unknown) => {
    console.error('Failed to send push notifications to admins:', error);
  });

  return createBulkNotifications(
    admins.map((admin) => admin.id),
    {
      type: 'CHAT_MESSAGE',
      title: `New message from ${userName}`,
      message: preview,
      actionUrl: '/profile/chats',
      metadata: { conversationId },
    }
  );
}

/**
 * Notify admins about a new testimonial (admin notification)
 */
export async function notifyAdminsNewTestimonial(
  testimonialId: string,
  userName: string
) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPER_ADMIN'],
      },
      isActive: true,
    },
    select: { id: true },
  });

  // Send push notifications to admins (non-blocking)
  sendPushNotificationToAdmins({
    title: 'New Testimonial',
    body: `${userName} submitted a new testimonial for review`,
    actionUrl: '/admin/testimonials',
    data: {
      type: 'NEW_TESTIMONIAL',
      testimonialId,
    },
  }).catch((error: unknown) => {
    console.error('Failed to send push notifications to admins:', error);
  });

  return createBulkNotifications(
    admins.map((admin) => admin.id),
    {
      type: 'NEW_TESTIMONIAL',
      title: 'New Testimonial Submitted',
      message: `${userName} has submitted a new testimonial for review`,
      actionUrl: `/admin/testimonials`,
      metadata: { testimonialId },
    }
  );
}

/**
 * Notify user about payment received
 */
export async function notifyPaymentReceived(
  userId: string,
  bookingId: string,
  amount: number,
  currency: string
) {
  return createNotification({
    userId,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Confirmed',
    message: `Your payment of ${currency} ${amount.toFixed(2)} has been received`,
    actionUrl: `/profile/bookings`,
    metadata: { bookingId, amount, currency },
  });
}

/**
 * Send system alert to user
 */
export async function notifySystemAlert(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
) {
  return createNotification({
    userId,
    type: 'SYSTEM_ALERT',
    title,
    message,
    actionUrl,
  });
}

/**
 * Send system alert to all admins
 */
export async function notifyAdmins(
  title: string,
  message: string,
  actionUrl?: string
) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPER_ADMIN'],
      },
    },
    select: { id: true },
  });

  // Send push notifications to admins (non-blocking)
  sendPushNotificationToAdmins({
    title,
    body: message,
    actionUrl,
    data: {
      type: 'SYSTEM_ALERT',
    },
  }).catch((error: unknown) => {
    console.error('Failed to send push notifications to admins:', error);
  });

  return createBulkNotifications(
    admins.map((admin) => admin.id),
    {
      type: 'SYSTEM_ALERT',
      title,
      message,
      actionUrl,
    }
  );
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notifications.count({
    where: {
      user_id: userId,
      is_read: false,
    },
  });
}
