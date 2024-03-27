const {test, describe} = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')


test('dummy returns one', ()=>{
    assert.strictEqual(listHelper.dummy([]),1)
})
