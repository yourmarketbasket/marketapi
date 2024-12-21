const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the EventLog Schema
const eventLogSchema = new Schema({
    type: {
        type: String,
        enum: ['request', 'error', 'system'], // Types of events
        required: true,
    },
    ip: {
        type: String, // IP address of the client (if applicable)
    },
    route: {
        type: String, // Route accessed (for request logs)
    },
    method: {
        type: String, // HTTP method (GET, POST, etc.)
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    statusCode: {
        type: Number, // HTTP status code (for request logs)
    },
    message: {
        type: String, // Error message or additional details
    },
    userId: {
        type: mongoose.Types.ObjectId, // Reference to a user (if applicable)
        ref: 'User',
    },
    meta: {
        type: Object, // Additional metadata for more flexibility
    },
});

// Compile the schema into a model
const EventLog = mongoose.model('EventLog', eventLogSchema);
module.exports = EventLog;
