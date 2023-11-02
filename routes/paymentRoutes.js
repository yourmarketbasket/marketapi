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
    // console.log(req.body.amount)
    const validated = await PaymentService.validateCartCheckoutAmount(req.body.amount, req.body.userid, req.body.deliveryfee);
    if(validated){
        const sor = await PaymentService.pesapalSubmitOrderRequest(req.body);
        res.json(sor)
    }else{
        res.send({status:401, message: 'Cart Changed Please Refresh and Checkout Again'})
    }
    
});
router.get('/pesapalTransactionStatus/:id', async (req, res)=>{
    const id = req.params.id;
    const status = await PaymentService.getPesapalTransactionStatus(id);
    if(status.payment_status_description=="Completed" && status.status==200){
        // update the payment status
        const update = await PaymentService.updatePaymentStatus(id, status)
        if(update){
            res.json(status)

        }else{
            console.log("error updating the payment")
        }
    }else{
        res.json(status)
    }
});
router.post('/pesapalRefund/:id', async (req, res)=>{
    const id = req.params.id;
    // console.log(id)
    const status = await PaymentService.pesapalRefund(id);
    res.json(status)
    
});


module.exports = router;