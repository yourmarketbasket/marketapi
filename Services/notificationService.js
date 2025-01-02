const Notification = require('../models/notifications'); // Assuming this is the model file

class NotificationService {
    static async addNotification(data, io, eventName = 'new-notification', receiver = null, institutions = null, assistant = null) {
        try {
            // Check if a notification with the same userId, message, and type already exists
            const existingNotification = await Notification.findOne({
                userId: data.userId,
                message: data.message,
                type: data.type,
            });
    
            if (existingNotification) {
                return { success: false, data: "Notification already sent." };
            }
    
            // Create and save the new notification
            const notification = new Notification({
                userId: data.userId,
                message: data.message,
                type: data.type,
                link: data.link || null, // Optional field
                isRead: false, // Default value
            });
            await notification.save();
    
            // Emit the saved notification using the provided event name
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
            });
    
            // Return the saved notification
            return { success: true, data: notification };
        } catch (error) {
            console.error(error);
            return { success: false, data: error.message };
        }
    }
    
    
    
}

module.exports = NotificationService;
