const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('request');
const dotenv = require('dotenv');
const EventEmitService = require('./eventService');
const NotificationService = require('./notificationService');
const Notification = require('../models/notifications');
class UserService{

    // change avatar
    static async changeUserAvatar(data, io){
         // find a user by the id
        const user = await User.findOne({ _id: data.userid });
        if (user) {
            const filter = { _id: data.userid };
            const update = { avatar: data.avatar };
            // update the value for avatar in the user document
            const updatedUser = await User.findOneAndUpdate(filter, update);
            if (updatedUser) {
                NotificationService.addNotification({
                    userId: data.userid,
                    message: "Avatar Changed Successfully",
                    type: "success",
                    link: null, // Optional field
                    isRead: false, },  io); 

                return { message: 'Avatar changed successfully', success: true };
            } else {
                NotificationService.addNotification({
                    userId: data.userid,
                    message: "Error Changing Avatar",
                    type: "error",
                    link: null, // Optional field
                    isRead: false, },  io); 
                return { message: 'Error changing avatar', success: false };
            }
        } else {
            return { message: 'User not found', success: false };
        }

    }

    static async getUserNotifications(userid) {
        try {
            // Fetch unread notifications for the user
            const notifications = await Notification.find({ userId: userid, isRead: false });
    
            if (!notifications || notifications.length === 0) {
                return { success: false, message: "No notifications found!" };
            }
    
            // Parse `createdAt` into Date objects
            notifications.forEach(notification => {
                if (typeof notification.createdAt === 'string') {
                    notification.createdAt = new Date(notification.createdAt); // Ensure it's a Date object
                }
            });
    
    
            // Sort notifications by `createdAt` in descending order (latest first)
            notifications.sort((a, b) => b.createdAt - a.createdAt); // Sorting by timestamp
    
    
            // Initialize categories and their counts
            const categorizedNotifications = {
                total: notifications.length,
                info: {
                    count: 0,
                    data: []
                },
                warning: {
                    count: 0,
                    data: []
                },
                success: {
                    count: 0,
                    data: []
                },
                error: {
                    count: 0,
                    data: []
                }
            };
    
            // Categorize notifications based on their type
            notifications.forEach(notification => {
                switch (notification.type) {
                    case 'info':
                        categorizedNotifications.info.count++;
                        categorizedNotifications.info.data.push(notification);
                        break;
                    case 'warning':
                        categorizedNotifications.warning.count++;
                        categorizedNotifications.warning.data.push(notification);
                        break;
                    case 'success':
                        categorizedNotifications.success.count++;
                        categorizedNotifications.success.data.push(notification);
                        break;
                    case 'error':
                        categorizedNotifications.error.count++;
                        categorizedNotifications.error.data.push(notification);
                        break;
                    default:
                        break; // Handle unknown types gracefully if needed
                }
            });
    
            return { success: true, data: categorizedNotifications };
    
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async markNotificationAsRead(notificationId) {
        try {
            // Find the notification by its _id
            const notification = await Notification.findById(notificationId);
    
            if (!notification) {
                return { success: false, message: "Notification not found!" };
            }
    
            if (notification.isRead) {
                return { success: false, message: "Notification is already marked as read!" };
            }
    
            // Mark the notification as read
            notification.isRead = true;
            
            // Save the updated notification
            await notification.save();
    
            return { success: true, message: "Notification marked as read successfully!" };
    
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    
    
    
    

    // Function to generate a new token
    static async generateToken (userId, token){
        // console.log("userid is", userId);
        try {
            const user = await User.findOne({_id: userId});
    
        if (user) {
            const payload = {
            userdata: user,
            token: token,
            };
    
            // Sign and generate token, expires in 60 seconds
            const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60s' });
            return authToken;
        } else {
            return null;
        }
        } catch (error) {
            console.error('Error generating token:', error.message);
            return null;
        }
    };

    static async updateLocation(data, io){
        try{
            const user = await User.findByIdAndUpdate(
                data.userid,
                {
                    $set: {
                        location: data.location
                    }
                } 
            )
            if(user){
                EventEmitService.emitEventMethod(io, "locationevent", {userid:data.userid, message: "Location Updated Successfully"});
                NotificationService.addNotification({
                    userId: data.userid,
                    message: "Location Updated Successfully",
                    type: "success",
                    link: null, // Optional field
                    isRead: false, },  io); 
                return {success:true, message:"Location updated"}
            }else{
                NotificationService.addNotification({
                    userId: data.userid,
                    message: "Location Update Error.",
                    type: "error",
                    link: null, // Optional field
                    isRead: false, },  io); 
                return {success:false, message: "Could not update location"};
            }

        }catch(e){
            console.log(e)
            return {success:false, message: "Some error occured"};

        }
    }

    
}

module.exports = UserService