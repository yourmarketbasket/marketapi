const express = require('express');
const PaymentService = require('../Services/paymentService')
const router = express.Router();

router.post('/b2c', async (req, res)=>{
    const b2c = await PaymentService.B2C(req.body);
    res.json(b2c)
});
router.post('/toBusinessTillNumber', async (req, res)=>{
    const toTillNumber = await PaymentService.toBusinessTillNumber(req.body);
    res.json(toTillNumber)
});
router.post('/stk', async (req, res)=>{
    const stk = await PaymentService.mpesaExpress(req.body);
    res.json(stk)
});
router.post('/reversal', async (req, res)=>{
    const reversal = await PaymentService.Reversal(req.body);
    res.json(reversal)
});
router.post('/transaction_status', async (req, res)=>{
    const status = await PaymentService.transactionStatus(req.body);
    res.json(status)
});

module.exports = router;