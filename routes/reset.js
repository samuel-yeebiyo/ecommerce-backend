const express = require('express')
const Router = express.Router()

//for clearing the database
const User = require('../models/User')
const Product  = require('../models/Product')
const Reciept = require('../models/reciept')
const Review = require('../models/review')
const Shop = require('../models/shop')
const userOrder = require('../models/userOrder')
const Tags = require('../models/tags')
const Order = require('../models/order')
const pendingReview = require('../models/pendingReview')
const Address = require('../models/address')

Router.get('/', async (req, res)=>{
   
    // await User.deleteMany({})
    // await Product.deleteMany({})
    // await Reciept.deleteMany({})
    // await Review.deleteMany({})
    // await pendingReview.deleteMany({})
    await Shop.deleteMany({})
    // await userOrder.deleteMany({})
    // await Tags.deleteMany({})
    // await Order.deleteMany({})
    // await Address.deleteMany({})

    res.send({message:"Completed"})
})

module.exports = Router