const mongoose = require('mongoose')

const item = mongoose.Schema({
    itemId:{
        type:String,
        required:true
    },
    shopId:{
        type:String,
        required:false
    },
    name:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    reviewed:{
        type:Boolean,
        required:true,
        default:false
    },
    image:{
        type:String,
        required:true
    }
})

module.exports = item

