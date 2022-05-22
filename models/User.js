const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    first_name:{
        type: String,
        required: true
    },
    last_name:{
        type: String,
        required: true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    createdAt:{
        type:String,
        default:new Date()
    }
})

module.exports = mongoose.model('User', userSchema)