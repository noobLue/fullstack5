const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async(req, res) => {
    const blogs = await Blog.find({}).populate('user', {user: 1, name: 1, id: 1})
    res.json(blogs)
})

blogsRouter.post('/', async (req, res) => {
    const {title, author, url, likes} = req.body

    if(!req.user)
        return res.status(401).json({error: 'invalid token'})
    
    const user = await User.findById(req.user)

    let newBlog = new Blog({
        title,
        author,
        url,
        likes,
        user: user.id
    })

    let savedBlog = await newBlog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    await savedBlog.populate('user', {user: 1, name: 1, id: 1})
    // Alternative: (requires to remove blogs array from user)
    // savedBlog.user = user

    res.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (req, res) => {
    const blogId = req.params.id
    const blog = await Blog.findById(blogId)

    if(!req.user || blog.user.toString() !== req.user.toString())
    {
        return res.status(401).json({error: 'user does not match blog owner'})
    }

    await Blog.findByIdAndDelete(blogId)
    res.status(204).end()
})

blogsRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    const blog = {
        title: req.body.title,
        author: req.body.author,
        url: req.body.url,
        likes: req.body.likes,
        user: req.body.user
    }
    
    const oldBlog = await Blog.findById(id)

    // Removed so users can like other users blogs
    /*if(!req.user || oldBlog.user.toString() !== req.user.toString())
    {
        return res.status(401).json({error: 'user does not match blog owner'})
    }*/

    const settings = { new: true, runValidators: true, context: 'query' }

    const newBlog = await Blog.findByIdAndUpdate(id, blog, settings)

    await newBlog.populate('user', {user: 1, name: 1, id: 1})

    res.status(201).json(newBlog)
})


module.exports = blogsRouter