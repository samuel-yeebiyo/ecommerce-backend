const mongoose = require('mongoose')
const Review = require('./review')

const productSchema = mongoose.Schema({
    shopId:{
        type:String,
        require:true
    },
    name:{
        type: String,
    },
    price:{
        type:Number,
    },
    desc:{
        type:String,
    },
    reviews:{
        type:[String],
        default:[]
    },
    category:{
        type:String,
    },
    primary:{
        type:String
    },
    secondary:{
        type:[String]
    },
    pathname:{
        type:String
    },
    rawTags:{
        type:String
    },
    tags:{
        type:[String]
    },
    views:{
        type:Number,
        default:0
    }
})

productSchema.index({name:'text', rawTags:'text'})

module.exports = mongoose.model('Product', productSchema)