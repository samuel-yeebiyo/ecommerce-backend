const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name:{
        type: String,
    },
    price:{
        type:Number,
    },
    desc:{
        type:String,
    },
    material:{
        type:String
    },
    diameter:{
        type:String
    },
    size:{
        type:String
    },
    pathname:{
        type:String
    }
})

module.exports = mongoose.model('Product', productSchema)