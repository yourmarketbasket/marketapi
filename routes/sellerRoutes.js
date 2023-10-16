const express = require('express');
const SellerServices = require('../Services/serllerServices');
const router = express.Router();

router.post('/updateSettings', async (req, res)=>{
    const update = await SellerServices.updateSellerSettings(req.body);
    res.json(update)

})



module.exports = router;