const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const UserOrder = require('../models/userOrder')

async function authUser (req, res, next){
    let user = await User.findOne({_id: req.params.id})
    if(user){
        next()
    }else return
}

Router.post('/:id/cart/update', authUser , async (req,res)=>{

    
    const userOrder = await UserOrder.findOne({userId: req.params.id, fulfilled:false})

    if(userOrder == null){
        console.log("Creating a new user order")
        let orderData = new UserOrder({
            userId: req.params.id,
            ...req.body
        })

        console.log(orderData)

        try{
            await orderData.save().then(doc =>{
                console.log(doc)
                res.status(200)
            })
        }catch(e){
            console.log(e)
        }
    }else{
       
       userOrder.items = [...req.body.items],
       userOrder.subtotal = req.body.subtotal
       try{
            await userOrder.save().then(doc =>{
                console.log(doc)
                res.status(200)
            })
        }catch(e){
            console.log("Problem with saving")
        }
    }
})


Router.get('/:id/cart', async(req, res) =>{
    console.log("Getting cart")

    const userOrder = await UserOrder.findOne({userId: req.params.id, fulfilled:false})

    if(userOrder != null){
        res.send({
            items:userOrder.items,
            subtotal:userOrder.subtotal
        })
    }


})






module.exports = Router