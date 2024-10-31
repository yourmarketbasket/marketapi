const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the RequestLog Schema
const requestLogSchema = new Schema({
    ip: {
        type: String,
        required: true,
    },
    route: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    interval: {
        type: Number, // Time difference (in milliseconds) from the previous request
    },
    status: {
        type: String,
        enum: ['allowed', 'blocked'], // Status of the request
        required: true,
    },
    message: {
        type: String, // Reason for blocking if applicable
    },
});

// Compile the schema into a model
const RequestLog = mongoose.model('RequestLog', requestLogSchema);
module.exports = RequestLog;
