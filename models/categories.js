const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    category: {
        type: String,
        required: true
    },
    subcategories: [{
        subcategory: {
            type: String,
            required: true
        },
        groups: [{
            group: { // Group names as a string
                type: String,
                required: true
            }
        }]
    }],
    updatedBy: {
        userID: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add pre-save hook for updating the timestamp
categorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
