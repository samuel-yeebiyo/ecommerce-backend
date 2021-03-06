const jwt = require('jsonwebtoken')

async function authenticateToken (req,res,next){

    console.log("User Authentication")
    
    const header = req.headers.authorization
    if(!header) return res.status(401).send({message:"Token not present"})

    const token = header && header.split(' ')[1]
    
    jwt.verify(token, process.env.JWT_ACCESS, (err, user)=>{
        if(err) res.status(403).send({message: "Invalid token"})
        else {
            req.user = {id: user.id, shopId: user.shopId}; 
            console.log({user})
            next()
        }
    })
}

module.exports = authenticateToken
