const mongoose  = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    amount:{
        type:Number,
    },
    items: {
        type: Number,
    },
    buyerid: {
        type:String,
        required: true
    },
    products: {
        type: [Schema.Types.Mixed],
        required:true
    },
    completed: {
        type: Boolean
    }
  
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart