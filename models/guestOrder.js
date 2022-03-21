const mongoose = require('mongoose')

const Item = require('./Item')

const guestOrder = mongoose.Schema({
    guestId:{
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
        default: ""
    },
    fulfilled:{
        type:Boolean,
        required:true,
        default:false
    },
    expiry:{
        type:Date,
        default: new Date().setDate(new Date().getDate()+14)
    }
})

module.exports = mongoose.model('GuestOrder', guestOrder)