const prisma = require("../config/prisma"); // Assuming this is where prisma client is
const emailService = require("./email.service");

exports.createNotification = async ({ userId, type, message, bookingId }) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      bookingId,
    },
  });

  // Fetch the user to get their email address and send the email
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.email) {
      await emailService.sendNotificationEmail(user.email, type, message);
    }
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }

  return notification;
};

exports.getNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return notifications;
};

exports.markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
  return notification;
};

exports.markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return result;
};
