const mongoose = require('mongoose')

const Order = mongoose.Schema({
    user:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User',
        required:true
    },
    order:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'UserOrder',
        required:true
    },
    shop:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Shop',
        required:true
    },
    product:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Product',
        required:true
    },
    productName:{
        type:String,
        required:true
    },
    productImage:{
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
    address:{
        type:Object,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
})

module.exports = mongoose.model('Order', Order)