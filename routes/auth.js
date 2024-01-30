const express = require('express');
const router = express.Router();
const Authservice = require('../Services/authService')


module.exports = (io) => {

    router.get('/testroute', async (req, res) => {
        const result = await Authservice.testFunction(io);
        console.log(result);
        res.send(result);
    });




    
    return router;
  };