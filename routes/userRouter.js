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
const Sale = require('../models/sales')
const Product = require('../models/Product')
const jwt = require('jsonwebtoken')

const authenticateToken = require('../middleware/auth')

async function authUser (req, res, next){
    let user = await User.findOne({_id: req.params.id})
    if(user){
        next()
    }else return
}

//removing from cart
Router.post('/cart/remove', authenticateToken, async (req, res)=>{

    const {id} = req.user
    const {product} = req.body

    const userOrder = await UserOrder.findOne({user: id, paid:false})


    let index = userOrder.items.findIndex(element => element.product == product._id)
    console.log(index)
    
    //
    if(index != -1){
        
        console.log("Found")

        if(userOrder.items[index].quantity==1){
            userOrder.items.splice(index, 1)
        }else userOrder.items[index].quantity-=1
        userOrder.subtotal -= product.price 

    }

    console.log(userOrder)
    try{
        await userOrder.save().then(doc =>{
            res.send({message:"Success", cart: userOrder})
        })
    }catch(e){
        console.log("Problem with saving")
    }


})

//adding to cart
Router.post('/cart/add', authenticateToken , async (req,res)=>{

    const {id} = req.user
    const {product} = req.body
    
    const userOrder = await UserOrder.findOne({user: id, paid:false})

    if(userOrder == null){
        console.log("Creating a new user order")
        let orderData = new UserOrder({
            user: id,
            items:{
                product:product._id,
                quantity:1
            },
            subtotal:product.price
        })

        console.log(orderData)

        try{
            await orderData.save().then(doc =>{
                res.send({message:"Success", cart: userOrder})
            })
        }catch(e){
            console.log(e)
        }

    }else{

        let index = userOrder.items.findIndex(element => element.product == product._id)
        console.log(index)
        
        //if item already exists, add quantity and price
        if(index != -1){
            
            console.log("Found")

            userOrder.items[index].quantity+=1
            userOrder.subtotal += product.price        
        }else{
            
            //if item is new, add entry with the quantity as 1

            userOrder.items.push({
                product: product._id,
                quantity: 1,
            })
            userOrder.subtotal += product.price
        }

       console.log(userOrder)
       try{
            await userOrder.save().then(doc =>{
                res.send({message:"Success", cart: userOrder})
            })
        }catch(e){
            console.log("Problem with saving")
        }
    }
})

//fetching cart
Router.get('/cart', authenticateToken, async(req, res) =>{
    console.log("Getting cart")

    const {id} = req.user

    const userOrder = await UserOrder.findOne({user: id, paid:false}).populate({
        path:'items',
        populate:{path:'product'}
    })

    console.log(userOrder)

    if(userOrder != null){
        res.send(userOrder)
    }else{
        res.send({message:"No cart"})
    }

})

//trasnferring userless cart to user
Router.post('/transfer/', authenticateToken, async(req, res)=>{

    const {id} = req.user

    const guestId = jwt.verify(req.body.guestToken, process.env.JWT_GUEST, (err, guest)=>{
        if(err) res.status(403).send({message: "Invalid token"})
        else return guest.id
    })

    console.log(`Transferring cart from ${id} to ${guestId}`)


    //check if user already has an unfulfilled order
    const userOrder = await UserOrder.findOne({user: id, paid:false})
    
    //make sure a cart with the guestid exists
    const guestOrder = await GuestOrder.findOne({guestId:guestId, paid:false})


    console.log(guestOrder)
    console.log(userOrder)


    if(userOrder == null && guestOrder != null){
        
        console.log("Creating a new user order")

        //creating new cart with previous guest item
        let orderData = new UserOrder({
            user: id,
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
                if(guestItem.product.equals(userItem.product)){
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

//handling payment
Router.post('/pay', authenticateToken, async(req, res)=>{
    console.log("Processing payment")

    const {id} = req.user

    //find the cart for the guest
    const userOrder = await UserOrder.findOne({user: id, paid:false}).populate({
        path:'items',
        populate:{path:'product'}
    })
    const user = await User.findOne({_id: id})

    if(userOrder != null){
        
        let reciept = new Reciept({
            order_id:userOrder._id,
            email:user.email,
            amount:userOrder.subtotal,
            confirmation:req.body.confirmation
        })

        userOrder.paid = true
        userOrder.paymentId = reciept._id

        try{
            await reciept.save().then(async doc =>{

                await userOrder.save()
                res.send(doc)
                
                userOrder.items.map(async (item)=>{
                    let pastReview = await Review.findOne({user:user._id, product:item.product._id})
                    
                    if(pastReview == null){
                        let pastPendingReviews = await pendingReview.findOne({user: user._id, product:item.product._id})
                        
                        if(pastPendingReviews == null){

                            let newReview = new pendingReview({
                                user:user._id,
                                product:item.product._id,
                                order:userOrder._id
                            })

                            try{
                                await newReview.save()
                            }catch(e){
                                console.log(e)
                                console.log("error")
                            }
                        }
                    }

                    let product = await Product.findOne({_id:item.product._id})
                    product.revenue+=item.quantity*product.price

                    await product.save()

                    let shop = await Shop.findOne({_id: product.shop})
                    shop.totalRevenue += item.quantity*product.price

                    let sale = new Sale({
                        shop:shop._id,
                        product:product._id,
                        quantity:item.quantity,
                        revenue:product.price*item.quantity
                    })

                    await sale.save()

                    shop.sales.push(sale._id)

                    await shop.save()

                    const order = new Order({
                        user:id,
                        order:userOrder._id,
                        shop:shop._id,
                        product:product._id,
                        productName:product.name,
                        productImage:product.primary,
                        unitPrice:product.price,
                        quantity:item.quantity,
                        total:product.price*item.quantity,
                        address: req.body.address,
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

Router.get('/get', authenticateToken, async(req, res)=>{

    console.log("Getting")
    
    const {id, shopId} = req.user
    
    const user = await User.findOne({_id: id})
    
    if(user!= null){
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

    console.log({address})

    try{
        await address.save().then(doc =>{
            console.log(doc)
            res.send(doc)
        })
    }catch(e){
        console.log("Problem encountered")
        console.log(e)
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

    const {shopId} = req.user

    if(shopId){
        const shop = await Shop.findOne({_id:shopId})
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

    const allOrders = await Order.find({user:id})

    const orders = []

    //group orders by orderId
    allOrders.map((order, idx)=>{

        let index = orders.findIndex((element)=> element.orderId.valueOf() == order.order.valueOf())

        if(index == -1){
            orders.push({
              orderId: order.order,
              values: [idx]
            })
        }else{
            orders[index].values.push(idx)
        }
    })

    console.log(allOrders)
    console.log(orders)
    
    res.send({map: orders, all: allOrders})
})

//get all orders
Router.get('/orders', authenticateToken, async (req, res)=>{

    const {id} = req.user
})

//get pending reviews
Router.get('/get-pending-reviews', authenticateToken, async (req, res)=>{

    console.log("Getting Reviews 1")
    const {id} = req.user

    const pendingReviews = await pendingReview.find({user:id}).populate('product')


    console.log(pendingReviews)

    res.send([...pendingReviews])


})

//get completed reviews
Router.get('/get-completed-reviews', authenticateToken, async (req, res)=>{

    console.log("Getting Reviews 2")
    const {id} = req.user

    const reviews = await Review.find({user:id})

    res.send([...reviews])


})

module.exports = Router