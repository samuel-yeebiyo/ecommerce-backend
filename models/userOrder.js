const mongoose = require('mongoose')

const Item = require('./Item')

const userOrder = mongoose.Schema({
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:"User"
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
    paid:{
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