const express = require('express')
const Product = require('../models/Product')
const Router = express.Router()

const Review = require('../models/review')
const Shop = require('../models/shop')
const Tags = require('../models/tags')
const pendingReview = require('../models/pendingReview')

const authenticateToken = require('../middleware/auth')
const User = require('../models/User')


//Needed for NextJS static generation of product pages
//////////////////////////////////
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

    console.log(`Path searching for ${req.params.path}`)

    const product = await Product.findOne({pathname: req.params.path}).populate('reviews')
    const shop = await Shop.findOne({_id: product.shop})

    console.log(product)
    res.send({
        ...product._doc,
        shopPath:shop.pathname,
        shopName:shop.name
    })
    
})
/////////////////////////////////



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

    const {shopId} = req.user

    const shop = await Shop.findOne({_id:shopId})
    console.log(`Adding product to shop "${shop.name}" `)
    
    
    let tags = []
    if(req.body.tags){
        tags = req.body.tags.split(", ")
    }

    //create a product object
    const product = new Product({
        shop:shop._id,
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
            console.log("Product saved")

            //add reference to product inside the shop array
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
    
    console.log("Updating product")
    
    const {shopId} = req.user
    
    const shop = await Shop.findOne({_id: shopId})

    if(!shop.listings.includes(req.params.id)){
        res.send({message: "This product does not belong to you!"})
        return
    }


    const product = await Product.findOne({_id:req.params.id})

    const previousTags = product.tags


    //new tags
    let tags = []
    if(req.body.tags){
        tags = req.body.tags.split(", ")
    }

    if(product != null){

        //update product values

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
    
                        //if tag already exists in the database, add product ref
                        if(existingTag){
                            existingTag.products.push(doc._id);
                            await existingTag.save().then(doc =>{
                                console.log("Tag updated")
                            })

                        }else{
    
                            //create a new tag with this product ref
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

                                //delete tag from database if this is the last product
                                await Tags.deleteOne({_id: existingTag._id})    

                            }else{

                                //delete this product ref from tag collection
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

//add endpoints to get  products based on different parameters like
// category, tags (maybe more)


//Reviews
Router.post('/review/:product/', authenticateToken, async(req, res)=>{

    const {id} = req.user

    console.log("Review being processed")

    const product = await Product.findOne({_id: req.params.product})

    const {title, name, rating, description} = req.body

    if(product != null){
        let review = new Review({
            user:id,
            title:title,
            name:name,
            rating:rating,
            description:description,
            product:product._id,
            productName:product.name,
            image:product.primary
        })


        try{
            await review.save().then(async doc=>{

                let total = product.reviews.length
                let newRating = (product.rating + rating)/(total+1)

                product.reviews.push(review._id)
                product.rating = newRating

                await product.save().then(()=>{
                    res.send({message:"Success"})
                })
                await pendingReview.findOneAndDelete({user:id, productId:product._id})
            })
        }catch(e){
            console.log("Problem encountered")
            console.log(e)
            res.send({message:"Problem encountered"})
        }
    }

})

Router.post('/update/review/:id', authenticateToken, async(req, res)=>{
    console.log("Updating review with id ", req.params.id )

    const { id } = req.user

    const {title, name, rating, description} = req.body

    const review = await Review.findOne({_id: req.params.id, user: id})

    console.log(review)

    if(review != null){
        review.title = title
        review.name = name
        review.rating = rating
        review.description = description

        try{
            await review.save().then(async ()=>{
                res.send({message: "Success"})

                let product = await Product.findOne({_id: review.product})


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