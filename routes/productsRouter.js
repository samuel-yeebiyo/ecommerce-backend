const express = require('express')
const Product = require('../models/Product')
const Router = express.Router()

const Products = require('../models/Product')

Router.get('/get-paths', async (req, res)=>{

    const products = await Products.find()
    const paths = []
    products.map((product)=>{
        paths.push(product.pathname)
    })
    res.send(paths)
})

Router.get('/get-all', async (req, res)=>{

    console.log("Fetching products")

    const products = await Products.find()
    res. send(products)
})


Router.get('/get/:id/', async (req, res)=>{
    console.log("Fetching one product")

    const product = await Product.findOne({pathname: req.params.id})

    console.log(product)
    res.send(product)
})


module.exports = Router;