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
    router.post('/updateDriverInfoRoute', async (req, res)=>{
        const response = await AdminService.updateDriverInfo(req.body, io);
        res.json(response)
    });
    router.get('/activateDeliveryPanelRoute/:id', async (req, res)=>{
        const response = await AdminService.activateDriverPanel(req.params.id, io);
        res.json(response)
    });
    router.get('/checkIfDeliveryPanelIsActiveRoute/:id', async (req, res)=>{
        const response = await AdminService.checkDeliveryPanelIsActive(req.params.id, io);
        res.json(response)
    });
    router.get('/getStoreDriversRoute/:storeid', async (req, res)=>{
        const response = await AdminService.getStoreDrivers(req.params.storeid);
        res.json(response)
    });
    router.get('/getDriverByUserIDRoute/:userid', async (req, res)=>{
        const response = await AdminService.getDriverByUserID(req.params.userid);
        res.json(response)
    });
    router.post('/updateDriverDetailsRoute', async (req, res)=>{
        const response = await AdminService.updateDriverDetails(req.body);
        res.json(response)
    });
    router.post('/addStoreAssistantRoute', async (req, res)=>{
        const response = await AdminService.addStoreAssistant(req.body, io);
        res.json(response)
    });
    router.get('/getStoreAssistantsRoute/:storeid', async (req, res)=>{
        const response = await AdminService.getAssistantsForStore(req.params.storeid);
        res.json(response)
    });
    router.get('/getStoresAssignedToAssistantRoute/:userid', async (req, res)=>{
        const response = await AdminService.getStoresAssignedToAssistant(req.params.userid);
        res.json(response)
    });



    return router;

}