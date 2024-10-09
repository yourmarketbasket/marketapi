const express = require('express');
const router = express.Router();
const Authservice = require('../Services/authService');
const UserService = require('../Services/userServices');


module.exports = (io) => {

    router.get('/testroute', async (req, res) => {
        const result = await Authservice.testFunction(io);
        console.log(result);
        res.send(result);
    });

    router.post('/accessToken', async (req, res) => {
        try {
    
            // Call generateToken to create a new token
            const result = await UserService.generateToken(req.body.userId, req.body.token);
    
            if (result) {
                res.send({ accessToken: result });
            } else {
                res.status(404).json({ message: 'User not found or token generation failed' });
            }
        } catch (error) {
            // Catch any errors that occur
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });




    
    return router;
  };