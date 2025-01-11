const express = require('express');
const AdminService = require('../Services/adminServices');
const MailService = require('../Services/mailService');
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
    // get store drivers who are unoccupied
    router.get('/getUnoccupiedDriversRoute/:storeid', async (req, res)=>{
        const response = await AdminService.getUnoccupiedDrivers(req.params.storeid);
        res.json(response)
    });
    // dispatch order route
    router.post('/dispatchOrderRoute', async (req, res)=>{
        const response = await AdminService.dispatchOrder(req.body, io);
        res.json(response)
    });
    // get driver dispatch requests
    router.get('/getDriverDispatchRequestsRoute/:driverid', async (req, res)=>{
        const response = await AdminService.getDriverDispatchRequests(req.params.driverid);
        res.json(response)
    });
    // get all categories
    router.get('/getAllCategoriesRoute', async (req, res)=>{
        const response = await AdminService.getAllCategories();
        res.json(response)
    });
    // send email route
    router.post('/sendEmailRoute', async (req, res)=>{
        const response = await AdminService.sendEmail(req.body, io);
        res.json(response)
    });
    // get all stores
    router.get('/getAllStoresRoute', async (req, res)=>{
        const response = await AdminService.sendEmail(req.body);
        res.json(response)
    });
    // get all drivers
    router.get('/getAllDriversRoute', async (req, res)=>{
        const response = await AdminService.getAllDrivers();
        res.json(response)
    });
    // get all assistants

    // pick up order route
    // router.post('/pickUpOrderRoute', async (req, res)=>{
    //     const response = await AdminService.pickUpOrder(req.body, io);
    //     res.json(response)
    // });
    // // deliver order route
    // router.post('/deliverOrderRoute', async (req, res)=>{
    //     const response = await AdminService.deliverOrder(req.body, io);
    //     res.json(response)
    // });
    // // complete order route
    // router.post('/completeOrderRoute', async (req, res)=>{
    //     const response = await AdminService.completeOrder(req.body, io);
    //     res.json(response)
    // });
    



    return router;

}