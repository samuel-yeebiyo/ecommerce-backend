const mongoose = require('mongoose')

const Sale = require('./sales')

const Shop = mongoose.Schema({
    sellerId:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    sales:{
        type:[Sale],
        default:[]
    },
    totalRevenue:{
        type:Number,
        required:true,
        default:0
    },
    publicKey:{
        type:String,
        required:true
    },
    listings:{
        type:[String],
        required:true
    },
    pathname:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        default:0,
    }
})

module.exports = mongoose.model('Shop', Shop)