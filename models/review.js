const mongoose = require('mongoose')

const Review = mongoose.Schema({
    userId:{
        type:String,
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
    productId:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Review', Review)