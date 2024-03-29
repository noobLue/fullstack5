const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.get('/', async(req, res) => {
    const users = await User.find({}).populate('blogs', {url:1, author: 1, title: 1, id: 1})
    res.json(users)
})

userRouter.post('/', async (req, res) => {
    const {user, name, password} = req.body

    const pwLen = 3;

    if(!password)
        return res.status(400).json({error: '`password` is required'})
    if(password.length < 3)
        return res.status(400).json({error: `\`password\`is shorter than the minimum allowed length (${pwLen})`})

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = new User({user, name, passwordHash, blogs: []})
    const savedUser = await (newUser).save()
    res.status(201).json(savedUser)
})


module.exports = userRouter