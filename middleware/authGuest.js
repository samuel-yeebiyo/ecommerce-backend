const jwt = require('jsonwebtoken')

async function authenticateGuest (req, res, next){

    console.log("Guest authentication")

    const header = req.headers.authorization
    if(!header) return res.status(401).send({message:"Token not present"})

    const token = header && header.split(' ')[1]
    
    jwt.verify(token, process.env.JWT_GUEST, (err, guest)=>{
        if(err) res.status(403).send({message: "Invalid token"})
        else {
            req.guest = {id: guest.id}
            console.log({guest})
            next()
        }
    })

}

module.exports = authenticateGuest