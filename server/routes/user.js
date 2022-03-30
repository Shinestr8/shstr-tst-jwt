const express = require('express');
const router = express.Router();
const User = require('../models/newUser');
const {encrypt} = require('../tool/password')

//get all
router.get('/', async (req, res) =>{
    try {
        const users = await User.find();
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//get one
router.get('/:username', async (req, res) =>{
    const username = req.params.username;
    // res.status(200).send(username)
    try{
        const user = await User.findOne({ username: username }).exec();
        res.status(200).json(user)
    } catch(error){
        res.status(500).json({message: error.message})
    }
})


//create one
router.post('/', async (req, res) =>{
    const {username, password} = req.body;
    if(!username || !password){
        res.status(401).json({message: "Missing username and/or password"});
    }
    if(password.length < 8){
        res.status(401).json({message: "Password is too short"});
    }
    try {
        const user = await User.findOne({username: username})
        if(user){
            res.status(401).json({message: "Username already picked"});
        } else {
            const [salt,hash] = encrypt(password);
            const newUser = new User({username: username, hash: hash, salt: salt, isAdmin: false});
            newUser.save(function(err){
                if(err) {
                    console.log(err);
                    res.status(500).send("An error occured while saving this user");
                }
            })
        }
    } catch (error) {
        console.log(error);
    }
    res.status(201).json("New user created successfully");
})

//update one
router.patch('/:id', (req, res) =>{
    
})
//delete one
router.delete('/:id', (req, res) =>{
    
})

module.exports = router;