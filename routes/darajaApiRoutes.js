const express = require('express');
const Payment = require('../models/payment')
const router = express.Router();

const authenticator = require('../middleware/authenticator');

router.post('/callbackUrl', authenticator, async (req,res)=>{
    console.log(await req.body)
});
router.post('/resultUrl', async (req,res)=>{
    console.log(await req.body)
});
router.post('/timeout', async (req,res)=>{
    console.log(await req.body)
});
router.post('/confirmationUrl', async (req,res)=>{
    console.log(await req.body)
});
router.post('/validationUrl',async (req,res)=>{
    console.log(await req.body)
});
router.post('/pesaPallIPNResponse', async (req,res)=>{
    // add to the database
    const response = req.body;
    console.log(response);
    if(req.body){
        // check if the record exists
        const exists = await Payment.findOne({trackingid:response.OrderTrackingId});
        if(!exists){
            const newRecord = await Payment.create({
                trackingid: response.OrderTrackingId,
                reference: response.OrderMerchantReference,
            });

        }

    }

});


module.exports = router;