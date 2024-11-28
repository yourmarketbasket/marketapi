const express = require('express');
const router = express.Router();
const Notifications = require('../Services/notifyService')
const authenticator = require('../middleware/authenticator');
const NotificationService = require('../Services/notificationService');

module.exports = (io) =>{
    // send message route
    router.post('/sendMessage', async (req, res)=>{
        Notifications.sendNotificationMessage(req.body.message, req.body.to).then(response=>{
            res.json(response)
        }).catch(error=>{
            res.json(error)
        });
    })

    router.post('/sendCommonNotification', async (req, res)=>{
        const notify = await NotificationService.addNotification(req.body, io);
        if(notify.success){
            res.json({success:true, message:"Notification Sent"});
        }else{
            res.json({success:false, message: notify.data})
        }
    })

    return router;

}

