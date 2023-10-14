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
router.post('/pesapalToken', async (req, res)=>{
    const token = await PaymentService.pesapalAuthtoken();
    res.json(token.token)
});
router.post('/registerPesapalIPN', async (req, res)=>{
    const register = await PaymentService.pesapalRegisterIPN();
    res.json(register)
});
router.post('/listIPNS', async (req, res)=>{
    const list = await PaymentService.listPesapalIPNS();
    res.json(list)
});
router.post('/pesapalSOR', async (req, res)=>{
    const list = await PaymentService.pesapalSubmitOrderRequest();
    res.json(list)
});
router.post('/pesapalTransactionStatus/:id', async (req, res)=>{
    const id = req.params.id;
    // console.log(id)
    const status = await PaymentService.getPesapalTransactionStatus(id);
    res.json(status)
});
router.post('/pesapalRefund/:id', async (req, res)=>{
    const id = req.params.id;
    // console.log(id)
    const status = await PaymentService.pesapalRefund(id);
    res.json(status)
});


module.exports = router;