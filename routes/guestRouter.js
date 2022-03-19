const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const GuestOrder = require('../models/guestOrder')
const Reciept = require('../models/reciept')


//route to update guest cart
Router.post('/:id/cart/update', async (req,res)=>{

    console.log("Ready to update cart for guest")
    
    //find if a cart exists for the guest that is not fulfilled
    const guestOrder = await GuestOrder.findOne({guestId: req.params.id, fulfilled:false})

    if(guestOrder != null && req.body.items.length == 0){
        await guestOrder.delete().then(()=>{
            console.log("Successfully deleted order")
            res.send({message:"Success"})
            
        })
        return
    }


    if(guestOrder == null){
        console.log("here")
        //create guest order if none
        let orderData = new GuestOrder({
            guestId: req.params.id,
            ...req.body
        })

        console.log(orderData)
        try{
            await orderData.save().then(doc =>{
                res.send({message:"Success"})
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
                    res.send({message:"Success"})
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
    }else{
        res.send({message:"No cart"})
    }


})


//handling payment
Router.post('/:id/pay', async(req, res)=>{
    console.log("Processing payment")

    //find the cart for the guest
    const guestOrder = await GuestOrder.findOne({guestId: req.params.id, fulfilled:false})

    if(guestOrder != null){
        
        let reciept = new Reciept({
            order_id:guestOrder._id,
            email:req.body.email,
            amount:guestOrder.subtotal,
            confirmation:req.body.confirmation
        })

        guestOrder.fulfilled =true
        guestOrder.paymentId = reciept._id

        try{
            await reciept.save().then(async doc =>{
                res.send(doc)
                console.log(reciept)
            })
            await guestOrder.save()
        }catch(e){
            console.log("Problem with saving")
        }
    }

})


module.exports = Router