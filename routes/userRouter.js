const express = require('express')
const Router = express.Router()

const User = require('../models/User')

const UserOrder = require('../models/userOrder')
const GuestOrder = require('../models/guestOrder')
const Reciept = require('../models/reciept')
const Shop = require('../models/shop')

async function authUser (req, res, next){
    let user = await User.findOne({_id: req.params.id})
    if(user){
        next()
    }else return
}

Router.post('/:id/cart/update', authUser , async (req,res)=>{

    
    const userOrder = await UserOrder.findOne({userId: req.params.id, fulfilled:false})


    if(userOrder != null && req.body.items.length == 0){
        await userOrder.delete().then(()=>{
            console.log("Successfully deleted order")
            res.send({message:"Success"})
            
        })
        return
    }

    if(userOrder == null){
        console.log("Creating a new user order")
        let orderData = new UserOrder({
            userId: req.params.id,
            ...req.body
        })

        console.log(orderData)

        try{
            await orderData.save().then(doc =>{
                res.send({message:"Success"})
            })
        }catch(e){
            console.log(e)
        }
    }else{
       
       userOrder.items = [...req.body.items],
       userOrder.subtotal = req.body.subtotal
       try{
            await userOrder.save().then(doc =>{
                res.send({message:"Success"})
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


        console.log(orderData)

        try{
            await orderData.save().then(doc =>{
                console.log("Saving was a success")
                res.send({message:"Success"})
            })

            //deleting guest order
            await guestOrder.delete()
        }catch(e){
            console.log("Not saved")
            console.log(e)
        }
    }else if(guestOrder == null){
        res.send({message: "Guest order is empty"})
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
                console.log(doc)
                res.send({message:"Success"})
            })

            //deleting guest orders
            await guestOrder.delete()
        }catch(e){
            console.log("Failed to save")
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
    }else{
        res.send({message:"No cart"})
    }

})

//get completed orders
Router.get('/:id/orders', authUser, async(req, res)=>{
    console.log("getting completed orders")

    const userOrders = await UserOrder.find({userId:req.params.id, fulfilled:true})

    if(userOrders != null){
        res.send({
            orders:userOrders
        })
    }else{
        res.send({message:"No fulfilled orders"})
    }
})

//handling payment
Router.post('/:id/pay', authUser, async(req, res)=>{
    console.log("Processing payment")

    //find the cart for the guest
    const userOrder = await UserOrder.findOne({userId: req.params.id, fulfilled:false})
    const user = await User.findOne({_id: req.params.id})

    if(userOrder != null){
        
        let reciept = new Reciept({
            order_id:userOrder._id,
            email:user.email,
            amount:userOrder.subtotal,
            confirmation:req.body.confirmation
        })

        userOrder.fulfilled =true
        userOrder.paymentId = reciept._id

        try{
            await reciept.save().then(async doc =>{
                res.send(doc)
                console.log(reciept)
            })
            await userOrder.save()
        }catch(e){
            console.log("Problem with saving")
        }
    }

})


//get relevant user information
Router.get('/:id/get', authUser, async(req, res)=>{
    const user = await User.findOne({_id: req.params.id})
    if(user!= null){
        let shopId = ""
        if(user.hasShop){
            const shop = await Shop.findOne({sellerId:user._id})
            shopId = shop._id
        }
        res.send({
            hasShop:user.hasShop,
            shopID:shopId
        })
    }
})

Router.get('/:id/get-shop', authUser, async(req, res)=>{
    const user = await User.findOne({_id:req.params.id, hasShop:true})
    if(user != null){
        const shop = await Shop.findOne({sellerId:user._id})
        if(shop != null){
            res.send({
                listings:shop.listings.length,
                sales:shop.sales.length,
                revenue:shop.totalRevenue
            })
        }
    }
})


module.exports = Router