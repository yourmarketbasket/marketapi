const mongoose = require('mongoose')

const transactionsSchema = new mongoose.Schema({
    trackingId: {
        type:String,
        required:true
    },
    method:{
        type: String,
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    paymentStatus:{
        type: String,
        required: true
    },
    confirmationCode:{
        type: String,
        required: true
    },
    paymentStatusDescription:{
        type:String,
        required:true
    },
    currency:{
        type:String,
        required:true
    },
    merchantRef: {
        type:String,
        required:true
    },
    status: {
        type:String,
        required:true,
    },


})

const Transactions = mongoose.model('Transactions', transactionsSchema);
module.exports = Transactions;