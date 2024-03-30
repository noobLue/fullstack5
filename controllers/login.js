const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')


loginRouter.post('/', async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({user: username})

    const passwordCorrect = user ? await bcrypt.compare(password, user.passwordHash) : false

    if(!passwordCorrect)
        return res.status(400).json({error: 'username or password not found'})

    const token = jwt.sign({username: user.user, id: user._id}, process.env.SECRET, { expiresIn: 3600})

    res.status(200).send({token, username: user.user, name: user.name})
})


module.exports = loginRouter