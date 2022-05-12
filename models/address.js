const mongoose = require('mongoose')

const address = mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    phone_number:{
        type:String,
        required:true
    },
    street:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    postal:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Address', address)