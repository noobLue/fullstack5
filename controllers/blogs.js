const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async(req, res) => {
    const blogs = await Blog.find({}).populate('user', {user: 1, name: 1, id: 1})
    res.json(blogs)
})

blogsRouter.post('/', async (req, res) => {
    const {title, author, url, likes} = req.body
    const user = await User.findOne({})

    let newBlog = new Blog({
        title,
        author,
        url,
        likes,
        user: user.id
    })

    const savedBlog = await newBlog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    res.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

blogsRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    const blog = {
        title: req.body.title,
        author: req.body.author,
        url: req.body.url,
        likes: req.body.likes
    }

    const settings = { new: true, runValidators: true, context: 'query' }

    const newBlog = await Blog.findByIdAndUpdate(id, blog, settings)
    res.status(201).json(newBlog)
})


module.exports = blogsRouter