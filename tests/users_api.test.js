const User = require('../models/user')
const testHelper = require('./test_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const {test, beforeEach, describe, after} = require('node:test')
const assert = require('node:assert')




describe('When db is empty', async () => {
    beforeEach(async ()=>{
        await User.deleteMany({})
    })

    test('empty user is not created', async () => {
        
        const existingUsers = await testHelper.getUsers()
        assert.strictEqual(existingUsers.length, 0)
        

        await api.post('/api/users')
                .send({})
                .expect(400)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()
        assert.strictEqual(newUsers.length, existingUsers.length)
    })
})

describe('When there is already a user in the database', async () => {
    beforeEach(async ()=>{
        await User.deleteMany({})
    
        const user = await testHelper.getInitialUser()
        await user.save()
    })

    test('can query users', async () => {
        const res = await api.get('/api/users')
    
        assert.strictEqual(res.body.length, 1)
        assert.strictEqual(res.body[0].user, 'root')
    })

    test('can create new unique user', async () => {
        const existingUsers = await testHelper.getUsers()

        const user = {user: 'jack', name: 'Jack', password: 'hunter2'}

        const res = await api.post('/api/users')
                .send(user)
                .expect(201)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()
        assert.strictEqual(newUsers.length, existingUsers.length + 1)
        
        assert.strictEqual(newUsers[newUsers.length-1].user, user.user)
        assert.strictEqual(newUsers[newUsers.length-1].name, user.name)
        assert(newUsers[newUsers.length-1].hasOwnProperty('id'))

        assert.strictEqual(res.body.user, user.user)
        assert.strictEqual(res.body.name, user.name)
        assert(res.body.hasOwnProperty('id'))
        
        assert.strictEqual(res.body.id, newUsers[newUsers.length-1].id)
    })
    
    test('creating duplicate user fails', async () => {
        const existingUsers = await testHelper.getUsers()

        const user = {user: 'root', name: 'Jack', password: 'hunter2'}

        const res = await api.post('/api/users')
                .send(user)
                .expect(400)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()

        assert.strictEqual(newUsers.length, existingUsers.length)
        assert.deepStrictEqual(newUsers[newUsers.length - 1], existingUsers[existingUsers.length -1])
        assert(res.body.error.includes('username must be unique'))
    })

    test('username must be given', async () => {
        const existingUsers = await testHelper.getUsers()

        const user = {name: 'Jack', password: 'hunter2'}

        const res = await api.post('/api/users')
                .send(user)
                .expect(400)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()

        assert.strictEqual(newUsers.length, existingUsers.length)
        assert.deepStrictEqual(newUsers[newUsers.length - 1], existingUsers[existingUsers.length -1])
        assert(res.body.error.includes('`user` is required'))
    })

    test('password must be given', async () => {
        const existingUsers = await testHelper.getUsers()

        const user = {user:'jack', name: 'Jack'}

        const res = await api.post('/api/users')
                .send(user)
                .expect(400)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()

        assert.strictEqual(newUsers.length, existingUsers.length)
        assert.deepStrictEqual(newUsers[newUsers.length - 1], existingUsers[existingUsers.length -1])
        assert(res.body.error.includes('`password` is required'))
    })

    test('username of length is accepted', async () => {
        const existingUsers = await testHelper.getUsers()

        const user = {user:'jak', name: 'Jack', password: "hunterorbehunted"}

        const res = await api.post('/api/users')
                .send(user)
                .expect(201)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()
        assert.strictEqual(newUsers.length, existingUsers.length + 1)
        
        assert.strictEqual(newUsers[newUsers.length-1].user, user.user)
        assert.strictEqual(newUsers[newUsers.length-1].name, user.name)
        assert(newUsers[newUsers.length-1].hasOwnProperty('id'))
    })

    test('username cant be shorter than ', async () => {
        const existingUsers = await testHelper.getUsers()

        const user = {user:'jk', name: 'Jack', password: "hunterorbehunted"}

        const res = await api.post('/api/users')
                .send(user)
                .expect(400)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()

        assert.strictEqual(newUsers.length, existingUsers.length)
        assert.deepStrictEqual(newUsers[newUsers.length - 1], existingUsers[existingUsers.length -1])
        assert(res.body.error.includes('is shorter than the minimum allowed length ('))
    })

    test('password of length is accepted', async () => {
        const existingUsers = await testHelper.getUsers()

        const user = {user:'george', name: 'Gearge Washingmachine', password: "hun"}

        const res = await api.post('/api/users')
                .send(user)
                .expect(201)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()
        assert.strictEqual(newUsers.length, existingUsers.length + 1)
        
        assert.strictEqual(newUsers[newUsers.length-1].user, user.user)
        assert.strictEqual(newUsers[newUsers.length-1].name, user.name)
        assert(newUsers[newUsers.length-1].hasOwnProperty('id'))
    })

    test('password cant be shorter than ', async () => {
        const existingUsers = await testHelper.getUsers()

        const user = {user:'jack', name: 'Jack', password: "hu"}

        const res = await api.post('/api/users')
                .send(user)
                .expect(400)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()

        assert.strictEqual(newUsers.length, existingUsers.length)
        assert.deepStrictEqual(newUsers[newUsers.length - 1], existingUsers[existingUsers.length -1])
        assert(res.body.error.includes('is shorter than the minimum allowed length ('))
    })
    
    test('user has blogs array ', async () => {
        const user = {user:'jack', name: 'Jack', password: "hunter2"}

        const res = await api.post('/api/users')
                .send(user)
                .expect(201)
                .expect('Content-Type', /application\/json/)

        const newUsers = await testHelper.getUsers()
        assert.deepStrictEqual(newUsers[newUsers.length - 1].blogs, [])
    })
})


after(async ()=>{
    await mongoose.connection.close()
})