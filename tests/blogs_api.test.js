const {test, after, beforeEach, describe} = require('node:test')
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

describe('When some blogs exist', async ()=>{

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


    describe('When adding blogs', async () => {
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
    })
    
    describe('when manipulating an existing blog', async () => {
        test('can delete a blog', async () => {
            const blogs = await testHelper.getBlogs()
            const lastBlog = blogs[blogs.length - 1]
            await api.delete(`/api/blogs/${lastBlog.id}`).expect(204)
        
            const blogsAfter = await testHelper.getBlogs()
            assert.strictEqual(blogsAfter.length, blogs.length - 1)
        
            const idsAfter = blogsAfter.map(b => b.id)
            assert(!idsAfter.includes(lastBlog.id))
        })
        
        test('can update a blog', async () => {
            const blogs = await testHelper.getBlogs()
            const firstBlog = blogs[0]
        
            const newBlog = {
                ...firstBlog,
                likes: 99
            }
        
            await api.put(`/api/blogs/${firstBlog.id}`)
                .send(newBlog)
                .expect(201)
        
            const blogsAfter = await testHelper.getBlogs()
           
            
            assert.strictEqual(blogsAfter.length, blogs.length)
        
            assert.strictEqual(blogsAfter[0].likes, 99)
            assert.notStrictEqual(blogsAfter[0].likes, firstBlog.likes)
        }) 
    })

})

after(async ()=>{
    await mongoose.connection.close()
})