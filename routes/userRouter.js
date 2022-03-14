const express = require('express')
const Router = express.Router()

const User = require('../models/User')

const UserOrder = require('../models/userOrder')
const GuestOrder = require('../models/guestOrder')

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
                res.send("success")
            })
        }catch(e){
            console.log(e)
        }
    }else{
       
       userOrder.items = [...req.body.items],
       userOrder.subtotal = req.body.subtotal
       try{
            await userOrder.save().then(doc =>{
                res.send("success")

            })
        }catch(e){
            console.log("Problem with saving")
        }
    }
})

Router.post('/:id/transfer/:guest', authUser, async(req, res)=>{
    console.log("Transferring cart to user")

    //check if user already has an unfulfilled order
    const userOrder = await UserOrder.findOne({userId:req.params.id, fulfilled:false})
    //make sure a cart with the guestid exists
    const guestOrder = await GuestOrder.findOne({guestId:req.params.guest, fulfilled:false})

    if(userOrder == null && guestOrder != null){
        console.log("Creating a new user order")

        //creating new cart with previous guest item
        let orderData = new UserOrder({
            userId: req.params.id,
            items: [...guestOrder.items],
            subtotal:guestOrder.subtotal
        })

        try{
            await orderData.save().then(doc =>{
                res.send("success")
            })

            //deleting guest order
            await guestOrder.delete()
        }catch(e){
            console.log(e)
        }
    }else{
        console.log("Updating existing user order")

        //consolidating items, quantities, and total price of existing and guest cart
        guestOrder.items.map((guestItem)=>{
            let exist = false;
            userOrder.items.map((userItem)=>{
                if(guestItem.itemId == userItem.itemId){
                    userItem.quantity+=guestItem.quantity
                    exist=true
                    return
                }
            })
            if(!exist){
                userOrder.items.push(guestItem)
            }
        })
        userOrder.subtotal += guestOrder.subtotal

        try{
            await userOrder.save().then(doc =>{
                res.send("success")
            })

            //deleting guest orders
            await guestOrder.delete()
        }catch(e){
            console.log(e)
        }
        
    }


})

Router.get('/:id/cart', authUser, async(req, res) =>{
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