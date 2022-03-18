const mongoose = require('mongoose')

const receipt = mongoose.Schema({
    order_id:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    confirmation:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Reciept', receipt)