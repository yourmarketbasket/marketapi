const express = require('express');
const AdminService = require('../Services/adminServices');
const router = express.Router();

module.exports = (io) =>{
    // send message route
    router.post('/addStaticImagesRoute', async (req, res)=>{
        const response = await AdminService.addStaticImages(req.body, io);
        res.json(response)
    });
    router.get('/getCarouselStaticImagesRoute', async (req, res)=>{
        const response = await AdminService.getCarouselStaticImages();
        res.json(response)
    });
    router.post('/registerDriverRoute', async (req, res)=>{
        const response = await AdminService.registerDeliveryDriver(req.body, io);
        res.json(response)
    });
    router.get('/getStoreDriversRoute/:storeid', async (req, res)=>{
        const response = await AdminService.getStoreDrivers(req.params.storeid);
        res.json(response)
    });


    return router;

}