const express = require('express')
const Router = express.Router()

const Product = require('../models/Product')

Router.get('/autocomplete/:term', async (req, res)=>{
    const {term} = req.params
    
    
    console.log("Searching for ", term)

    const withName = await Product.find({name: {$regex: new RegExp(term, 'i')}})
    const withTags = await Product.find({rawTags: {$regex: new RegExp(term, 'i')}})

    const all = []
    const map = []
    withName.map((item)=>{
        if(!map.includes(item._id.valueOf())){
            all.push(item)
            map.push(item._id.valueOf())
        }
    })
    withTags.map((item)=>{
        if(!map.includes(item._id.valueOf())){
            all.push(item)
            map.push(item._id.valueOf())
        }
    })


    console.log({all})

    if(all.length > 0){
        res.send(all)
    }else res.send({message:"DONE"})

})


Router.get('/:term', async (req, res)=>{
    const {term} = req.params
    
    
    console.log("Searching for ", term)

    const fromTerm = await Product.find({name: {$regex: new RegExp(term, 'i')}})
    const fromTags = await Product.find({rawTags: {$regex: new RegExp(term, 'i')}})


    const map = []
    const all = []
    fromTerm.map((item)=>{
        if(!map.includes(item._id.valueOf())){
            all.push(item)
            map.push(item._id.valueOf())
        }
    })
    fromTags.map((item)=>{
        if(!map.includes(item._id.valueOf())){
            all.push(item)
            map.push(item._id.valueOf())
        }
    })

    console.log({map})
    console.log({all})


    if(all.length > 0){
        res.send(all)
    }else res.send({message:"DONE"})

})


module.exports = Router