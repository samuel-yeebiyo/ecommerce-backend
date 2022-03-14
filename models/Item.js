const mongoose = require('mongoose')

const item = mongoose.Schema({
    itemId:{
        type:Number,
        required:true
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
    }
})

module.exports = item

