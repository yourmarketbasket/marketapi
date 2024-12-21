const mongoose = require('mongoose');
const { DataSessionPage } = require('twilio/lib/rest/wireless/v1/sim/dataSession');
const Schema = mongoose.Schema;

const driverSchema = new Schema({
    storeID: {
        type: String,
        required: true

    },
    userID: {
        type: String,
        required: [true, 'User ID is required']

    },
    vehicleDetails: {
        registrationNumber: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['bike', 'car', 'van', 'truck'],
            required: true
        },
        color: {
            type: String,
            required: true
        },
        insuranceNumber: {
            type: String,
            required: true
        },
        insuranceExpiry: {
            type: Date,
            required: true
        },
        insuranceDocument: {
            type: String, 
            required: true
        }
    },
    licenseDetails: {
        licenseNumber: {
            type: String,
            required: true,
        },
        licenseDocument: {
            type: String,
            required: true,
        },
        issuingCountry: {
            type: String,
            required: true
        },
        issueDate: {
            type: Date,
            required: true
        },
        expiryDate: {
            type: Date,
            required: true
        }
    },
    emergencyContact: {
        name: {
            type: String,
            required: true
        },
        contactNumber: {
            type: String,
            required: true
        },
    },
    bankDetails: {
        accountNumber: {
            type: String
        },
        bankName: {
            type: String
        },
        branchCode: {
            type: String
        }
    },
    verificationStatus: {
        identityVerified: {
            type: Boolean,
            default: false
        },
        vehicleVerified: {
            type: Boolean,
            default: false
        },
        backgroundCheck: {
            type: Boolean,
            default: false
        }
    },
    ratingsAndFeedback: {
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        feedback: [
            {
                userID: {
                    type: String
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
    availability: {
        isAvailable: {
            type: Boolean,
            default: true
        },
        workingHours: {
            start: {
                type: String // e.g., "09:00 AM"
            },
            end: {
                type: String // e.g., "06:00 PM"
            }
        }
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Add any additional methods or hooks if needed

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;
