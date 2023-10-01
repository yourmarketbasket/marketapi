const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    rejected: {
        type: Boolean,
    },
    rejectionReason: {
        type: String
    },
    storeid: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    subcategory: {
        type: String,
        required: true,
    },
    model: {
        type: String,
    },
    description:{
        type: String,
        required: true,
    },
    bp:{
        type: Number,
        required: true,
    },
    sp:{
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    avatar:{
        type: [String],
        required: true,
        
    },
    quantity:{
        type: Number,
        required: true, 
    },
    features:{
        type: [String],

    },    
    approved:{
        type: Boolean,
        default: false
    },
    verified:{
        type: Boolean,
        default: false
    },
    sold:{
      type: Number,
    },
    remaining:{
      type: Number,
    },
    discount: {
        type: Number
    },
    rating: {
        type: Number
    },
    
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;