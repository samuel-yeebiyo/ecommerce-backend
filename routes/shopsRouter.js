const express = require('express')
const Router = express.Router()

const Shop = require('../models/shop')
const Product = require('../models/Product')

Router.get('/:id/get-listings', async(req, res)=>{
    
    const shop = await Shop.findOne({_id:req.params.id})

    if(shop != null){
        res.send({
            listings:shop.listings
        })
        console.log("sent listings", shop.listings)
    }else{
        res.send({message:"No shop"})
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

Router.delete('/:shop/delete/:product', async (req, res)=>{

    const shop = await Shop.findOne({_id:req.params.shop})
    
    if(shop !=null){
        let listing = shop.listings
        let idx = listing.findIndex((val)=> val == req.params.product)
        listing.splice(idx,1)
        shop.listings = listing

        try{
            await shop.save().then(async doc=>{
                console.log("shop Saved")
                await Product.findOneAndDelete({_id:req.params.product})
                res.send({message:"Success"})
               
            })
        }catch(e){
            console.log("error")
        }
    }


})

module.exports = Router