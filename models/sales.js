const mongoose = require('mongoose')

const Sale = mongoose.Schema({
    product:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true
    },
    quantity:{
        type:Number,
        required:true,
    },
    revenue:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model("Sale", Sale)