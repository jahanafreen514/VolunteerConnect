const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type, relatedId = null, relatedModel = null) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            relatedId,
            relatedModel
        });

        // Try to get io instance
        const io = global.io;
        if (io) {
            io.to(userId.toString()).emit('new_notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = createNotification;
