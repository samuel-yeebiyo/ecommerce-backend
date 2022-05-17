const mongoose = require('mongoose')
const Review = require('./review')

const productSchema = mongoose.Schema({
    shop:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Shop',
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
        type:[mongoose.SchemaTypes.ObjectId],
        ref:'Review',
        default:[]
    },
    revenue:{
        type:Number,
        default:0
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
    },
    rating:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
})

productSchema.index({name:'text', rawTags:'text'})

module.exports = mongoose.model('Product', productSchema)