const mongoose = require('mongoose')

const Sale = mongoose.Schema({
    shop:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:'Shop'
    },
    product:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true
    },
    quantity:{
        type:Number,
        required:true,
    },
    revenue:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:new Date()
    }
})

module.exports = mongoose.model("Sale", Sale)