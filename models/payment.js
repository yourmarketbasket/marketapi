const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    trackingid: {
        type:String,
        required:true
    },
    currency: {
        type: String,
    },
    paymentStatus: {
        type: String,
    },
    reference: {
        type: String,
    },
    paymentAccount: {
        type:String,
    },
    method:{
        type:String,
    },
    amount: {
        type:Number,
    },
    date:{
        type:String,
    },
    confirmationCode:{
        type:String,
    },
    description:{
        type: String,
    },
    message: {
        type: String,
    }
})

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment