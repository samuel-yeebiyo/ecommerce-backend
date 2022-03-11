const express = require('express')
const app = express()
const cors = require('cors')

const registrationRouter = require('./routes/registrationRouter')
const loginRouter = require('./routes/loginRouter')

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