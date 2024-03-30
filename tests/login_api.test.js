const User = require('../models/user')
const testHelper = require('./test_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const {test, beforeEach, describe, after} = require('node:test')
const assert = require('node:assert')


describe('when there is user in db', async () => {
    beforeEach(async ()=>{
        await User.deleteMany({})

        // root:sekret
        const user = await testHelper.getInitialUser()
        await user.save()
    })

    test('user can get token', async () => {
        const firstUser = 'root'
        const firstPass = 'sekret'
        const firstName = 'Anttoni'

        const res = await api.post('/api/login')
                .send({username: firstUser, password: firstPass})
                .expect(200)
                .expect('Content-Type', /application\/json/)

        assert(res.body.token)
        assert.strictEqual(res.body.username, firstUser)
        assert.strictEqual(res.body.name, firstName)
    })

    test('user doesnt get token', async () => {
        const firstUser = 'root'
        const firstPass = 'wrongpassword'
        const firstName = 'Anttoni'

        const res = await api.post('/api/login')
                .send({username: firstUser, password: firstPass})
                .expect(400)
                .expect('Content-Type', /application\/json/)

        assert(res.body.error.includes('password not found'))
    })
})

after(async ()=>{
    await mongoose.connection.close()
})