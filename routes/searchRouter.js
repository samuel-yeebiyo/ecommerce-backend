const express = require('express')
const Router = express.Router()

const Product = require('../models/Product')

Router.get('/:term', async (req, res)=>{
    const {term} = req.params
    
    
    console.log("Searching for ", term)

    const all = await Product.find({name: {$regex: new RegExp(term, 'i')}})

    console.log({all})

    if(all.length > 0){
        res.send(all)
    }else res.send({message:"DONE"})

})


module.exports = Router