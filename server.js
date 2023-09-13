const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const redis = require('./lib/redis')

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
const authenticateToken = require('./middleware/auth')

const PORT = process.env.SERVER_PORT || 8000

mongoose.connect(process.env.MONGO_URI, ()=>{
    console.log("Mongodb connected")
})

app.use(express.json())
app.use(cors({
	origin:'*'
}))

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
        jwt.verify(token, process.env.JWT_REFRESH, async (err, user)=>{
            if(!err){

                const inRedis = await redis.get(user.id)
                console.log("In redis, found = ", inRedis)
                
                if(inRedis == token){
                    const newToken = jwt.sign({
                        id:user.id,
                        shopId:user.shopId
                    }, process.env.JWT_ACCESS, {expiresIn: '15s'})
    
                    res.send({accessToken: newToken})
                }else{
                    console.log("Expired refresh token")
                    res.status(403).send({message: 'nope'})
                }

            }else {
                console.log(err)
                res.status(403).send({message: 'nope'})
            }

        })
    }else res.send({message:"Nice"})

})

app.use('/logout', authenticateToken, async (req, res)=>{

    const {id} = req.user

    await redis.del(id)

    res.send({message: "Done"})
})

app.listen(PORT, ()=>{
    console.log("Port listening on port ", PORT)
})
