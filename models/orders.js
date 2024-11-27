const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    transactionID: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
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
        type: String,
        required: true,
    },
    buyerid: {
        type: String,
        required: true,
    },
    deliveryfee: {
        type: Number,
        required: true,
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
    },
    orderStatus: [
        {
            productid: String,
            status: {
                type: String,
                enum: ['processing', 'confirm', 'pack', 'dispatch', 'deliver', 'complete'],
                required: true
            }
        }
    ],
    overallStatus: {
        type: String,
        enum: ['processing', 'confirmed', 'packed', 'dispatched', 'partialCompleted', 'delivered', 'completed'],
        default: 'processing', // Default to 'processing'
    },
});

// Method to calculate the overall status
orderSchema.methods.calculateOverallStatus = function () {
    // Handle empty orderStatus array
    if (!this.orderStatus || this.orderStatus.length === 0) {
        this.overallStatus = 'processing'; // Default to 'processing' if no statuses are available
        return this.overallStatus;
    }

    const productStatuses = this.orderStatus.map(item => item.status);

    if (productStatuses.every(status => status === 'complete')) {
        this.overallStatus = 'completed';
    } else if (productStatuses.every(status => status === 'deliver')) {
        this.overallStatus = 'delivered';
    } else if (productStatuses.every(status => status === 'dispatch')) {
        this.overallStatus = 'dispatched';
    } else if (productStatuses.every(status => status === 'pack')) {
        this.overallStatus = 'packed';
    } else if (productStatuses.every(status => status === 'confirm')) {
        this.overallStatus = 'confirmed';
    } else if (productStatuses.some(status => status === 'complete')) {
        this.overallStatus = 'partialCompleted';
    } else {
        this.overallStatus = 'processing'; // Default fallback for unprocessed items
    }

    return this.overallStatus;
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
