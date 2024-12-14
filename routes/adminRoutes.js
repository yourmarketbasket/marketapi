const express = require('express');
const StaticImageService = require('../Services/adminServices');
const router = express.Router();

module.exports = (io) =>{
    // send message route
    router.post('/addStaticImagesRoute', async (req, res)=>{
        const response = await StaticImageService.addStaticImages(req.body, io);
        res.json(response)
    });
    router.get('/getCarouselStaticImagesRoute', async (req, res)=>{
        const response = await StaticImageService.getCarouselStaticImages();
        res.json(response)
    });


    return router;

}