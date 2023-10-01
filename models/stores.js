const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    storename: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    rating: {
        type:Number
    },
    storetype:{
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    location: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    description:{
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    avatar:{
        type: String,
        required: true,
        min: 3,
        max: 255

    },
    // Add this line:
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
