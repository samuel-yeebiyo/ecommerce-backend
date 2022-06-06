const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const Shop  = require('..//models/shop')
const bcrypt = require('bcrypt')

const redis = require('../lib/redis')
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
            }, process.env.JWT_ACCESS, {expiresIn: '15s'})
            
            let refreshToken = jwt.sign({
                id:user._id,
                shopId:id
            }, process.env.JWT_REFRESH)

            await redis.setEx(user._id.valueOf(), 2592000, refreshToken)
            console.log('saved to redis')

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