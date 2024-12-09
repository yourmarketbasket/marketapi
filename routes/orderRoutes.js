const express = require('express');
const router = express.Router();
const OrderService = require('../Services/orderService');
const authenticator = require('../middleware/authenticator');


module.exports = (io) => {
    router.get('/getStoreIDsForOrderProducts/:id', async (req, res)=>{
        res.json(await OrderService.getClosestProductForOrder(req.params.id, io))
    }) 

    router.post('/markOrderStatus', authenticator, async (req, res) => {
        const data = req.body; // Contains status, orderId, and productid
        const result = await OrderService.markOrderStatus(data, io);
    
        if (result.success) {
            res.json({ success: true, data: result.order });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    });
    




    
    return router;
  };