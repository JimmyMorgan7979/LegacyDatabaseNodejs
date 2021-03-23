const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  nameFirst: {
    type: String,
    required: true
  },
  nameLast: {
      type: String,
      required: true
    },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  token: {
      type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', UserSchema)

module.exports = User