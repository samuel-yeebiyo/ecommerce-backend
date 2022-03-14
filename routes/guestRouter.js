const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const GuestOrder = require('../models/guestOrder')


//route to update guest cart
Router.post('/:id/cart/update', async (req,res)=>{

    console.log("Ready to update cart for guest")
    
    //find if a cart exists for the guest that is not fulfilled
    const guestOrder = await GuestOrder.findOne({guestId: req.params.id, fulfilled:false})

    if(guestOrder == null){
        
        //create guest order if none
        let orderData = new GuestOrder({
            guestId: req.params.id,
            ...req.body
        })

        console.log(orderData)

        try{
            await orderData.save().then(doc =>{
                res.send("success")
            })
        }catch(e){
            console.log("Problem with saving")
        }
    }else{
       
        //update an existing cart
        guestOrder.items = [...req.body.items],
        guestOrder.subtotal = req.body.subtotal
        try{
                await guestOrder.save().then(doc =>{
                    res.send("success")
                })
            }catch(e){
                console.log("Problem with saving")
        }
    }  
})

Router.get('/:id/cart', async(req, res) =>{
    console.log("Getting cart")

    //find the cart for the guest
    const guestOrder = await GuestOrder.findOne({guestId: req.params.id, fulfilled:false})

    if(guestOrder != null){

        //send item and subtotal - relevant stuff
        res.send({
            items:guestOrder.items,
            subtotal:guestOrder.subtotal
        })
    }


})

module.exports = Router