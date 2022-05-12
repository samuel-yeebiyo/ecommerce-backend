const mongoose = require('mongoose')

const pending = mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    productId:{
        type:String,
        required:true
    },
    deliveryDate:{
        type:Date,
        default:new Date()
    },
    orderNum:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("PendingReview", pending)