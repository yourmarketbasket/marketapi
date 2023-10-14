const express = require('express');
const router = express.Router();

router.post('/callbackUrl', async (req,res)=>{
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
router.post('/validationUrl', async (req,res)=>{
    console.log(await req.body)
});
router.post('/pesaPallIPNResponse', async (req,res)=>{
    console.log(await req.body)
});


module.exports = router;