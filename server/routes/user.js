const express = require('express');
const router = express.Router();
const User = require('../models/user');

//get all
router.get('/', async (req, res) =>{
    try {
        const users = await User.find();
        console.log(users);
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
        const user = await User.findOne({ username: 'corentin' }).exec();
        res.status(200).json(user)
    } catch(error){
        res.status(500).json({message: error.message})
    }
})


//create one
router.post('/', (req, res) =>{
    
})

//update one
router.patch('/:id', (req, res) =>{
    
})
//delete one
router.delete('/:id', (req, res) =>{
    
})

module.exports = router;