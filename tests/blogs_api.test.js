const {test, after, beforeEach} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const testHelper = require('./test_helper')

beforeEach(async () => {
    await Blog.deleteMany({})

    for(const b of testHelper.initBlogs)
        await (new Blog(b)).save()
})

test('blogs are returned as json', async () => {
    await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('correct amount of blogs', async () => {
    const res = await api.get('/api/blogs')

    assert.strictEqual(res.body.length, testHelper.initBlogs.length)
})

test('has id property', async () => {
    const res = await api.get('/api/blogs')
    const firstBlog = res.body[0]

    assert.strictEqual(firstBlog.hasOwnProperty('id'), true)
})

test('a blog is correctly added', async () => {
    const blog = {
        'title': 'Stonebaked door',
        'author': 'Georgia stonemason',
        'url': 'localhost',
        'likes': 5
    }

    await api.post('/api/blogs')
        .send(blog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogs = await testHelper.getBlogs()

    assert.strictEqual(blogs.length, testHelper.initBlogs.length + 1)

    assert.strictEqual(blogs[testHelper.initBlogs.length].title, blog.title)
})

test('likes are defaulted to 0', async () => {
    const blog = {
        'title': 'Stonebaked door',
        'author': 'Georgia stonemason',
        'url': 'localhost'
    }

    await api.post('/api/blogs')
        .send(blog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

        const blogs = await testHelper.getBlogs()

    assert.strictEqual(blogs[testHelper.initBlogs.length].likes, 0)
})

test('missing title is not added', async () => {
    const blog = {
        'author': 'Georgia stonemason',
        'url': 'localhost',
        'likes': 5
    }

    await api.post('/api/blogs')
        .send(blog)
        .expect(400)
})

test('missing url is not added', async () => {
    const blog = {
        'title': 'Stonebaked door',
        'author': 'Georgia stonemason',
        'likes': 5
    }

    await api.post('/api/blogs')
        .send(blog)
        .expect(400)
})

after(async ()=>{
    await mongoose.connection.close()
})