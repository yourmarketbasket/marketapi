const express = require('express');
const PaymentService = require('../Services/paymentService');
const authenticator = require('../middleware/authenticator');
const Payment = require('../models/payment');
const Order = require('../models/orders');
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
    const validated = await PaymentService.validateCartCheckoutAmount(req.body.amount, req.body.userid, req.body.deliveryfee);
    if(validated.success){
        const sor = await PaymentService.pesapalSubmitOrderRequest(req.body);
        res.json(sor)
    }else{
        res.send({status:401, message: validated.message})
    }
    
});
router.get('/pesapalTransactionStatus/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await PaymentService.processPesapalTransactionStatus(id);

        if (result.success) {
            return res.json(result.data);
        } else {
            return res.status(500).json({ message: result.message });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/refreshPesapalTransactionStatus/:id', async (req, res) => {
    const transactionRef = req.params.id;

    try {
        // Fetch the transaction using the provided reference
        const transaction = await Payment.findOne({ reference: transactionRef });

        if (!transaction) {
            const deleteOrder = await Order.deleteOne({transactionID: transactionRef})
            if(deleteOrder){
                return res.status(200).json({success:true, message:"Order Deleted"});
            }else{
                throw new Error("Error: Transaction not found");
            }
        }

        // Process the Pesapal transaction status
        const result = await PaymentService.processPesapalTransactionStatus(transaction.trackingid);

        if (result.success) {
            return res.json({success:true, data: result.data});
        }

        // Handle specific failure scenarios
        if (result.message === "Failed" && result.data.status === '200') {
            const failedUpdate = await PaymentService.updateFailedPesapalPayment(transactionRef, result.message);

            if (failedUpdate) {
                return res.status(200).json({success:true, message: failedUpdate });
            } else {
                return res.status(500).json({success:true, message: "Failed to update transaction status" });
            }
        }

        return res.status(500).json({ message: "Error processing transaction", details: result });
    } catch (error) {
        console.error("Error refreshing Pesapal transaction status:", error);
        return res.status(500).json({ message: "Internal server error", details: error.message });
    }
});



router.post('/pesapalRefund/:id', async (req, res)=>{
    const id = req.params.id;
    // console.log(id)
    const status = await PaymentService.pesapalRefund(id);
    res.json(status)
    
});
// jenga api routes
router.post('/authenticate-merchant', async (req, res) => {
    try {
        const jengaResponse = await PaymentService.authenticateMerchant();
        res.status(200).json(jengaResponse);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  



module.exports = router;