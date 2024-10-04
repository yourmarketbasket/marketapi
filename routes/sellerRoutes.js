const express = require('express');
const SellerServices = require('../Services/serllerServices');
const router = express.Router();
const authenticator = require('../middleware/authenticator')

router.post('/updateSettings',authenticator, async (req, res)=>{
    const update = await SellerServices.updateSellerSettings(req.body);
    res.json(update)

})
router.get('/storelocation/:id',authenticator, async (req,res)=>{
    const userid = req.params.id;
    const locations = await SellerServices.getStoreLocations(userid);
    res.json(locations)
})



module.exports = router;