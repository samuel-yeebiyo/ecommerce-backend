const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

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

mongoose.connect(process.env.MONGO_URI, ()=>{
    console.log("Mongodb connected")
})

app.use(express.json())
app.use(cors())

app.get('/', (req,res)=>{
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

app.listen(8000, ()=>{
    console.log("Port listening on port 8000")
})