const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the StaticImage Schema
const staticImageSchema = new Schema({
    managerId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a Manager model to reference
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['brand', 'categories', 'carousel'], // Possible categories for images
        required: true,
    },
    dateUploaded: {
        type: Date,
        default: Date.now, // Automatically sets the current date and time
    },
    approved: {
        type: Boolean,
        default: false, // Set to false initially until approved by an admin or manager
    },
    fileSize: {
        type: Number, // Optional field to store image size in bytes
    },
    isActive: {
        type: Boolean,
        default: true, // If the image is still active or archived
    },
});

// Compile the schema into a model
const StaticImage = mongoose.model('StaticImage', staticImageSchema);
module.exports = StaticImage;
