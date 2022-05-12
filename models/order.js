const mongoose = require('mongoose')

const Order = mongoose.Schema({
    orderId:{
        type:String,
        required:true
    },
    shopId:{
        type:String,
        required:true
    },
    productId:{
        type:String,
        required:true
    },
    unitPrice:{
        type:Number,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Order', Order)