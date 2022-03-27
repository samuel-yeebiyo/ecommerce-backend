const express = require('express')
const Router  = express.Router()


Router.post('/post-images', async (req,res)=>{
    
    let urls = []

    console.log(req.files)


})

module.exports = Router