const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const bcrypt = require('bcrypt')

Router.post('/', async (req,res)=>{
    let username_exists = await User.findOne({username: req.body.username})
    let email_exists = await User.findOne({email:req.body.email})
    if(username_exists == null && email_exists == null){
        try{
            
            //hash password
            const salt = await bcrypt.genSalt();
            const hashedPass = await bcrypt.hash(req.body.password , salt);

            //create user with hashed password
            let user = new User({
                username: req.body.username,
                email:req.body.email,
                password: hashedPass,
            })

            //save user to the database
            try{
                user = await user.save()
                console.log("User saved")
                //send response
            }catch(e){
                console.log("Problem encountered");
            }
        }
        catch (e){
            res.status(500).send("Failed")
        }        
    }else{
        console.log("User exists")
    }
})

module.exports = Router