const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');

exports.getNotifications = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Notification.countDocuments({ userId: req.user.id });
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    return success(res, {
        notifications,
        unreadCount,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
    }, 'Notifications retrieved');
};

exports.markAsRead = async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return error(res, 'Notification not found', 404);
    }

    return success(res, notification, 'Notification marked as read');
};

exports.markAllAsRead = async (req, res) => {
    await Notification.updateMany(
        { userId: req.user.id, isRead: false },
        { isRead: true }
    );

    return success(res, null, 'All notifications marked as read');
};

exports.getUnreadCount = async (req, res) => {
    const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    return success(res, { count }, 'Unread count retrieved');
};
