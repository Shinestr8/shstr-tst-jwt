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


//Hard coded users
const users = [
    {
        id: "1",
        username: "John",
        password: "pass",
        isAdmin: true
    },
    {
        id: "2",
        username: "Jane",
        password: "pass",
        isAdmin: false
    },
    {
        id:"3",
        username: "corentin",
        password: "password",
        isAdmin: true
    }
];

// app.use(require('./routes/user.js'));


//verify middleware
//check the header for the access token, verify if it is valid
//if the token is valid continue, else leave with 401
const verify = (req, res, next) => {
    console.log("verify")
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

//list that contains the list of active refreshTokens in the server memory
let refreshTokens = [];

//function that generates the access tokens
function generateAccessToken(user){
    return jwt.sign({id:user.id, isAdmin:user.isAdmin}, "mysecretkey", {expiresIn: "5s"});
}

//function that generates the refresh token
function generateRefreshToken(user) {
    return jwt.sign({id:user.id, isAdmin:user.isAdmin}, "myrefreshsecretkey");
}

//function that updates expired accessTokens
//takes refreshtoken as body
//verify the token, if it is valid send a new token pair to the user
app.post("/api/refresh", (req, res)=>{
    const refreshToken = req.body.token;
    if(!refreshToken) return res.status(401).json("You are not authenticated");
    //check if token is in the list
    if(!refreshTokens.includes(refreshToken)){
        return res.status(403).json("JWT is not valid");
    }
    jwt.verify(refreshToken, "myrefreshsecretkey", (err, user)=> {
        err && console.log("1 " + err);
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.push(newRefreshToken);
        res.status(200).json({
            accessToken: newAccessToken, refreshToken:  newRefreshToken
        })
    })
})

app.post("/api/refreshdb",  async(req, res)=>{
    console.log("refreshdb")
    const refreshToken = req.body.token;
    if(!refreshToken){
        console.log("no refresh token")
        return res.status(401).json("You are not authenticated");
    } 
    try{
        const refreshTokenDB = await RefreshToken.findOne({value: refreshToken}).exec();
        if(!refreshTokenDB){
            console.log("jwt not valid")
            return res.status(403).json("JWT is not valid");
        } 
    } catch(error){
        console.log("3 " + error);
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
            console.log("6 " + error);
        }

    })
})

app.post("/api/loginJWT", verify, function(request, response){
    const accessToken = request.body.token;
    let userid = jwt.decode(accessToken).id;
    const user = users.find(u=>{
        return u.id === userid
    })
    if(user){
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        response.status(200).json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken: accessToken,
            refreshToken: refreshToken
        })
    }
    response.status(400).json("Invalid token")
})

app.post("/api/loginJWTdb", verify, async function(req, res){
    console.log("loginjwtdb")
    const accessToken = req.body.token;
    let userid = jwt.decode(accessToken).id;
    try{
        const user = await User.findById(userid).exec();
        if(user){
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            // const refreshTokenDB = new RefreshToken({value: refreshToken});
            // refreshTokenDB.save(function(err){
            //     if(err){
            //         console.log(err)
            //     }
            // })
            res.status(200).json({
                username: user.username,
                isAdmin: user.isAdmin,
                accessToken: accessToken,
                refreshToken: refreshToken
            })
        } else {
            res.status(400).json("invalid token");
        }
    } catch (error){
        console.log(error);
    }
})

//login method
//fetch user info from url, search if there is one matching in the "database"
//if there is a user, generate a token pair and send infos to the client
app.post("/api/login", (req, res) =>{
    const {username, password} = req.body;
    const user = users.find(u=>{
        return u.username === username && u.password === password
    });
    if(user){
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken: accessToken,
            refreshToken: refreshToken
        })
    } else {
        res.status(400).json("Username or password incorrect");
    }
})

app.post("/api/logindb", async function(req, res){
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
                username: user.username,
                isAdmin: user.isAdmin,
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



//logout method
//Run verify middleware, then removes refreshtoken from the active list
app.post("/api/logout", verify, (req, res)=>{
    console.log("logout attempt")
    const refreshToken = req.body.token;
    refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json("Log out successfully");
})

app.post("/api/logoutdb", verify, async (req, res) =>{
    console.log("logoutdb attempt");
    const refreshToken = req.body.token;
    try{
        await RefreshToken.deleteOne({value: refreshToken});
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