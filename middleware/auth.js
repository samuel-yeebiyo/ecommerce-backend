const jwt = require('jsonwebtoken')

async function authenticateToken (req,res,next){

    console.log("Authenticating")

    const header = req.headers.authorization
    const token = header && header.split(' ')[1]
    console.log({token})
    if(!token) res.status(401).send("Token not present")

    else jwt.verify(token, process.env.JWT_ACCESS, (err, user)=>{
        if(err) res.status(401).send({message: "Invalid token"})
        else {
            req.user = {id: user.id, shopId: user.shopId}; 
            next()
        }
    })
}

module.exports = authenticateToken
