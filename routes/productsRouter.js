const express = require('express')
const Product = require('../models/Product')
const Router = express.Router()

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
    res. send(products)
})


Router.get('/get/:id/', async (req, res)=>{
    console.log("Fetching one product")

    const product = await Product.findOne({pathname: req.params.id})

    console.log(product)
    res.send(product)
})

Router.post('/add/', async (req, res)=>{

    const product = new Product({
        name:req.body.name,
        price:req.body.price,
        desc:req.body.desc,
        pathname:req.body.pathname
    })

    try{
        await product.save().then(doc=>{
            console.log(doc)
            res.send("Success")
        })
    }catch(e){
        console.log(e)
        res.send("Bad request")
    }

})


module.exports = Router;