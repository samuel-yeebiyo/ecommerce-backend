const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const redis = require('redis')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const registrationRouter = require('./routes/registrationRouter')
const loginRouter = require('./routes/loginRouter')
const userRouter = require('./routes/userRouter')
const guestRouter = require('./routes/guestRouter')
const productsRouter = require('./routes/productsRouter')
const uploadRouter = require('./routes/uploadRouter')
const shopsRouter  =require('./routes/shopsRouter')
const resetRouter = require('./routes/reset')
const searchRouter = require('./routes/searchRouter')

const PORT = process.env.SERVER_PORT || 8000
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'

const client = redis.createClient({socket:{host: REDIS_HOST, port:6379}})
client.connect()

mongoose.connect(process.env.MONGO_URI, ()=>{
    console.log("Mongodb connected")
})

app.use(express.json())
app.use(cors())

app.get('/', (req,res)=>{
    console.log("Hello axios")

    const header = req.headers.authorization
    const token = header && header.split(' ')[1]

    console.log({token})

    res.send("Hello")
})

app.use('/upload', uploadRouter)

app.use('/register', registrationRouter)

app.use('/login', loginRouter)

app.use('/user',  userRouter)

app.use('/guest', guestRouter)

app.use('/products', productsRouter)

app.use('/shops/', shopsRouter)

app.use('/search/', searchRouter)

app.use('/reset', resetRouter)

app.use('/refresh', async(req, res)=>{

    console.log("Refreshing")

    const header = req.headers.authorization
    const token = header && header.split(' ')[1]

    //check if token is valid in the redis database
    if(token){
        jwt.verify(token, process.env.JWT_REFRESH, (err, user)=>{
            if(!err){
                const newToken = jwt.sign({
                    id:user.id,
                    shopId:user.shopId
                }, process.env.JWT_ACCESS, {expiresIn: '15s'})

                res.send({accessToken: newToken})
            }else {
                console.log(err)
                res.status(403).send({message: 'nope'})
            }

        })
    }else res.send({message:"Nice"})

})

app.listen(PORT, ()=>{
    console.log("Port listening on port ", PORT)
})