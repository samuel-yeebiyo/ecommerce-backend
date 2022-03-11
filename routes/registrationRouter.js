const express = require('express')
const Router = express.Router()

Router.post('/', (req,res)=>{
    console.log(req.body)
})

module.exports = Router