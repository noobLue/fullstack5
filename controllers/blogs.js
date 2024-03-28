const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async(request, response) => {
    response.json(await Blog.find({}))
})

blogsRouter.post('/', async (request, response) => {
    const result = await (new Blog(request.body)).save()
    response.status(201).json(result)
})


module.exports = blogsRouter