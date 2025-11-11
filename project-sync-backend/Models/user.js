const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['manager', 'developer'],
        required: true
    },
    status: {
        type: String,
        enum: ['Enable', 'Disable'],
        default: 'Enable'
    },
    date: {
        type: Date,
        default: new Date().toISOString()
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
})

const User = mongoose.model('User', userSchema)
module.exports = User 