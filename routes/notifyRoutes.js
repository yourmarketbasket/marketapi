const express = require('express');
const router = express.Router();
const Notifications = require('../Services/notifyService')
const authenticator = require('../middleware/authenticator');

// send message route
router.post('/sendMessage', async (req, res)=>{
    Notifications.sendNotificationMessage(req.body.message, req.body.to).then(response=>{
        res.json(response)
    }).catch(error=>{
        res.json(error)
    });
})

module.exports = router;