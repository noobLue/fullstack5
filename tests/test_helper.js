const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const initBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5
    },
    {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12
    },
    {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10
    },
    {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0
    },
    {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    }  
]

const getInitialUser = async () => {
    const passwordHash = await bcrypt.hash('sekret', 10)
    return new User({user: 'root', name: 'Anttoni', passwordHash})
}

const getUserToken = (user) => {
    return jwt.sign({username: user.user, id: user.id}, process.env.SECRET)
}

const getDatabase = async (db) => {
    const values = await db.find({})
    return values.map(v => v.toJSON())
}

const getInitialToken = async () => {
    const user = (await getDatabase(User))[0]
    return getUserToken(user)
}

const getInvalidToken = async () => {
    return jwt.sign({username: 'root', id: '1'}, process.env.SECRET)
}

const getExpiredToken = async () => {
    const user = (await getDatabase(User))[0]
    return jwt.sign({username: user.user, id: user._id}, process.env.SECRET, { expiresIn: 0})
}

const getBlogs = async () => {
    return await getDatabase(Blog)
}

const getUsers = async () => {
    return await getDatabase(User)
}

module.exports = { initBlogs, getBlogs, getUsers, getInitialUser, getUserToken, getInitialToken, getInvalidToken, getExpiredToken }