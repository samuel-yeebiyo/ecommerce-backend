const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const GuestOrder = require('../models/guestOrder')

Router.post('/:id/cart/update', async (req,res)=>{

    console.log("Ready to update cart for guest")
    
    const guestOrder = await GuestOrder.findOne({guestId: req.params.id, fulfilled:false})

    if(guestOrder == null){
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

    const guestOrder = await GuestOrder.findOne({guestId: req.params.id, fulfilled:false})

    if(guestOrder != null){
        res.send({
            items:guestOrder.items,
            subtotal:guestOrder.subtotal
        })
    }


})

module.exports = Router