const {test, after, beforeEach, describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const testHelper = require('./test_helper')



beforeEach(async () => {
    await User.deleteMany({})

    const user = await testHelper.getInitialUser()
    await user.save()


    await Blog.deleteMany({})

    for(const b of testHelper.initBlogs)
    {
        const blog = {...b, user: user.id}
        await (new Blog(blog)).save()
    }
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
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
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
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
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
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(blog)
                .expect(400)
        })
        
        test('missing url is not added', async () => {
            const oldBlogs = await testHelper.getBlogs()

            const blog = {
                'title': 'Stonebaked door',
                'author': 'Georgia stonemason',
                'likes': 5
            }
        
            await api.post('/api/blogs')
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(blog)
                .expect(400)
        })

        test('blog has user', async () => {
            const blog = {
                'title': 'Stonebaked door',
                'url': 'test',
                'author': 'Georgia stonemason',
                'likes': 5
            }
        
            await api.post('/api/blogs')
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(blog)
                .expect(201)

            const newBlogs = await testHelper.getBlogs()

            assert(newBlogs[newBlogs.length - 1].hasOwnProperty('user'))
        })

        test('blogs user is populated', async () => {
            const blog = {
                'title': 'Stonebaked door',
                'url': 'test',
                'author': 'Georgia stonemason',
                'likes': 5
            }
            
            await api.post('/api/blogs')
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(blog)
                .expect(201)

            const res = await api.get('/api/blogs')
            const blogs = res.body

            assert(blogs[blogs.length - 1].user.user)
            assert(blogs[blogs.length - 1].user.name)
        })

        test('post returns user info in blog', async () => {
            const blog = {
                'title': 'Stonebaked door',
                'url': 'test',
                'author': 'Georgia stonemason',
                'likes': 5
            }
            
            const res = await api.post('/api/blogs')
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(blog)
                .expect(201)

            assert.strictEqual(res.body.user.user, "root")
            assert.strictEqual(res.body.user.name, "Anttoni")
        })


        test('blogs user doesnt have passwordHash', async () => {
            const blog = {
                'title': 'Stonebaked door',
                'url': 'test',
                'author': 'Georgia stonemason',
                'likes': 5
            }
            
            await api.post('/api/blogs')
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(blog)
                .expect(201)

            const res = await api.get('/api/blogs')
            const blogs = res.body


            assert(blogs[blogs.length - 1].user)
            assert(blogs[blogs.length - 1].user.hasOwnProperty('user'))
            assert(!blogs[blogs.length - 1].user.hasOwnProperty('passwordHash'))
        })

        test('blog gets added to user', async () => {
            const oldRes = await api.get('/api/users')
            const oldUsers = oldRes.body

            const blog = {
                'title': 'Neubook',
                'url': 'test',
                'author': 'Georgia stonemason',
                'likes': 5
            }
            
            const resBlog = await api.post('/api/blogs')
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(blog)
                .expect(201)

            const res = await api.get('/api/users')
            const users = res.body

            assert.strictEqual(users[users.length - 1].blogs.length, oldUsers[oldUsers.length -1].blogs.length + 1)

            const myBlogs = users[users.length - 1].blogs
            assert.strictEqual(myBlogs[myBlogs.length-1].id, resBlog.body.id)
        })


        describe('authentication', async () => {
            test('blog cant be added without authentication', async () => {
                const blog = {
                    'title': 'Stonebaked door',
                    'author': 'Georgia stonemason',
                    'url': 'localhost',
                    'likes': 5
                }
    
                const res = await api.post('/api/blogs')
                    .send(blog)
                    .expect(401)
                    .expect('Content-Type', /application\/json/)
            })
            
            test('blog cant be added without proper authorization', async () => {
                const blog = {
                    'title': 'Stonebaked door',
                    'author': 'Georgia stonemason',
                    'url': 'localhost',
                    'likes': 5
                }
    
                const res = await api.post('/api/blogs')
                    .set('Authorization', `Bearer fakeToken`)
                    .send(blog)
                    .expect(400)
                    .expect('Content-Type', /application\/json/)
            
                const blogs = await testHelper.getBlogs()
            
                assert.strictEqual(blogs.length, testHelper.initBlogs.length)
                assert(res.body.error.includes('token missing or invalid'))
            })
    
            test('blog cant be added without proper authorization 2', async () => {
                const blog = {
                    'title': 'Stonebaked door',
                    'author': 'Georgia stonemason',
                    'url': 'localhost',
                    'likes': 5
                }
    
                const res = await api.post('/api/blogs')
                    .set('Authorization', `Bearer ${await testHelper.getInvalidToken()}`)
                    .send(blog)
                    .expect(400)
                    .expect('Content-Type', /application\/json/)
            
                const blogs = await testHelper.getBlogs()
            
                assert.strictEqual(blogs.length, testHelper.initBlogs.length)
                assert(res.body.error.includes('malformatted id'))
            })
    
            test('blog cant be added with expired authorization', async () => {
                const blog = {
                    'title': 'Stonebaked door',
                    'author': 'Georgia stonemason',
                    'url': 'localhost',
                    'likes': 5
                }
    
                const res = await api.post('/api/blogs')
                    .set('Authorization', `Bearer ${await testHelper.getExpiredToken()}`)
                    .send(blog)
                    .expect(401)
                    .expect('Content-Type', /application\/json/)
            
                const blogs = await testHelper.getBlogs()
            
                assert.strictEqual(blogs.length, testHelper.initBlogs.length)
                assert(res.body.error.includes('token expired'))
            })
    
            test('authenticated user is designed as the creator', async () => {
                const user = {user: 'jack', name: 'Jack', password: 'hunter2'}
    
                const res = await api.post('/api/users')
                    .send(user)
                    .expect(201)
                    .expect('Content-Type', /application\/json/)
    
                const token = testHelper.getUserToken({user: res.body.user, id: res.body.id})
    
                const blog = {
                    'title': 'Jacks diary',
                    'author': 'Jack',
                    'url': 'jacknickels.fakeaddress',
                    'likes': 0
                }
                const oldBlogs = await testHelper.getBlogs()
                const resBlog = await api.post('/api/blogs')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(201)
                    .expect('Content-Type', /application\/json/)
    
                const newBlogs = await testHelper.getBlogs()
    
                assert.strictEqual(newBlogs.length, oldBlogs.length + 1)
                assert.strictEqual(resBlog.body.user.id, res.body.id)
            })
        })
    })
    
    describe('when manipulating an existing blog', async () => {
        test('can delete a blog', async () => {
            const blogs = await testHelper.getBlogs()
            const lastBlog = blogs[blogs.length - 1]
            await api.delete(`/api/blogs/${lastBlog.id}`)
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .expect(204)
        
            const blogsAfter = await testHelper.getBlogs()
            assert.strictEqual(blogsAfter.length, blogs.length - 1)
        
            const idsAfter = blogsAfter.map(b => b.id)
            assert(!idsAfter.includes(lastBlog.id))
        })

        test('cant delete a blog without authentication', async () => {
            const blogs = await testHelper.getBlogs()
            const lastBlog = blogs[blogs.length - 1]
            await api.delete(`/api/blogs/${lastBlog.id}`)
                .expect(401)
        
            const blogsAfter = await testHelper.getBlogs()
            assert.strictEqual(blogsAfter.length, blogs.length)
        
            const idsAfter = blogsAfter.map(b => b.id)
            assert(idsAfter.includes(lastBlog.id))
        })
        
        test('can update a blog', async () => {
            const blogs = await testHelper.getBlogs()
            const firstBlog = blogs[0]
        
            const newBlog = {
                ...firstBlog,
                likes: 99
            }
        
            await api.put(`/api/blogs/${firstBlog.id}`)
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(newBlog)
                .expect(201)
        
            const blogsAfter = await testHelper.getBlogs()
           
            
            assert.strictEqual(blogsAfter.length, blogs.length)
        
            assert.strictEqual(blogsAfter[0].likes, 99)
            assert.notStrictEqual(blogsAfter[0].likes, firstBlog.likes)
        }) 

        test('cant update a blog without authentication', async () => {
            const blogs = await testHelper.getBlogs()
            const firstBlog = blogs[0]
        
            const newBlog = {
                ...firstBlog,
                likes: 99
            }
        
            await api.put(`/api/blogs/${firstBlog.id}`)
                .send(newBlog)
                .expect(401)
        
            const blogsAfter = await testHelper.getBlogs()
           
            
            assert.strictEqual(blogsAfter.length, blogs.length)
        
            assert.notStrictEqual(blogsAfter[0].likes, 99)
            assert.strictEqual(blogsAfter[0].likes, firstBlog.likes)
        }) 

        test('put returns user info in blog', async () => {
            const blogs = await testHelper.getBlogs()
            const firstBlog = blogs[0]
        
            const newBlog = {
                ...firstBlog,
                likes: 99
            }
        
            const res = await api.put(`/api/blogs/${firstBlog.id}`)
                .set('Authorization', `Bearer ${await testHelper.getInitialToken()}`)
                .send(newBlog)
                .expect(201)

            assert.strictEqual(res.body.user.user, 'root')
            assert.strictEqual(res.body.user.name, 'Anttoni')
        })
    })

})

after(async ()=>{
    await mongoose.connection.close()
})