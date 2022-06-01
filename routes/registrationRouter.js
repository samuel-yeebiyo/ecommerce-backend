const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
require('dotenv').config()

const authenticateToken = require('../middleware/auth')

const Shop = require('../models/shop')

Router.post('/', async (req,res)=>{
    let email_exists = await User.findOne({email:req.body.email})
    if(email_exists == null){
        try{
            
            //hash password
            const salt = await bcrypt.genSalt();
            const hashedPass = await bcrypt.hash(req.body.password , salt);

            //create user with hashed password
            let user = new User({
                first_name: req.body.first_name,
                last_name:req.body.last_name,
                email:req.body.email,
                password: hashedPass,
            })

            //save user to the database
            try{
                user = await user.save().then(doc => {

                    console.log(`User ${doc.first_name} created`)
                    
                    let accessToken = jwt.sign({
                        id:doc._id,
                        shopId:""
                    }, process.env.JWT_ACCESS)

                    let refreshToken = jwt.sign({
                        id:doc._id,
                        shopId:""
                    }, process.env.JWT_REFRESH)


                    res.send({ id: doc._id, shopId: doc.shopId, accessToken:accessToken, refreshToken:refreshToken});
                })

            }catch(e){
                console.log("Problem encountered with saving user");
                res.status(500).send({message: "Failed to save"})
                console.log(e)
            }
        }
        catch (e){
            res.status(500).send("Failed to hash password")
        }        
    }else{
        res.status(500).send("User exists")
        console.log("User exists")
    }
})

Router.post('/seller', authenticateToken, async (req, res)=>{

    const {id} = req.user

    console.log("Called seller endpoint")
    let user = await User.findOne({_id:id})
    
    if(user){
        
        let shop = new Shop({
            seller:user._id,
            name:req.body.name,
            image:req.body.image,
            description:req.body.description,
            publicKey:req.body.pubkey,
            pathname:req.body.pathname
        })

        console.log({shop})
        
        try{
            await shop.save().then(doc => {
                console.log(doc);

                let accessToken = jwt.sign({
                    id:user._id,
                    shopId:doc._id
                }, process.env.JWT_ACCESS, {expiresIn: '15s'})

                let refreshToken = jwt.sign({
                    id:user._id,
                    shopId:doc._id
                }, process.env.JWT_REFRESH, {expiresIn: '15s'})
                
                res.send({id:doc._id, accessToken:accessToken, refreshToken:refreshToken });
            })

            console.log("Shop saved")
            user.save().then((doc)=>console.log({doc}))


        }catch(e){
            console.log("Problem encountered");
        }

    }else res.send({message:"failed"})
})

module.exports = Router