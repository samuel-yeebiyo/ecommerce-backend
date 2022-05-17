const mongoose = require('mongoose')

const pending = mongoose.Schema({
    user:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User',
        required:true
    },
    product:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:'Product'
    },
    deliveryDate:{
        type:Date,
        default:new Date()
    },
    order:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'UserOrder',
        required:true
    }
})

module.exports = mongoose.model("PendingReview", pending)