const mongoose = require('mongoose')

const Sale = require('./sales')

const Shop = mongoose.Schema({
    seller:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User',
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
        type:[mongoose.SchemaTypes.ObjectId],
        default:[],
        ref:"Sale"
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
        type:[mongoose.SchemaTypes.ObjectId],
        default:[],
        ref:'Product'
    },
    pathname:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        default:0,
    },
    createdAt:{
        type:String,
        default:new Date()
    }
})

module.exports = mongoose.model('Shop', Shop)