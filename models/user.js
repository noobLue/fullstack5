
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    user: {type: String, required: true, unique: true, minLength: 3},
    name: {type: String, required: true},
    passwordHash: {type: String, required: true},
    blogs: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'Blog'}
    ]
})


userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString(),
      delete returnedObject._id,
      delete returnedObject.__v
      delete returnedObject.passwordHash
    }
  })


module.exports = mongoose.model('User', userSchema)