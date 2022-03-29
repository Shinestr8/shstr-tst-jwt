const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/user')
const RefreshToken = require('./models/refreshToken');

const app = express();

// const info = require('./db/dbconfig');
const uri = require('./db/url');
mongoose.connect(uri);
const db = mongoose.connection;
db.on('error', (error)=>    console.log("1" + error));
db.once('open', ()=>console.log("connected to db"))

//equivalent to body parser
app.use(express.json())

const userRouter = require('./routes/user');
app.use('/user', userRouter);



//verify middleware
//check the header for the access token, verify if it is valid
//if the token is valid continue, else leave with 401
const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "mysecretkey", (err, user)=>{
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

//function that generates the access tokens
function generateAccessToken(user){
    return jwt.sign({id:user.id, isAdmin:user.isAdmin}, "mysecretkey", {expiresIn: "15"});
}

//function that generates the refresh token
function generateRefreshToken(user) {
    return jwt.sign({id:user.id, isAdmin:user.isAdmin}, "myrefreshsecretkey");
}

app.post("/api/refresh",  async(req, res)=>{
    const refreshToken = req.body.token;
    if(!refreshToken){
        return res.status(401).json("You are not authenticated");
    } 
    try{
        const refreshTokenDB = await RefreshToken.findOne({value: refreshToken}).exec();
        if(!refreshTokenDB){
            return res.status(403).json("JWT is not valid");
        } 
    } catch(error){
        console.log(error);
    }
    jwt.verify(refreshToken, "myrefreshsecretkey", async (err, user)=>{
        err && console.log("4 " + err);
        try{
            await RefreshToken.deleteOne({value: refreshToken}).exec();
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);
            const refreshTokenDB = new RefreshToken({value: newRefreshToken});
            refreshTokenDB.save(function(err){
                if(err){
                    console.log(err)
                }
            })
            res.status(200).json({
                accessToken: newAccessToken, refreshToken:  newRefreshToken
            })
        } catch (error){
            console.log(error);
        }

    })
})

app.post("/api/loginJWT", verify, async function(req, res){
    const accessToken = req.body.token;
    let userid = jwt.decode(accessToken).id;
    try{
        const user = await User.findById(userid).exec();
        if(user){
            res.status(200).json({
                user: {
                    username: user.username,
                    isAdmin: user.isAdmin
                }
            })
        } else {
            res.status(400).json("invalid token");
        }
    } catch (error){
        console.log(error);
    }
})

app.post("/api/login", async function(req, res){
    const {username, password} = req.body;
    try {
        const user = await User.findOne({ username: username }).exec();
        if(user && (user.password === password)){
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            const refreshTokenDB = new RefreshToken({value: refreshToken});
            refreshTokenDB.save(function(err){
                console.log(err);
            })
            res.json({
                user:{
                    username: user.username,
                    isAdmin: user.isAdmin        
                },
                accessToken: accessToken,
                refreshToken: refreshToken
            })
        } else {
            res.status(400).json("username or password incorrect")
        }
    } catch (error) {
        console.log(error);
    }
})


app.post("/api/logout", async (req, res) =>{
    const refreshToken = req.body.token;
    try{
        await RefreshToken.deleteOne({value: refreshToken}).exec();
        res.status(200).json("successful logoutdb");
    } catch(error){
        res.status(500).json("an error happened");
    }
})

 
//delete user method
//Run verify middleware, then check if the user have right to delete another one
app.delete("/api/users/:userId", verify, (req, res) =>{
    //can only delete if admin or if you're trying to delete yourself
    if(req.user.id === req.params.userId || req.user.isAdmin){
        res.status(200).json("User has been deleted");
    } else {
        res.status(403).json("You are not allowed to delete this user");
    }
})


const PORT = 5000;
app.listen(PORT, ()=> console.log(  `Login backend running on http://localhost:${PORT}`))   