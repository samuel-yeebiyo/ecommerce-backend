const express = require('express')
const Router = express.Router()

const User = require('../models/User')

const UserOrder = require('../models/userOrder')
const GuestOrder = require('../models/guestOrder')
const Reciept = require('../models/reciept')
const Shop = require('../models/shop')
const pendingReview = require('../models/pendingReview')
const Review = require('../models/review')
const Order = require('../models/order')
const Address = require('../models/address')

const authenticateToken = require('../middleware/auth')

async function authUser (req, res, next){
    let user = await User.findOne({_id: req.params.id})
    if(user){
        next()
    }else return
}


//updating cart
Router.post('/cart/update', authenticateToken , async (req,res)=>{

    const {id} = req.user
    
    const userOrder = await UserOrder.findOne({userId: id, fulfilled:false})


    // if(userOrder != null && req.body.items.length == 0){
    //     await userOrder.delete().then(()=>{
    //         console.log("Successfully deleted order")
    //         res.send({message:"Success"})
            
    //     })
    //     return
    // }

    if(userOrder == null){
        console.log("Creating a new user order")
        let orderData = new UserOrder({
            userId: id,
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

       console.log(userOrder)
       try{
            await userOrder.save().then(doc =>{
                res.send({message:"Success"})
            })
        }catch(e){
            console.log("Problem with saving")
        }
    }
})

//trasnferring userless cart to user
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

//fetching cart
Router.get('/cart', authenticateToken, async(req, res) =>{
    console.log("Getting cart")

    const {id} = req.user

    const userOrder = await UserOrder.findOne({userId: id, fulfilled:false})

    if(userOrder != null){
        res.send({
            items:userOrder.items,
            subtotal:userOrder.subtotal
        })
    }else{
        res.send({message:"No cart"})
    }

})

//handling payment
Router.post('/pay', authenticateToken, async(req, res)=>{
    console.log("Processing payment")

    const {id} = req.user

    //find the cart for the guest
    const userOrder = await UserOrder.findOne({userId: id, fulfilled:false})
    const user = await User.findOne({_id: id})

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

                await userOrder.save()
                res.send(doc)
                
                userOrder.items.map(async (item)=>{
                    let pastReview = await Review.findOne({userId:user._id, productId:item.itemId})
                    
                    if(pastReview == null){
                        let pastPendingReviews = await pendingReview.findOne({userId: user._id, productId:item.itemId})
                        
                        if(pastPendingReviews == null){

                            let newReview = new pendingReview({
                                userId:user._id,
                                productId:item.itemId,
                                orderNum:userOrder._id
                            })

                            try{
                                await newReview.save()
                            }catch(e){
                                console.log(e)
                                console.log("error")
                            }

                        }
                    }

                    const order = new Order({
                        orderId:userOrder._id,
                        shopId:item.shopId,
                        productId:item.itemId,
                        unitPrice:item.price,
                        quantity:item.quantity,
                        total:item.price*item.quantity,
                        status:'pending'
                    })

                    await order.save()

                })

            })
    
        }catch(e){
            console.log("Problem with saving")
        }
    }

})

//get relevant user information with id
Router.get('/:id/get', authUser, async(req, res)=>{
    const user = await User.findOne({_id: req.params.id})
    if(user!= null){
        let shopId = ""
        if(user.hasShop){
            const shop = await Shop.findOne({sellerId:user._id})
            shopId = shop._id
        }
        res.send({
            username:user.username,
            email:user.email,
            hasShop:user.hasShop,
            shopID:shopId
        })
    }
})

Router.get('/get', authenticateToken, async(req, res)=>{

    console.log("Getting")
    
    const {id} = req.user
    
    const user = await User.findOne({_id: id})
    
    if(user!= null){
        const shop = await Shop.findOne({sellerId:user._id})
        let shopId  = ""
        if(shop){
            shopId = shop._id
        }
        res.send({
            user:{
                id:user._id,
                first_name:user.first_name,
                last_name:user.last_name,
                email:user.email,
                shopId:shopId
            }
        })
    }
})

