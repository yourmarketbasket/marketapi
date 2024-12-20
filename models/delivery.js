const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliverySchema = new Schema({
    deliveryID: {
        type: String,
        required: true,
        unique: true
    },
    orderID: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    vehicle: {
        registrationNumber: {
            type: String,
            required: true
        },
        model: {
            type: String
        },
        type: {
            type: String,
            enum: ['bike', 'car', 'van', 'truck'],
            required: true
        },
        owner: {
            type: String,
            required: true
        }
    },
    driver: {
        name: {
            type: String,
            required: true
        },
        licenseNumber: {
            type: String,
            required: true
        },
        contactNumber: {
            type: String,
            required: true
        }
    },
    origin: {
        coordinates: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        }
    },
    destination: {
        coordinates: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        }
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'inTransit', 'delivered', 'failed'],
        default: 'pending'
    },
    items: [
        {
            productID: String,
            productName: String,
            quantity: Number,
            totalCost:Number
        }
    ],
    deliveryFee: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    estimatedTimeOfArrival: {
        type: Date
    },
    actualTimeOfArrival: {
        type: Date
    }
});

// Add any additional methods or virtuals if needed

const Delivery = mongoose.model('Delivery', deliverySchema);
module.exports = Delivery;
