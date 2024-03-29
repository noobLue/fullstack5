const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.get('/', async(req, res) => {
    res.json(await User.find({}))
})

userRouter.post('/', async (req, res) => {
    const {user, name, password} = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = new User({user, name, passwordHash})
    const savedUser = await (newUser).save()
    res.status(201).json(savedUser)
})


module.exports = userRouter