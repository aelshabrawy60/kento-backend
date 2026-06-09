const notificationService = require("../services/notification.service");

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationService.getNotifications(userId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const notification = await notificationService.markAsRead(userId, id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await notificationService.markAllAsRead(userId);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
