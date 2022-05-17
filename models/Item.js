const mongoose = require('mongoose')

const item = mongoose.Schema({
    product:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:'Product'
    },
    quantity:{
        type:Number,
        required:true
    }
})

module.exports = item

