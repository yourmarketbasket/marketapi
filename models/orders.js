const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Import Schema from mongoose

const orderSchema = new Schema({
    transactionID: {
        type: String,
        required: true
    },
    items: {
        type: Number, 
    },
    products: {
        type: Schema.Types.Mixed,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    buyername: {
        required:true,
        type: String, 
    },
    buyerid: {
        type: String, 
        required: true,
    },
    deliveryfee: {
        type: Number,
        required:true,
    },
    countryCode: {
        type: String,
    },
    zipCode: {
        type: String, 
    },
    destination: {
        type: Schema.Types.Mixed,
        required: true
    },
    origin: {
        type: Schema.Types.Mixed,
        required: true,
    },
    paymentStatus: {
        type: String,
        required: true
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
