const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
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
    SKU: {
        type: String,
        required: true,
    },
    subcategory: {
        type: String,
        required: true,
    },
    color: {
        type: [String],    
        required: true   

    },
    addedBy: {
        type: String,
        required: true,
    },
    size: {
        type: [String], 
        required:true       
    },
    group: {
        type: String,
        required: true
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
    reviews: {
        averageRating:Number,
        users: [
          {
            userid: String,
            data: {
                feedback:String,
                images:[],
                rating:Number
            },
          },
        ],
      },
    popular: {
        type: Number
    }, 
    trend: {
        type: Number
    },
    views: [
        {
          totalViews: Number,
          users: [
            {
              userid: String,
              views: Number,
            },
          ],
        },
    ],
});



const Product = mongoose.model('Product', productSchema);
module.exports = Product;