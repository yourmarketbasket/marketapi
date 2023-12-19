const express = require('express');
const router = express.Router();
const Notifications = require('../Services/notifyService')

// send message route
router.post('/sendMessage', async (req, res)=>{
    Notifications.sendNotificationMessage(req.body.message, req.body.to).then(response=>{
        res.json(response)
    }).catch(error=>{
        res.json(error)
    });
})

module.exports = router;