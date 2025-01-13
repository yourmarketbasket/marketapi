const Notification = require('../models/notifications'); // Assuming this is the model file

class NotificationService {
    static async addNotification(data, io, eventName = 'new-notification', receiver = null, institutions = null, assistant = null, forceReissue = false, expires = false, expiresAt = null) {
        try {
            // Check if a notification with the same userId, message, and type already exists
            const existingNotification = await Notification.findOne({
                userId: data.userId,
                message: data.message,
                type: data.type,
            });

            // Handle existing notification logic
            if (existingNotification) {
                const isExpired = existingNotification.expires && new Date() > new Date(existingNotification.expiresAt);

                if (!forceReissue && !isExpired) {
                    // Notification exists, is not expired, and reissue is not forced
                    return { success: false, data: "Notification already sent and not expired." };
                }

                if (forceReissue || isExpired) {
                    // Update the existing notification
                    existingNotification.isRead = false; // Reset the read status
                    existingNotification.createdAt = new Date(); // Update the createdAt time
                    existingNotification.expires = expires; // Update expiry status
                    existingNotification.expiresAt = expires ? expiresAt : null; // Update the expiry time or clear it
                    await existingNotification.save();

                    // Emit the updated notification
                    io.emit(eventName, {
                        id: existingNotification._id,
                        userId: existingNotification.userId,
                        message: existingNotification.message,
                        type: existingNotification.type,
                        link: existingNotification.link,
                        isRead: existingNotification.isRead,
                        EventReceiver: receiver,
                        institutions: institutions,
                        assistant: assistant,
                        createdAt: existingNotification.createdAt,
                        expires: existingNotification.expires,
                        expiresAt: existingNotification.expiresAt,
                    });

                    return { success: true, data: existingNotification };
                }
            }

            // Create and save a new notification if none exists or if reissuing
            const notification = new Notification({
                userId: data.userId,
                message: data.message,
                type: data.type,
                link: data.link || null, // Optional field
                isRead: false, // Default value
                expires: expires, // Set expiry status
                expiresAt: expires ? expiresAt : null, // Set expiry time if expiry is enabled
            });
            await notification.save();

            // Emit the new notification
            io.emit(eventName, {
                id: notification._id,
                userId: notification.userId,
                message: notification.message,
                type: notification.type,
                link: notification.link,
                isRead: notification.isRead,
                EventReceiver: receiver,
                institutions: institutions,
                assistant: assistant,
                createdAt: notification.createdAt,
                expires: notification.expires,
                expiresAt: notification.expiresAt,
            });

            // Return the new notification
            return { success: true, data: notification };
        } catch (error) {
            console.error(error);
            return { success: false, data: error.message };
        }
    }
}

module.exports = NotificationService;
