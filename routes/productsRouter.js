const express = require('express')
const Product = require('../models/Product')
const Router = express.Router()

const Review = require('../models/review')
const Shop = require('../models/shop')
const Tags = require('../models/tags')
const pendingReview = require('../models/pendingReview')

const authenticateToken = require('../middleware/auth')
const User = require('../models/User')

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


Router.get('/get/:path/', async (req, res)=>{
    console.log("Fetching one product")

    const product = await Product.findOne({pathname: req.params.path})
    const shop = await Shop.findOne({_id: product.shopId})

    console.log(product)
    res.send({
        ...product._doc,
        shopPath:shop.pathname,
        shopName:shop.name
    })
})

Router.get('/get-multiple', authenticateToken , async(req, res)=>{
    

    console.log("Getting multiple")

    const { shopId } = req.user
    console.log({shopId})

    const shop = await Shop.findOne({_id: shopId})
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

Router.post('/add/', authenticateToken ,async (req, res)=>{

    const shop = await Shop.findOne({_id:req.body.id})

    let tags = []
    if(req.body.tags){
        tags = req.body.tags.split(", ")
    }

    const product = new Product({
        shopId:req.body.id,
        name:req.body.name,
        price:req.body.price,
        desc:req.body.desc,
        category:req.body.category,
        primary:req.body.primary,
        secondary:req.body.secondary,
        pathname:req.body.pathname,
        rawTags:req.body.tags,
        tags:tags
    })

    try{
        await product.save().then(async doc=>{
            console.log(doc)

            shop.listings = [...shop.listings, product._id]

            //extract tags and save to db
            if(tags.length > 0){
                tags.map(async (tag)=>{
                    const existingTag = await Tags.findOne({name: tag})

                    if(existingTag){
                        existingTag.products.push(doc._id);
                        await existingTag.save().then(doc =>{
                            console.log("Tag updated")
                        })
                    }else{

                        const newTag = new Tags({
                            name:tag,
                            products:[doc._id]
                        })

                        await newTag.save().then(doc =>{
                            console.log("Tag created")
                        })
                    }
                })
            }


            shop.save()

            res.send({message:"Success"})
        })
    }catch(e){
        console.log(e)
        res.send({message:"Bad request"})
    }

})

Router.post('/update/:id', authenticateToken, async (req, res)=>{
    console.log("Endpoint hit!!!!!!!!!!!!")
    
    const {shopId} = req.user
    
    const shop = await Shop.findOne({_id: shopId})
    if(!shop.listings.includes(req.params.id)){
        res.send({message: "This product does not belong to you!"})
        return
    }


    const product = await Product.findOne({_id:req.params.id})

    const previousTags = product.tags


    let tags = []
    if(req.body.tags){
        tags = req.body.tags.split(", ")
    }

    if(product != null){
        product.name=req.body.name
        product.price=req.body.price,
        product.desc=req.body.desc,
        product.category=req.body.category,
        product.primary=req.body.primary,
        product.secondary=req.body.secondary,
        product.pathname=req.body.pathname
        product.rawTags = req.body.tags
        product.tags=tags

        try{
            await product.save().then(doc=>{
                console.log(doc)

                let del = []
                //tags to be deleted
                previousTags.map((tag)=>{
                    if(!tags.includes(tag)){
                        del.push(tag)
                    }
                })

                let add = []
                //tags to be added
                tags.map((tag)=>{
                    if(!previousTags.includes(tag)){
                        add.push(tag)
                    }
                })


                if(add.length > 0){
                    add.map(async (tag)=>{
                        const existingTag = await Tags.findOne({name: tag})
    
                        if(existingTag){
                            existingTag.products.push(doc._id);
                            await existingTag.save().then(doc =>{
                                console.log("Tag updated")
                            })

                        }else{
    
                            const newTag = new Tags({
                                name:tag,
                                products:[doc._id]
                            })
    
                            await newTag.save().then(doc =>{
                                console.log("Tag created")
                            })
                        }
                    })
                }
                if(del.length > 0){

                    del.map(async (tag)=>{
                        
                        const existingTag = await Tags.findOne({name: tag})

                        if(existingTag){
                            if(existingTag.products.length == 1){
                                await Tags.deleteOne({_id: existingTag._id})    
                            }else{
                                const updated = existingTag.products.filter((id)=> id != doc._id)
                                existingTag.products = updated
                                await existingTag.save()
                            }
                        }
                        
                    })
                }



                res.send({message:"success"})
            })
        }catch(e){
            res.send({message:"Failed"})
        }
    }
})

Router.post('/review/:product/:user', async(req, res)=>{

    console.log("Review being processed")

    const product = await Product.findOne({_id: req.params.product})

    const {title, name, rating, description} = req.body

    if(product != null){
        let review = new Review({
            userId:req.params.user,
            title:title,
            name:name,
            rating:rating,
            description:description,
            productId:product._id,
            productName:product.name,
            image:product.primary
        })

        product.reviews.push(review._id)

        try{
            await review.save().then(async doc=>{
                await product.save().then(()=>{
                    res.send({message:"Success"})
                })
                await pendingReview.findOneAndDelete({userId:req.params.user, productId:product._id})
            })
        }catch(e){
            console.log("Problem encountered")
            console.log(e)
            res.send({message:"Problem encountered"})
        }
    }

})

Router.post('/update/review/:id', async(req, res)=>{
    console.log("Updating review with id ", req.params.id )

    const { id } = req.params
    const {title, name, rating, description} = req.body

    const review = await Review.findOne({_id: id})

    if(review != null){
        review.title = title
        review.name = name
        review.rating = rating
        review.description = description

        try{
            await review.save().then(()=>{
                res.send({message: "Success"})
            })
        }catch(e){
            console.log("Problem encoutered while saving review")
            res.send({message:"Update failed"})
        }
    }else res.send({message: "Review does not exist"})


})

Router.get('/:id/get-reviews', async (req, res)=>{
    
    const reviews = await Review.find({productId: req.params.id})

    res.send([...reviews])

})

module.exports = Router;