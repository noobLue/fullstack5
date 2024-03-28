const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async(req, res) => {
    res.json(await Blog.find({}))
})

blogsRouter.post('/', async (req, res) => {
    const blog = await (new Blog(req.body)).save()
    res.status(201).json(blog)
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