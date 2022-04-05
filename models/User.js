const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username:{
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
    hasShop:{
        type:Boolean,
        require:true,
        default:false
    }
})

module.exports = mongoose.model('User', userSchema)