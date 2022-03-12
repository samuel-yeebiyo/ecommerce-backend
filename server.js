const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config()

const registrationRouter = require('./routes/registrationRouter')
const loginRouter = require('./routes/loginRouter')

mongoose.connect(process.env.MONGO_URI, ()=>{
    console.log("Mongodb connected")
})

app.use(express.json())
app.use(cors())

app.get('/', (req,res)=>{
    res.send("Hello")
})

app.use('/register', registrationRouter)

app.use('/login', loginRouter)

app.listen(8000, ()=>{
    console.log("Port listening on port 8000")
})