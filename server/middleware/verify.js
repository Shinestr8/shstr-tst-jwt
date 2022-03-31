const jwt = require('jsonwebtoken');
let secret = require('../config.json');

module.exports = function(req, res, next){
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        console.log(token)
        jwt.verify(token, secret.access, (err, user)=>{
            if(err){
                return res.status(403).json("Token is not valid");
            }
            req.user = user;
            next();
        })
    } else {
        res.status(401).json("You are not authenticated");
    }
}