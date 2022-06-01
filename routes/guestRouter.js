const express = require('express')
const Router = express.Router()

const User = require('../models/User')
const GuestOrder = require('../models/guestOrder')
const Reciept = require('../models/reciept')
const Product = require('../models/Product')
const Shop = require('../models/shop')
const Order = require('../models/order')
const Sale = require('../models/sales')

const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const mongoose = require('mongoose')

const authenticateGuest = require('../middleware/authGuest')



Router.get('/token', async (req, res)=>{

    let guestToken = jwt.sign({
        id: new mongoose.Types.ObjectId()
    }, process.env.JWT_GUEST, {expiresIn: '7d'})

    res.send({ guestToken: guestToken});
})

Router.post('/cart/remove', authenticateGuest, async (req, res) =>{

    const {id} = req.guest
    const {product} = req.body

    const guestOrder = await GuestOrder.findOne({guestId: id, paid:false})


    let index = guestOrder.items.findIndex(element => element.product == product._id)
    console.log(index)
    
    //
    if(index != -1){
        
        console.log("Found")

        if(guestOrder.items[index].quantity==1){
            guestOrder.items.splice(index, 1)
        }else guestOrder.items[index].quantity-=1
        guestOrder.subtotal -= product.price 

    }

    console.log(guestOrder)
    try{
        await guestOrder.save().then(doc =>{
            res.send({message:"Success", cart: guestOrder})
        })
    }catch(e){
        console.log("Problem with saving")
    }

})

//adding to cart
Router.post('/cart/add', authenticateGuest , async (req,res)=>{

    console.log("Adding to guest cart")

    const {id} = req.guest
    const {product} = req.body
    
    const guestOrder = await GuestOrder.findOne({guestId: id, paid:false})

    if(guestOrder == null){
        console.log("Creating a new user order")
        let orderData = new GuestOrder({
            guestId: id,
            items:{
                product:product._id,
                quantity:1
            },
            subtotal:product.price
        })

        console.log(orderData)

        try{
            await orderData.save().then(doc =>{
                res.send({message:"Success", cart: guestOrder})
            })
        }catch(e){
            console.log(e)
        }

    }else{

        let index = guestOrder.items.findIndex(element => element.product == product._id)
        console.log(index)
        
        //if item already exists, add quantity and price
        if(index != -1){
            
            console.log("Found")

            guestOrder.items[index].quantity+=1
            guestOrder.subtotal += product.price        
        }else{
            
            //if item is new, add entry with the quantity as 1

            guestOrder.items.push({
                product: product._id,
                quantity: 1,
            })
            guestOrder.subtotal += product.price
        }

       console.log(guestOrder)
       try{
            await guestOrder.save().then(doc =>{
                res.send({message:"Success", cart: guestOrder})
            })
        }catch(e){
            console.log("Problem with saving")
        }
    }
})

Router.get('/cart', authenticateGuest, async(req, res) =>{

    console.log("Getting cart")
    
    const {id} = req.guest

    //find the cart for the guest
    const guestOrder = await GuestOrder.findOne({guestId: id, paid:false})
    .populate({path:'items', populate:{path: 'product'}})

    console.log(guestOrder)

    if(guestOrder != null){
        res.send(guestOrder)
    }else{
        res.send({message:"No cart"})
    }


})


//handling payment
Router.post('/pay', authenticateGuest, async(req, res)=>{
    console.log("Processing payment")

    const {id} = req.guest


    //find the cart for the guest
    const guestOrder = await GuestOrder.findOne({guestId: id, paid:false})

    if(guestOrder != null){
        
        let reciept = new Reciept({
            order_id:guestOrder._id,
            email:req.body.email,
            amount:guestOrder.subtotal,
            confirmation:req.body.confirmation
        })

        guestOrder.paid =true
        guestOrder.paymentId = reciept._id

        try{
            await reciept.save().then(async doc =>{
                
                await guestOrder.save()
                res.send(doc)
                console.log(reciept)

                guestOrder.items.map(async (item)=>{

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
                        order:guestOrder._id,
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

                    console.log({order})

                    await order.save()

                })

            })
        }catch(e){
            console.log("Problem with saving")
        }
    }

})


module.exports = Router