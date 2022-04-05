const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const bcrypt = require('bcrypt')

Router.post('/', async (req,res)=>{
    const user = await User.findOne({username: req.body.username})
    if(user==null){
        console.log(user)
        console.log("User not found");
    }else try{
        if( await bcrypt.compare(req.body.password, user.password)){
            console.log("user logged in")
            res.json({id:user._id, hasShop:user.hasShop})
        }else{
            console.log("Wrong password")
        }
    }catch(e){
        res.status(500).send();
    }
})

module.exports = Router