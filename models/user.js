const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    rating:{
        type:Number,
    },
    driver: {
        type: Boolean,
        default: false

    },
    assistant: {
        storeid: [
            {
                type: String, // Array of store IDs
            }
        ],
        active: {
            type: Boolean,
            default: false
        },
        rating: {
            type: Number,
            default: 5
        },
        packed: {
            type: Number,
            default: 0
        },
        reviews: [
            {
                userID: {
                    type: String
                },
                storeID: {
                    type: String,
                },
                comment: {
                    type: String
                },
                rating: {
                    type: Number,
                    min: 0,
                    max: 5
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },    
    
    lname: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    phone: {
        type: String,
        required: true,
        min: 10,
        max: 10,
        unique: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    zipcode: {
        type: String,
        required: true,
        min: 6,
        max: 6
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    address: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    location: {
        type: mongoose.Schema.Types.Mixed,
        min: 6,
        max: 255
    },
    city: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    approved: {
        type: Boolean,
        default: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    qa: {

    },
    moderator: {

    },
    manager: {

    },
    support: {

    },
    active: {
        type: Boolean,
        default: true
    },
    client: {
        type: Boolean,
        default: true,
    },
    vendor: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        // required : true,
    },
    verified: {
        required: true,
        type: Boolean,
        default: false
    },
    verificationAttempts: {
        type: Number,
        default: 0,
        required: true
    },
    lastVerificationAttemptTime: {
        type: Date,
        default: Date.now,
        required: true
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;