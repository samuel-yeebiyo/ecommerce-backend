const express = require('express')
const Router = express.Router()

const Shop = require('../models/shop')
const Product = require('../models/Product')
const Tags = require('../models/tags')
const Order = require('../models/order')
const Sales = require('../models/sales')

const mongoose = require('mongoose')
const authenticateToken = require('../middleware/auth')

Router.get('/:id/get-products', async(req, res)=>{
    
    const shop = await Shop.findOne({_id:req.params.id})

    const listings = shop.listings
    const products = []
    if(shop){
        
        listings.map(async (item)=>{
            const product = await Product.findOne({_id:item})
            console.log({product})
            products.push(product)
            console.log({products})
            if(products.length == listings.length){
                console.log({products})
    
                res.send({
                    products:products
                })
            
            }
        })
    }
    else res.send({message:"error"})
})

Router.get('/stats', authenticateToken, async (req, res)=>{

    console.log("Getting stats")
    
    const {shopId} = req.user

    const shop = await Shop.findOne({_id: shopId})
    const createdAt = shop.createdAt

    const current = new Date()
    const curr_year = current.getFullYear()
    const curr_month = current.getMonth()
    const curr_day = current.getDate()
    
    //get daily
    const start_day = new Date(curr_year, curr_month, curr_day-7)
    const sales_daily = await Sales.find({shop: shopId, date: { $gte: start_day, $lte: current}})

    let daily = []
    for(let i=1; i<=7; i++){
        let revenue = 0
        const curr = new Date(start_day.getFullYear(), start_day.getMonth(), start_day.getDate()+i)
        sales_daily.map((sale, idx)=>{
            if(sale.date.getMonth() == curr.getMonth() && sale.date.getDate() == curr.getDate()){
                revenue += sale.revenue
            }
        })
        daily.push(revenue) 
    }

    //monthly
    const start_month = new Date(curr_year, curr_month-7, curr_day)
    const sales_monthly = await Sales.find({shop:shopId, date: { $gte: start_month, $lte: current}})

    let monthly = []
    for(let i=1; i<=7; i++){
        let revenue = 0
        const curr = new Date(start_month.getFullYear(), start_month.getMonth()+i, start_month.getDate())
        sales_monthly.map((sale, idx)=>{
            if(sale.date.getMonth() == curr.getMonth()){
                revenue += sale.revenue
            }
        })
        monthly.push(revenue) 
    }

    res.send({daily: daily, monthly: monthly})

})

Router.get('/stats/products', authenticateToken, async (req, res)=>{

    const {shopId} = req.user

    const products = await Product.find({shop: shopId})

    res.send(products)
})


Router.get('/orders', authenticateToken, async (req, res)=>{

    console.log("Hitt")
    const {shopId} = req.user

    const allOrders = await Order.find({shop:shopId})

    const orders = []

    //group orders by orderId
    allOrders.map((order, idx)=>{

        let index = orders.findIndex((element)=> element.orderId.valueOf() == order.order.valueOf())

        if(index == -1){
            orders.push({
              orderId: order.order,
              values: [idx],
              status: order.status
            })
        }else{
            orders[index].values.push(idx)
        }
    })

    console.log(allOrders)
    console.log(orders)
    

    if(orders.length >0){
        res.send({map: orders, all: allOrders})
    }


})

Router.post('/generate', authenticateToken, async (req, res)=>{

    const {shopId} = req.user

    const order = await Order.findOne({order: req.body.order, shop: shopId, status: 'pending'})

    if(order != null){
        let code = new mongoose.Types.ObjectId().valueOf()
        res.send({code: code})

        //store in redis

    }else res.send({message: "error"})


})

Router.post('/confirmation', authenticateToken, async (req, res) =>{

    const {shopId} = req.user

    //check if confirmation code exists in redis


    const orders = await Order.find({order: req.body.order, shop: shopId, status: 'pending'})

    if(orders.length > 0){
        let err = false
        orders.map(async (order)=>{
            order.status = "shipped"
            try{
                await order.save()
            }catch(e){
                err = true
                console.log("Problem saving status")
                res.send({message: "error"})
            }
        })
        !err && res.send({message: "Success"})
    }else res.send({message: "error"})


})


// http://localhost:8000/shop/${shop}/delete/${id}

Router.delete('/delete/:product', authenticateToken ,async (req, res)=>{

    console.log("Deleting")

    const {shopId} = req.user

    const shop = await Shop.findOne({_id:shopId})
    
    if(shop !=null){
        let listing = shop.listings
        let idx = listing.findIndex((val)=> val == req.params.product)
        listing.splice(idx,1)
        shop.listings = listing

        try{
            await shop.save().then(async doc=>{
                console.log("shop Saved")

                //need to handle tags before deleting
                const product  = await Product.findOne({_id:req.params.product})
                const tags = product.tags

                tags.map(async (tag)=>{
                    let existingTag = await Tags.findOne({name:tag})
                    if(existingTag){
                        if(existingTag.products.length == 1){
                            await Tags.deleteOne({_id: existingTag._id})    
                        }else{
                            const updated = existingTag.products.filter((id) => id != product._id)
                            existingTag.products = updated
                            await existingTag.save()
                        }
                    }
                })

                await Product.findOneAndDelete({_id:product._id})
                res.send({message:"Success"})
               
            })
        }catch(e){
            console.log("error")
        }
    }


})

Router.post('/update/', authenticateToken, async (req, res)=>{

    const {shopId} = req.user

    const shop = await Shop.findOne({_id: shopId})

    const {image, name, description, pubKey} = req.body

    if(shop != null){
        shop.name = name
        shop.description = description
        shop.image = image
        shop.publicKey = pubKey
        shop.pathname = name.toLowerCase().replaceAll(" ","-")

        try{
            await shop.save().then(()=>{
                console.log("Save successful")
                res.send({message:"Success"})
            })
        }catch(e){
            console.log("Save failed")
            res.send({message:"Failed"})
        }
    }else{
        console.log("No shop")
        res.send({message:"No shop"})
    }


})

Router.get('/get-paths', async (req, res)=>{

    const shops = await Shop.find()
    const paths = []

    console.log(shops)

    shops.map((shop)=>{
        paths.push(shop.pathname)
    })

    console.log("got paths ", {paths})

    res.send(paths)
})

Router.get('/get/:path/', async (req, res)=>{
    console.log("Fetching shop")

    const shop = await Shop.findOne({pathname: req.params.path})

    console.log("Getting shop ",{shop})
    res.send(shop)
})

Router.post('/namecheck', async (req, res)=>{
    console.log("Checking name collision")

    const shop  = await Shop.findOne({name: {$regex: new RegExp(req.body.name, 'i')}})

    if(shop){
        res.send({message:false})
    }else res.send({message:true})
})

module.exports = Router