Router.get('/get/address', authenticateToken, async (req, res)=>{

    const {id} = req.user

    console.log("Getting address")

    const address = await Address.find({userId: id})

    if(address){
        res.send(address)
    }else{
        res.send({message:"Error"})
    }

})

Router.post('/add/address', authenticateToken, async (req, res)=>{

    const {id} = req.user

    console.log("Adding address")

    console.log(req.body)

    const address = new Address({
        userId:id,
        first_name:req.body.first_name,
        last_name:req.body.last_name,
        phone_number:req.body.phone_number,
        street:req.body.street,
        city:req.body.city,
        country:req.body.country,
        postal:req.body.postal
    })

    try{
        await address.save().then(doc =>{
            console.log(doc)
            res.send(doc)
        })
    }catch(e){
        console.log("Problem encountered")
        res.send({message:"Error"})
    }

})

Router.delete('/remove/address/:id', authenticateToken, async (req, res)=>{

    await Address.findOneAndDelete({_id: req.params.id})

    res.send({message:"Not sure if successful"})

})

Router.post('/update/address/:id', authenticateToken, async (req, res)=>{

    const address = await Address.findOne({_id:req.params.id})

    console.log("updating..")

    if(address){

        address.first_name=req.body.first_name,
        address.last_name=req.body.last_name,
        address.phone_number=req.body.phone_number,
        address.street=req.body.street,
        address.city=req.body.city,
        address.country=req.body.country,
        address.postal=req.body.postal

        console.log({address})

        try{

            address.save().then(()=>{
                res.send({message:"Save successful"})
            })

        }catch(e){
            res.send({message:"Problem encountered trying to save"})

        }

    }else res.send({message:"No address"})

})

//get shop listing, sales, and revenue
Router.get('/get-shop', authenticateToken, async(req, res)=>{

    const {id} = req.user

    const user = await User.findOne({_id:id, hasShop:true})
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

//get shop public data
Router.get('/get-shop-meta', authenticateToken, async(req, res)=>{

    console.log("Getting meta")

    const {shopId} = req.user

    const shop = await Shop.findOne({_id:shopId})
    if(shop != null){
        res.send({
            name:shop.name,
            pubkey:shop.publicKey,
            image:shop.image,
            description:shop.description,
            id:shop._id
        })
    }
})

//get user stats
Router.get('/get-stats', authenticateToken, async (req, res)=>{

    console.log("Getting stats")
    const {id} = req.user

    //completed orders
    const order = await UserOrder.find({userId:id, fulfilled:true})
    
    //amount spent
    let orders = order.length
    let amount = 0
    let products = 0
    order.map((item)=>{
        amount+=item.subtotal
        products+=item.items.length
    })

    res.send({
        orders:orders,
        amount:amount,
        products:products
    })
})

//get-completed orders
Router.get('/get-orders', authenticateToken, async (req, res)=>{

    console.log("Getting completed orders")
    const {id} = req.user

    //completed orders
    const orders = await UserOrder.find({userId:id, fulfilled:true})
    
    res.send([...orders])
})

//get all orders
Router.get('/orders', authenticateToken, async (req, res)=>{

    const {id} = req.user
})

//get pending reviews
Router.get('/get-pending-reviews', authenticateToken, async (req, res)=>{

    console.log("Getting Reviews 1")
    const {id} = req.user

    const pendingReviews = await pendingReview.find({userId:id})

    res.send([...pendingReviews])


})

//get completed reviews
Router.get('/get-completed-reviews', authenticateToken, async (req, res)=>{

    console.log("Getting Reviews 2")
    const {id} = req.user

    const reviews = await Review.find({userId:id})

    res.send([...reviews])


})

module.exports = Router