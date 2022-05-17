const mongoose = require('mongoose')

const Review = mongoose.Schema({
    user:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String
    },
    name:{
        type:String
    },
    rating:{
        type:Number
    },
    description:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:new Date()
    },
    product:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Product',
        required:true
    },
    productName:{
        type:String,
    },
    image:{
        type:String,
    }
})

module.exports = mongoose.model('Review', Review)