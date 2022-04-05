const express = require('express')
const Product = require('../models/Product')
const Router = express.Router()

const Shop = require('../models/shop')

Router.get('/get-paths', async (req, res)=>{

    const products = await Product.find()
    const paths = []
    products.map((product)=>{
        paths.push(product.pathname)
    })
    res.send(paths)
})

Router.get('/get-all', async (req, res)=>{

    console.log("Fetching products")

    const products = await Product.find()
    res.send(products)
})


Router.get('/get/:id/', async (req, res)=>{
    console.log("Fetching one product")

    const product = await Product.findOne({pathname: req.params.id})

    console.log(product)
    res.send(product)
})

Router.post('/get/multiple', async(req, res)=>{
    const listings = req.body.listings
    console.log({listings})

    const products = []

    listings.map(async (item)=>{
        const product = await Product.findOne({_id:item})
        console.log({product})
        products.push(product)
        console.log({products})
        if(products.length == listings.length){
            console.log(products)

            res.send({
                products:products
            })
        
        }
    })
    

    
})

Router.post('/add/', async (req, res)=>{

    const product = new Product({
        shopId:req.body.id,
        name:req.body.name,
        price:req.body.price,
        desc:req.body.desc,
        category:req.body.category,
        primary:req.body.primary,
        secondary:req.body.secondary,
        pathname:req.body.pathname
    })

    try{
        await product.save().then(async doc=>{
            console.log(doc)

            const shop = await Shop.findOne({_id:req.body.id})
            shop.listings = [...shop.listings, product._id]
            shop.save()

            res.send({message:"Success"})
        })
    }catch(e){
        console.log(e)
        res.send({message:"Bad request"})
    }

})

Router.post('/update/:id', async (req, res)=>{
    console.log("Endpoint hit!!!!!!!!!!!!")
    console.log(req.body)

    const product = await Product.findOne({_id:req.params.id})

    if(product != null){
        product.name=req.body.name
        product.price=req.body.price,
        product.desc=req.body.desc,
        product.category=req.body.category,
        product.primary=req.body.primary,
        product.secondary=req.body.secondary,
        product.pathname=req.body.pathname

        try{
            await product.save().then(doc=>{
                console.log(doc)
                res.send({message:"success"})
            })
        }catch(e){
            res.send({message:"Failed"})
        }

    }

})


module.exports = Router;