const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const Shop  = require('..//models/shop')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

Router.post('/', async (req,res)=>{
    const user = await User.findOne({email: req.body.email})

    if(user==null){
        console.log(user)
        console.log("User not found");
    }else try{
        if( await bcrypt.compare(req.body.password, user.password)){
            console.log("user logged in")

            let shop = await Shop.findOne({seller: user._id})
            let id = shop ? shop._id : ""

            console.log(shop)

            let accessToken = jwt.sign({
                id:user._id,
                shopId:id
            }, process.env.JWT_ACCESS)
            console.log(accessToken)
            let refreshToken = jwt.sign({
                id:user._id,
                shopId:id
            }, process.env.JWT_REFRESH)
            console.log(refreshToken)

            res.send({ id: user._id, shopId:id, accessToken:accessToken, refreshToken:refreshToken});

            // res.json({id:user._id, hasShop:user.hasShop})
        }else{
            console.log("Wrong password")
        }
    }catch(e){
        res.status(500).send();
    }
})

module.exports = Router