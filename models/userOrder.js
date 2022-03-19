const mongoose = require('mongoose')

const Item = require('./Item')

const userOrder = mongoose.Schema({
    userId:{
        type: String,
        required:true
    },
    items:{
        type: [Item]
    },
    subtotal:{
        type: Number,
        required:true,
        default: 0
    },
    paymentId:{
        type:String,
        default:""
    },
    fulfilled:{
        type:Boolean,
        required:true,
        default:false
    },
    expiry:{
        type:Date,
        default: new Date().setDate(new Date().getDate()+21)
    }
})

module.exports = mongoose.model('UserOrder', userOrder)