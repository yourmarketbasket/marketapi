const Notification = require('../models/notifications'); // Assuming this is the model file

class NotificationService {
    static async addNotification(data, io) {
        try {
            // Validate and save the notification to the database
            const notification = new Notification({
                userId: data.userId,
                message: data.message,
                type: data.type,
                link: data.link || null, // Optional field
                isRead: false, // Default value
            });
            await notification.save();

            // Emit the saved notification using Socket.IO
            io.emit('new-notification', {
                id: notification._id,
                userId: notification.userId,
                message: notification.message,
                type: notification.type,
                link: notification.link,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
            });

            // Return the saved notification
            return notification;
        } catch (error) {
            console.error('Error adding notification:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;
