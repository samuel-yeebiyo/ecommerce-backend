const mongoose = require('mongoose')

const Tags = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    products:{
        type:[String],
        required:true
    }
})

module.exports = mongoose.model('Tags', Tags)