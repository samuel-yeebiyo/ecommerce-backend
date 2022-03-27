const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    shopId:{
        type:String,
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
    category:{
        type:String,
        default:""
    },
    primary:{
        type:String
    },
    secondary:{
        type:[String]
    },
    pathname:{
        type:String
    }
})

module.exports = mongoose.model('Product', productSchema)