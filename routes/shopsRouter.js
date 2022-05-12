const express = require('express')
const Router = express.Router()

const Shop = require('../models/shop')
const Product = require('../models/Product')
const Tags = require('../models/tags')
const Order = require('../models/order')

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

Router.get('/orders', authenticateToken, async (req, res)=>{

    console.log("Hitt")
    const {shopId} = req.user

    const orders = await Order.find({shopId: shopId})

    let map = {}
    await new Promise( (resolve, reject) => orders.map(async ({orderId, productId}, idx)=>{

        let product = await Product.findOne({_id: productId})
        orders[idx] = {...orders[idx]._doc, name:product.name, image:product.primary}
        
        
        if(Object.keys(map).includes(orderId)){
            map[`${orderId}`].push(idx)
        }else{
            map = {...map, [`${orderId}`]:[idx]}
        }

        if(idx == orders.length-1) resolve()

    }))
    
    let grouped = []
    Object.keys(map).map((key,idx)=>{
        let temp = []
        map[key].map((val)=>{
            temp.push(orders[val])
        })
        grouped.push(temp)
    })
    

    if(orders.length >0){
        res.send([...grouped])
    }


})

Router.get('/:id/clear', async(req, res)=>{
    const shop = await Shop.findOne({_id:req.params.id})

    console.log("Clearing")

    if(shop != null){
        shop.listings = []
        try{
            await shop.save()
        }catch(e){
            console.log("error")
        }
    }
    res.send({message:"IDK"})
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

module.exports = Router