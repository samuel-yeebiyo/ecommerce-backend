const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const bcrypt = require('bcrypt')

const Shop = require('../models/shop')

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
                user = await user.save().then(doc => {
                    console.log(doc);
                    res.send({ id: doc._id, hasShop: doc.hasShop});
                  })
                console.log("User saved")
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

Router.post('/seller', async (req, res)=>{
    console.log("Called seller endpoint")
    let user = await User.findOne({_id:req.body.id})
    if(user){
        let shop = new Shop({
            sellerId:user._id,
            name:req.body.name,
            totalRevenue:0,
            publicKey:req.body.pubkey
        })
        user.hasShop = true
        try{
            await shop.save().then(doc => {
                console.log(doc);
                res.send({id:doc._id });
            })
            console.log("Shop saved")
            user.save()
        }catch(e){
            console.log("Problem encountered");
        }

    }else res.send({message:"failed"})
})

module.exports = Router