const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    productid:{
        type:String,
        required:true,
    },
    userid: {
        required:true,
        type:String,
    },
    favorite:{
        type:Boolean,
        required:true
    }
})

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite