const mongoose = require('mongoose')

const Sale = mongoose.Schema({
    productId:{
        type:String, 
        required:true
    },
    quantity:{
        type:Number,
        required:true,
    },
    revenue:{
        type:Number,
        required:true
    }

})

module.exports = Sale