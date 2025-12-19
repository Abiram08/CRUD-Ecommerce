const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id : {
        type: Number,
        required: true,
        unique: true,
    },
    name:{
        type : String,
        required:true,
    },
    price:{
        type: Number,
        required:true,
        
    },
    quantity:{
        type : Number,
        required:true,
    },
    color:{
        type: String,
    },
    description :{
        type : String,
        required: true,
    }

});

module.exports = mongoose.model('Product',productSchema);