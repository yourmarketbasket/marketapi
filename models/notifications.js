const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String, // Example: 'info', 'warning', 'success', 'error'
        required: true
    },
    link: {
        type: String, // URL to navigate the user to a relevant resource
        required: false // Not all notifications might need a link
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
