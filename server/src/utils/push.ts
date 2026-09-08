import webpush from 'web-push';
import prisma from '../config/prisma';
import { getIO } from '../socket';

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjDCWJxoBURZqvDxHLtlKTvnGDzk8';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'EEe0_WvU_9tZfK2g8xXf0pU8dG_Zk181_6s7W5zE_9w';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@nexus-hub.internal';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (err) {
  console.warn('Web push VAPID initialization warning:', err);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  actionUrl?: string;
  type: string;
  departmentId?: string;
}

export const sendDepartmentPushNotification = async ({
  departmentId,
  title,
  body,
  actionUrl = '/',
  type,
  excludeUserId,
}: PushNotificationPayload & { excludeUserId?: string }): Promise<void> => {
  try {
    // 1. Find all approved members in this department
    const members = await prisma.departmentMember.findMany({
      where: {
        departmentId,
        status: 'APPROVED',
        ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      },
      select: { userId: true },
    });

    if (members.length === 0) return;

    const userIds = members.map((m) => m.userId);

    // 2. Create in-app Notification records for all these users
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        recipientId: userId,
        departmentId,
        type,
        title,
        body,
        actionUrl,
        isRead: false,
      })),
    });

    // 3. Emit real-time notification to active Socket.IO room
    try {
      const io = getIO();
      if (io) {
        const dept = await prisma.department.findUnique({
          where: { id: departmentId },
          select: { slug: true },
        });
        if (dept) {
          io.to(`dept:${dept.slug}`).emit('notification:new', {
            type,
            title,
            body,
            actionUrl,
            departmentId,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      // Socket may not be initialized yet in test mode
    }

    // 4. Send Web Push to subscribed devices
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    });

    const payload = JSON.stringify({
      title,
      body,
      actionUrl,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      timestamp: Date.now(),
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
      } catch (error: any) {
        // 410 Gone or 404 Not Found means the subscription expired/unregistered
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error('Failed to send department push notifications:', error);
  }
};

export const sendUserPushNotification = async ({
  userId,
  title,
  body,
  actionUrl = '/',
  type,
  departmentId,
}: PushNotificationPayload & { userId: string }): Promise<void> => {
  try {
    // 1. Create in-app notification
    await prisma.notification.create({
      data: {
        recipientId: userId,
        departmentId,
        type,
        title,
        body,
        actionUrl,
        isRead: false,
      },
    });

    // 2. Real-time emit to user socket room
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notification:new', {
          type,
          title,
          body,
          actionUrl,
          departmentId,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {}

    // 3. Web Push
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    const payload = JSON.stringify({
      title,
      body,
      actionUrl,
      icon: '/icons/icon-192.png',
      timestamp: Date.now(),
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error('Failed to send user push notification:', error);
  }
};
